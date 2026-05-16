import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMobileSession } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calculateXP, calcComprehensionScore, addDays, nextReviewInterval } from "@/lib/utils";
import type { Level } from "@/types";

const Body = z.object({
  attemptId:         z.string(),
  pronunciationScore: z.number().nullable(),
  fluencyScore:       z.number().nullable(),
});

// CEO-specified pronunciation tip prompt (verbatim from spec section 7.3)
function buildTipPrompt(nativeLanguage: string): string {
  return `Given a list of words the student struggled with (each with a confidence score), select the ONE word that would most improve their overall pronunciation if corrected. Provide: the word, a phonetic guide using simple respelling (not IPA — students won't know IPA), a short tip (max 20 words) describing how to form the sound, and whether this is a common difficulty for speakers of ${nativeLanguage}. Output JSON: { word, phonetic, tip, isCommonForLanguage }`;
}

export async function POST(req: NextRequest) {
  const mobileSession = await getMobileSession(req);
  const userId = mobileSession?.userId ?? (await auth())?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { attemptId, pronunciationScore, fluencyScore } = parsed.data;

  const attempt = await prisma.lessonAttempt.findUnique({
    where: { id: attemptId, userId },
    include: {
      questionResponses: true,
      lesson: { select: { level: true, topicId: true } },
    },
  });

  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  const correctAnswers = attempt.questionResponses.filter((r) => r.isCorrect).length;
  const totalQuestions = attempt.questionResponses.length;
  const comprehensionScore = calcComprehensionScore(correctAnswers, totalQuestions);

  // XP calculation
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true, nativeLanguage: true, totalXP: true, streakCount: true, lastActiveAt: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existingAttempts = await prisma.lessonAttempt.count({
    where: { userId, lessonId: attempt.lessonId, isComplete: true },
  });
  const isRetry = existingAttempts > 0;

  const xpEarned = calculateXP(
    pronunciationScore ?? 0,
    fluencyScore ?? 0,
    comprehensionScore,
    user.level as Level,
    isRetry
  );

  // Update attempt
  await prisma.lessonAttempt.update({
    where: { id: attemptId },
    data: {
      pronunciationScore,
      fluencyScore,
      comprehensionScore,
      xpEarned,
      isComplete: true,
    },
  });

  // Update user XP
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalXP: { increment: xpEarned },
      lastActiveAt: new Date(),
    },
  });

  // Update UserProgress for this topic
  await prisma.userProgress.upsert({
    where: { userId_topicId: { userId, topicId: attempt.lesson.topicId } },
    update: {
      lessonsCompleted: { increment: isRetry ? 0 : 1 },
      avgPronunciation: pronunciationScore ?? 0,
      avgFluency: fluencyScore ?? 0,
      avgComprehension: comprehensionScore,
      lastActivityAt: new Date(),
    },
    create: {
      userId,
      topicId: attempt.lesson.topicId,
      lessonsCompleted: 1,
      avgPronunciation: pronunciationScore ?? 0,
      avgFluency: fluencyScore ?? 0,
      avgComprehension: comprehensionScore,
    },
  });

  // Update streak
  const now = new Date();
  const lastActive = user.lastActiveAt;
  let newStreak = user.streakCount;
  if (!lastActive) {
    newStreak = 1;
  } else {
    const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / 86400000);
    if (diffDays === 1) newStreak += 1;
    else if (diffDays > 1) newStreak = 1;
    // diffDays === 0 → same day, no change
  }
  await prisma.user.update({ where: { id: userId }, data: { streakCount: newStreak } });

  // Fetch difficult words for this user
  const difficultWords = await prisma.difficultWord.findMany({
    where: { userId, isMastered: false },
    orderBy: { timesIncorrect: "desc" },
    take: 5,
  });

  // SM-2: update nextReviewAt for words just encountered
  for (const dw of difficultWords) {
    const newInterval = nextReviewInterval(dw.interval, false);
    await prisma.difficultWord.update({
      where: { id: dw.id },
      data: {
        interval: newInterval,
        nextReviewAt: addDays(new Date(), newInterval),
      },
    });
  }

  // Pronunciation tip (skip in mock mode)
  let pronunciationTip = null;
  if (process.env.USE_AI_MOCK !== "true" && difficultWords.length > 0) {
    try {
      const { AzureOpenAI } = await import("openai");
      const client = new AzureOpenAI({
        endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
        apiKey: process.env.AZURE_OPENAI_KEY!,
        apiVersion: "2024-10-21",
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-4.1",
      });

      const wordList = difficultWords
        .map((w) => `${w.word} (wrong ${w.timesIncorrect}x)`)
        .join(", ");

      const result = await client.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-4.1",
        messages: [
          { role: "system", content: buildTipPrompt(user.nativeLanguage ?? "English") },
          { role: "user",   content: `Words: ${wordList}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      pronunciationTip = JSON.parse(result.choices[0].message.content ?? "null");
    } catch {
      // Non-fatal — tip is optional
    }
  } else if (process.env.USE_AI_MOCK === "true" && difficultWords.length > 0) {
    pronunciationTip = {
      word: difficultWords[0].word,
      phonetic: "see text",
      tip: "Focus on the vowel sound in the middle of this word.",
      isCommonForLanguage: true,
    };
  }

  return NextResponse.json({
    comprehensionScore,
    xpEarned,
    difficultWords,
    pronunciationTip,
  });
}
