import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMobileSession } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { nextReviewInterval, addDays } from "@/lib/utils";

// GET — words due for review today (up to 50)
export async function GET(req: NextRequest) {
  const mobileSession = await getMobileSession(req);
  const webSession = mobileSession ? null : await auth();
  const userId = mobileSession?.userId ?? webSession?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const words = await prisma.difficultWord.findMany({
    where: {
      userId,
      isMastered: false,
      nextReviewAt: { lte: new Date() },
    },
    orderBy: [{ nextReviewAt: "asc" }, { timesIncorrect: "desc" }],
    take: 50,
  });

  return NextResponse.json({ words });
}

const ReviewBody = z.object({
  wordId: z.string(),
  isCorrect: z.boolean(),
});

// POST — record review result + advance SM-2 interval
export async function POST(req: NextRequest) {
  const mobileSession = await getMobileSession(req);
  const webSession = mobileSession ? null : await auth();
  const userId = mobileSession?.userId ?? webSession?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = ReviewBody.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { wordId, isCorrect } = body.data;

  const word = await prisma.difficultWord.findFirst({
    where: { id: wordId, userId },
  });
  if (!word) {
    return NextResponse.json({ error: "Word not found" }, { status: 404 });
  }

  const newInterval = nextReviewInterval(word.interval, isCorrect);
  const isMastered = isCorrect && word.timesCorrect + 1 >= 5;

  const updated = await prisma.difficultWord.update({
    where: { id: wordId },
    data: {
      timesCorrect: isCorrect ? { increment: 1 } : word.timesCorrect,
      timesIncorrect: isCorrect ? word.timesIncorrect : { increment: 1 },
      interval: newInterval,
      nextReviewAt: addDays(new Date(), newInterval),
      isMastered,
      lastPracticedAt: new Date(),
    },
  });

  return NextResponse.json({ word: updated });
}
