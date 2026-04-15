import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — lightweight dashboard data (supplements the server component)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const [user, progress, difficultWordsCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        streakCount: true,
        totalXP: true,
        level: true,
        onboardingDone: true,
      },
    }),
    prisma.userProgress.findMany({
      where: { userId },
      include: { topic: true },
    }),
    prisma.difficultWord.count({ where: { userId, isMastered: false } }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const topicLessonCounts = await prisma.lesson.groupBy({
    by: ["topicId"],
    where: { isPublished: true },
    _count: { id: true },
  });
  const countMap = Object.fromEntries(
    topicLessonCounts.map((t) => [t.topicId, t._count.id])
  );

  const topicsProgress = progress.map((p) => ({
    topicId: p.topicId,
    topicName: p.topic.name,
    topicIcon: p.topic.icon,
    topicSlug: p.topic.slug,
    lessonsCompleted: p.lessonsCompleted,
    totalLessons: countMap[p.topicId] ?? 0,
    avgPronunciation: p.avgPronunciation,
  }));

  return NextResponse.json({
    streakCount: user.streakCount,
    totalXP: user.totalXP,
    level: user.level,
    difficultWordsCount,
    topicsProgress,
  });
}
