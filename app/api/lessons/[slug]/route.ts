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

  const lesson = await db.lesson.findUnique({
    where: { slug, isPublished: true },
    include: { topic: true },
  })
  if (!lesson) throw new NotFoundError('Lesson')

  // Find next published lesson in same topic (ordered by id)
  const nextLesson = await db.lesson.findFirst({
    where: {
      topicId: lesson.topicId,
      isPublished: true,
      id: { gt: lesson.id },
    },
    orderBy: { id: 'asc' },
    select: { slug: true },
  })

  return NextResponse.json({ data: { ...lesson, nextLessonSlug: nextLesson?.slug ?? null } })
})
