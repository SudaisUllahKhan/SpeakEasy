import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = { title: "Topics" };

const TOPIC_GRADIENTS = [
  { card: "from-indigo-500 to-violet-600",   bg: "bg-indigo-50",   ring: "ring-indigo-200" },
  { card: "from-emerald-500 to-teal-600",    bg: "bg-emerald-50",  ring: "ring-emerald-200" },
  { card: "from-rose-500 to-pink-600",       bg: "bg-rose-50",     ring: "ring-rose-200" },
  { card: "from-amber-500 to-orange-600",    bg: "bg-amber-50",    ring: "ring-amber-200" },
  { card: "from-cyan-500 to-blue-600",       bg: "bg-cyan-50",     ring: "ring-cyan-200" },
  { card: "from-purple-500 to-indigo-600",   bg: "bg-purple-50",   ring: "ring-purple-200" },
  { card: "from-teal-500 to-emerald-600",    bg: "bg-teal-50",     ring: "ring-teal-200" },
  { card: "from-orange-500 to-red-600",      bg: "bg-orange-50",   ring: "ring-orange-200" },
  { card: "from-sky-500 to-cyan-600",        bg: "bg-sky-50",      ring: "ring-sky-200" },
  { card: "from-fuchsia-500 to-purple-600",  bg: "bg-fuchsia-50",  ring: "ring-fuchsia-200" },
];

export default async function TopicsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [topics, progressRows, lessonCounts] = await Promise.all([
    prisma.topic.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.userProgress.findMany({ where: { userId } }),
    prisma.lesson.groupBy({
      by: ["topicId"],
      where: { isPublished: true },
      _count: { id: true },
    }),
  ]);

  const progressMap = new Map(progressRows.map((p) => [p.topicId, p]));
  const countMap    = new Map(lessonCounts.map((lc) => [lc.topicId, lc._count.id]));

  return (
    <AppShell title="Topics">
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-8">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-black text-[var(--color-text)]">All topics</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {topics.length} topics · choose one to start practising
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {topics.map((topic, idx) => {
            const progress = progressMap.get(topic.id);
            const total    = countMap.get(topic.id) ?? 0;
            const done     = progress?.lessonsCompleted ?? 0;
            const pct      = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
            const colors   = TOPIC_GRADIENTS[idx % TOPIC_GRADIENTS.length];
            const mastered = pct === 100;

            return (
              <Link key={topic.id} href={`/topics/${topic.slug}`}>
                <div
                  className="rounded-2xl bg-white border border-[var(--color-border)] overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-200 h-full"
                  style={{ boxShadow: "0 2px 8px rgba(79,70,229,0.07)" }}
                >
                  {/* Gradient header */}
                  <div className={`bg-gradient-to-br ${colors.card} p-4 flex items-center justify-between`}>
                    <div
                      className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-xl font-black text-white">
                        {topic.name.charAt(0)}
                      </span>
                    </div>
                    {mastered && (
                      <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center" aria-label="Mastered">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <div>
                      <p className="font-bold text-[var(--color-text)] text-[0.95rem] leading-snug">
                        {topic.name}
                      </p>
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">
                        {done} / {total} lessons
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-[var(--color-muted)] font-medium">
                          {mastered ? "Mastered" : pct > 0 ? "In progress" : "Not started"}
                        </span>
                        <span className="text-[11px] font-bold text-[var(--color-text)]">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${colors.card} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {topics.length === 0 && (
          <div className="rounded-2xl bg-white border border-[var(--color-border)] p-8 text-center" style={{ boxShadow: "0 2px 8px rgba(79,70,229,0.06)" }}>
            <p className="font-bold text-[var(--color-text)]">No topics yet</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Run the seed script to load topics and lessons.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
