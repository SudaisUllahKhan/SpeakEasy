import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { withErrorHandler, UnauthorizedError, NotFoundError } from '@/lib/errors'

export const GET = withErrorHandler(async (_req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new UnauthorizedError()

  const { slug } = (ctx as { params: { slug: string } }).params

  const topic = await db.topic.findUnique({ where: { slug } })
  if (!topic) throw new NotFoundError('Topic')

  const lessons = await db.lesson.findMany({
    where: { topicId: topic.id, isPublished: true },
    orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
  })

  // Attach best attempt data for the current user
  const userId = (session.user as { id: string }).id
  const attempts = await db.lessonAttempt.findMany({
    where: {
      userId,
      lessonId: { in: lessons.map((l) => l.id) },
      completedAt: { not: null },
    },
    orderBy: { createdAt: 'desc' },
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
    // Sequential unlock: first lesson always available, rest unlock after previous is done
    const available = idx === 0 || !!bestByLesson.get(lessons[idx - 1]?.id ?? '')
    return { ...lesson, completed, available, bestScores: best ?? null }
  })

  return NextResponse.json({ data, topic })
})
