import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { slug } });
  return { title: lesson?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [lesson, user] = await Promise.all([
    prisma.lesson.findUnique({
      where: { slug, isPublished: true },
      include: { topic: { select: { name: true, slug: true, icon: true } } },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { level: true, preferredAccent: true, audioSpeed: true, nativeLanguage: true },
    }),
  ]);

  if (!lesson || !user) notFound();

  return (
    <LessonPlayer
      lesson={{
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        level: lesson.level as "A1" | "A2" | "B1",
        passageText: lesson.passageText,
        audioUrl: lesson.audioUrl,
        audioUrlUK: lesson.audioUrlUK,
        topicSlug: lesson.topic.slug,
        topicName: lesson.topic.name,
        topicIcon: lesson.topic.icon,
      }}
      userPrefs={{
        level: user.level as "A1" | "A2" | "B1",
        accent: user.preferredAccent as "US" | "UK",
        audioSpeed: user.audioSpeed,
        nativeLanguage: user.nativeLanguage,
      }}
    />
  );
}
