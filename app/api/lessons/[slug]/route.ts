import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { withErrorHandler, UnauthorizedError, NotFoundError } from '@/lib/errors'

export const GET = withErrorHandler(async (_req, ctx) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new UnauthorizedError()

  const { slug } = (ctx as { params: { slug: string } }).params

  const lesson = await db.lesson.findUnique({
    where: { slug, isPublished: true },
    include: { topic: true },
  })
  if (!lesson) throw new NotFoundError('Lesson')

  return NextResponse.json({ data: lesson })
})
