import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { LockIcon, CheckIcon, BookOpenIcon } from "@/components/ui/Icons";

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = await prisma.topic.findUnique({ where: { slug } });
  return { title: topic?.name ?? "Topic" };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const topic = await prisma.topic.findUnique({ where: { slug } });
  if (!topic) notFound();

  const [lessons, attempts] = await Promise.all([
    prisma.lesson.findMany({
      where: { topicId: topic.id, isPublished: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.lessonAttempt.findMany({
      where: { userId, lesson: { topicId: topic.id }, isComplete: true },
      orderBy: { attemptedAt: "desc" },
    }),
  ]);

  const bestScores = new Map<string, { pronunciation: number; fluency: number; comprehension: number }>();
  for (const a of attempts) {
    const existing = bestScores.get(a.lessonId);
    if (!existing || (a.pronunciationScore ?? 0) > existing.pronunciation) {
      bestScores.set(a.lessonId, {
        pronunciation: a.pronunciationScore ?? 0,
        fluency: a.fluencyScore ?? 0,
        comprehension: a.comprehensionScore ?? 0,
      });
    }
  }

  const completedIds = new Set(attempts.map((a) => a.lessonId));
  const pct = lessons.length > 0 ? Math.round((completedIds.size / lessons.length) * 100) : 0;

  return (
    <AppShell title={topic.name} showBack backHref="/topics">
      <div className="max-w-2xl mx-auto px-4 pb-8">

        {/* Topic hero */}
        <div
          className="rounded-2xl overflow-hidden mb-5"
          style={{ background: "linear-gradient(135deg, #1A1D2E 0%, #252840 100%)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
        >
          <div className="relative px-5 pt-5 pb-5 flex items-center gap-4">
            <div className="absolute right-0 top-0 bottom-0 w-28 opacity-10" style={{ background: "radial-gradient(circle at 80% 50%, #6366F1, transparent)" }} aria-hidden="true" />
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #4F46E5, #818CF8)" }}
              aria-hidden="true"
            >
              {topic.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-white">{topic.name}</h1>
              <p className="text-white/50 text-sm mt-0.5">{completedIds.size} of {lessons.length} lessons completed</p>
              <div className="mt-2 w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: "linear-gradient(90deg, #6366F1, #34D399)" }}
                />
              </div>
            </div>
            {completedIds.size > 0 && (
              <div className="shrink-0 text-right">
                <p className="text-3xl font-black text-white">{pct}%</p>
                <p className="text-white/40 text-[10px] uppercase tracking-wide">done</p>
              </div>
            )}
          </div>
        </div>

        {/* Lesson list */}
        <div className="space-y-2.5">
          {lessons.map((lesson, index) => {
            const isCompleted = completedIds.has(lesson.id);
            const isLocked    = index > 0 && !completedIds.has(lessons[index - 1].id);
            const best        = bestScores.get(lesson.id);
            const levelVariant = lesson.level === "A1" ? "a1" : lesson.level === "A2" ? "a2" : "b1";

            const avgScore = best
              ? ((best.pronunciation + best.fluency + best.comprehension) / 3)
              : null;

            const card = (
              <div
                className={[
                  "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200",
                  isCompleted
                    ? "bg-white border-emerald-200"
                    : isLocked
                    ? "bg-[var(--color-surface-2)] border-[var(--color-border)] opacity-55"
                    : "bg-white border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:-translate-y-0.5",
                ].join(" ")}
                style={!isLocked && !isCompleted ? { boxShadow: "0 2px 8px rgba(79,70,229,0.06)" } : {}}
              >
                {/* Number / state bubble */}
                <div
                  className={[
                    "w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-black text-base",
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isLocked
                      ? "bg-slate-200 text-slate-400"
                      : "text-white",
                  ].join(" ")}
                  style={!isCompleted && !isLocked ? { background: "linear-gradient(135deg, #4F46E5, #818CF8)" } : {}}
                  aria-hidden="true"
                >
                  {isCompleted ? <CheckIcon size={20} /> : isLocked ? <LockIcon size={16} /> : index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={[
                    "font-bold text-[0.95rem] leading-snug truncate",
                    isLocked ? "text-[var(--color-muted)]" : "text-[var(--color-text)]",
                  ].join(" ")}>
                    {lesson.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant={levelVariant}>{lesson.level}</Badge>
                    {lesson.durationSeconds && (
                      <span className="text-[11px] text-[var(--color-muted)]">~{Math.round(lesson.durationSeconds / 60)} min</span>
                    )}
                    {isCompleted && (
                      <span className="text-[11px] text-emerald-600 font-semibold">Completed</span>
                    )}
                  </div>
                </div>

                {/* Score or arrow */}
                {best && avgScore !== null ? (
                  <div className="shrink-0 text-right">
                    <p className={[
                      "text-lg font-extrabold",
                      avgScore >= 7 ? "text-emerald-600" : avgScore >= 4 ? "text-amber-500" : "text-red-500"
                    ].join(" ")}>
                      {avgScore.toFixed(1)}
                    </p>
                    <p className="text-[10px] text-[var(--color-muted)]">/ 10</p>
                  </div>
                ) : !isLocked ? (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[var(--color-primary)]"
                    style={{ background: "rgba(79,70,229,0.08)" }}
                  >
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                ) : null}
              </div>
            );

            return (
              <div key={lesson.id}>
                {isLocked ? card : <Link href={`/lessons/${lesson.slug}`}>{card}</Link>}
              </div>
            );
          })}
        </div>

        {lessons.length === 0 && (
          <div className="rounded-2xl bg-white border border-[var(--color-border)] p-8 text-center" style={{ boxShadow: "0 2px 8px rgba(79,70,229,0.06)" }}>
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-muted)]" aria-hidden="true">
              <BookOpenIcon size={28} />
            </div>
            <p className="font-bold text-[var(--color-text)]">No lessons yet</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Check back soon.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
