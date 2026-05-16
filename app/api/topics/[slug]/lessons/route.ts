import { NextRequest, NextResponse } from 'next/server'
import { getMobileSession } from '@/lib/mobile-auth'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { withErrorHandler, UnauthorizedError, NotFoundError } from '@/lib/errors'

export const GET = withErrorHandler(async (req, ctx) => {
  const mobileSession = await getMobileSession(req as NextRequest)
  const userId = mobileSession?.userId ?? (await getServerSession(authOptions))?.user?.id as string | undefined
  if (!userId) throw new UnauthorizedError()

  const { slug } = await (ctx as { params: Promise<{ slug: string }> }).params

  const topic = await db.topic.findUnique({ where: { slug } })
  if (!topic) throw new NotFoundError('Topic')

  const lessons = await db.lesson.findMany({
    where: { topicId: topic.id, isPublished: true },
    orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
  })

  const attempts = await db.lessonAttempt.findMany({
    where: {
      userId,
      lessonId: { in: lessons.map((l: { id: string }) => l.id) },
      isComplete: true,
    },
    orderBy: { attemptedAt: 'desc' },
  })

  const bestByLesson = new Map<
    string,
    { pronunciationScore: number | null; fluencyScore: number | null; comprehensionScore: number | null }
  >()

  for (const a of attempts) {
    if (!bestByLesson.has(a.lessonId)) {
      bestByLesson.set(a.lessonId, {
        pronunciationScore: a.pronunciationScore,
        fluencyScore: a.fluencyScore,
        comprehensionScore: a.comprehensionScore,
      })
    }
  }

  const data = lessons.map((lesson, idx) => {
    const best = bestByLesson.get(lesson.id)
    const completed = !!best
    const available = idx === 0 || !!bestByLesson.get(lessons[idx - 1]?.id ?? '')
    return { ...lesson, completed, available, bestScores: best ?? null }
  })

  return NextResponse.json({ data, topic })
})
