import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [recentAttempts, topicProgress, difficultWordsCount, user] = await Promise.all([
    prisma.lessonAttempt.findMany({
      where: { userId, isComplete: true, attemptedAt: { gte: thirtyDaysAgo } },
      orderBy: { attemptedAt: "asc" },
      include: {
        lesson: {
          select: {
            title: true,
            level: true,
            topic: { select: { name: true, slug: true } },
          },
        },
      },
    }),
    prisma.userProgress.findMany({
      where: { userId },
      include: { topic: true },
      orderBy: { lastActivityAt: "desc" },
    }),
    prisma.difficultWord.count({ where: { userId, isMastered: false } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { streakCount: true, totalXP: true, level: true, createdAt: true },
    }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Score trend for chart (last 30 days)
  const scoreTrend = recentAttempts.map((a) => ({
    date: a.attemptedAt.toISOString().split("T")[0],
    pronunciation: a.pronunciationScore,
    fluency: a.fluencyScore,
    comprehension: a.comprehensionScore,
    level: a.lesson.level,
  }));

  // Total lessons count per topic
  const topicLessonCounts = await prisma.lesson.groupBy({
    by: ["topicId"],
    where: { isPublished: true },
    _count: { id: true },
  });
  const countMap = Object.fromEntries(
    topicLessonCounts.map((t) => [t.topicId, t._count.id])
  );

  const topicsProgress = topicProgress.map((p) => ({
    topicId: p.topicId,
    topicName: p.topic.name,
    topicIcon: p.topic.icon,
    topicSlug: p.topic.slug,
    lessonsCompleted: p.lessonsCompleted,
    totalLessons: countMap[p.topicId] ?? 0,
    avgPronunciation: p.avgPronunciation,
    avgFluency: p.avgFluency,
    avgComprehension: p.avgComprehension,
    lastActivityAt: p.lastActivityAt.toISOString(),
  }));

  return NextResponse.json({
    streakCount: user.streakCount,
    totalXP: user.totalXP,
    level: user.level,
    difficultWordsCount,
    memberSince: user.createdAt.toISOString(),
    scoreTrend,
    topicsProgress,
  });
}
