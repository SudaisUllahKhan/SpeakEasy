import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMobileSession } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const mobileSession = await getMobileSession(req);
  const webSession = mobileSession ? null : await auth();
  const userId = mobileSession?.userId ?? webSession?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [topics, progress, lessonCounts] = await Promise.all([
    prisma.topic.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.userProgress.findMany({ where: { userId } }),
    prisma.lesson.groupBy({
      by: ["topicId"],
      where: { isPublished: true },
      _count: { id: true },
    }),
  ]);

  const progressMap = new Map(progress.map((p) => [p.topicId, p]));
  const countMap = new Map(lessonCounts.map((lc) => [lc.topicId, lc._count.id]));

  const result = topics.map((t) => ({
    ...t,
    lessonsCount: countMap.get(t.id) ?? 0,
    completedCount: progressMap.get(t.id)?.lessonsCompleted ?? 0,
  }));

  return NextResponse.json({ data: result, ok: true });
}
