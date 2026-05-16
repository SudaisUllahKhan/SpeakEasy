import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = { title: "Topics" };

const TOPIC_GRADIENTS = [
  { card: "from-violet-500 to-fuchsia-600",  dot: "#A855F7", shadow: "rgba(168,85,247,0.28)" },
  { card: "from-rose-500 to-pink-600",        dot: "#F43F5E", shadow: "rgba(244,63,94,0.28)"  },
  { card: "from-amber-500 to-orange-500",     dot: "#F59E0B", shadow: "rgba(245,158,11,0.28)" },
  { card: "from-cyan-500 to-sky-600",         dot: "#06B6D4", shadow: "rgba(6,182,212,0.28)"  },
  { card: "from-blue-500 to-indigo-600",      dot: "#3B82F6", shadow: "rgba(59,130,246,0.28)" },
  { card: "from-fuchsia-500 to-purple-600",   dot: "#D946EF", shadow: "rgba(217,70,239,0.28)" },
  { card: "from-emerald-500 to-teal-600",     dot: "#10B981", shadow: "rgba(16,185,129,0.28)" },
  { card: "from-red-500 to-rose-600",         dot: "#EF4444", shadow: "rgba(239,68,68,0.28)"  },
  { card: "from-sky-500 to-blue-600",         dot: "#0EA5E9", shadow: "rgba(14,165,233,0.28)" },
  { card: "from-purple-500 to-fuchsia-600",   dot: "#A855F7", shadow: "rgba(168,85,247,0.28)" },
];

const TOPIC_QUOTES = [
  { text: "Every lesson is a step closer to fluency.", attr: "SpeakEasy" },
  { text: "Curiosity is the engine of language learning.", attr: "Anonymous" },
  { text: "Small steps every day build big confidence.", attr: "SpeakEasy" },
  { text: "Pick a topic. Start a conversation. Change your life.", attr: "SpeakEasy" },
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
  const totalDone   = progressRows.reduce((s, p) => s + p.lessonsCompleted, 0);

  const d = new Date();
  const quote = TOPIC_QUOTES[(d.getDate() + d.getMonth()) % TOPIC_QUOTES.length];

  return (
    <AppShell title="Topics">
      <div className="max-w-lg mx-auto pb-10 px-4 pt-4 space-y-5">

        {/* ── Page header ────────────────────────────────────────────── */}
        <div
          className="rounded-3xl px-5 pt-6 pb-5"
          style={{ background: "linear-gradient(135deg, #E0F7FA 0%, #E8F4FF 100%)", border: "1px solid #B2EBF2" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className="text-[1.9rem] font-black leading-none tracking-tight"
                style={{ background: "linear-gradient(135deg, #06B6D4, #0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                All Topics
              </h1>
              <p className="text-[var(--color-muted)] text-xs mt-1">{topics.length} topics · {totalDone} lessons completed</p>
            </div>
            {/* Topic dot row */}
            <div className="flex gap-1.5 flex-wrap justify-end max-w-[130px]">
              {topics.map((t, idx) => {
                const col = TOPIC_GRADIENTS[idx % TOPIC_GRADIENTS.length];
                const prog = progressMap.get(t.id);
                const tot  = countMap.get(t.id) ?? 0;
                const pct  = tot > 0 ? Math.min(100, Math.round(((prog?.lessonsCompleted ?? 0) / tot) * 100)) : 0;
                return (
                  <div key={t.id} className="relative" title={`${t.name} — ${pct}%`}>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                      style={{ background: `linear-gradient(135deg, ${col.dot}, ${col.dot}cc)`, opacity: pct === 0 ? 0.35 : 1 }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    {pct === 100 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border border-white flex items-center justify-center">
                        <svg width="5" height="5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-4 border-t border-cyan-100">
            <p className="text-[var(--color-text-secondary)] text-[0.82rem] italic leading-snug">&ldquo;{quote.text}&rdquo;</p>
            <p className="text-[var(--color-muted)] text-[11px] mt-1">— {quote.attr}</p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            TOPIC GRID
        ══════════════════════════════════════════════════════════════ */}
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
                  className="rounded-2xl overflow-hidden hover:-translate-y-0.5 transition-all duration-200"
                  style={{ boxShadow: `0 4px 16px ${colors.shadow}` }}
                >
                  {/* Gradient header */}
                  <div className={`bg-gradient-to-br ${colors.card} px-4 py-3.5 flex items-center justify-between`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white/22 flex items-center justify-center shrink-0">
                        <span className="text-lg font-black text-white">{topic.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm leading-tight truncate">{topic.name}</p>
                        <p className="text-white/55 text-[10px] mt-0.5">{done}/{total} lessons</p>
                      </div>
                    </div>
                    {mastered && (
                      <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center shrink-0 ml-1" aria-label="Mastered">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.8" strokeLinecap="round">
                          <path d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Progress footer */}
                  <div className="bg-white px-4 py-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={[
                        "text-[10px] font-semibold",
                        mastered ? "text-emerald-600" : pct > 0 ? "text-[var(--color-primary)]" : "text-[var(--color-muted)]",
                      ].join(" ")}>
                        {mastered ? "Mastered" : pct > 0 ? "In progress" : "Not started"}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--color-text)]">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${colors.card} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {topics.length === 0 && (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "linear-gradient(135deg, #1A0840, #2D0F5E)", boxShadow: "0 8px 32px rgba(124,58,237,0.25)" }}
          >
            <p className="font-bold text-white">No topics yet</p>
            <p className="text-white/50 text-sm mt-1">Run the seed script to load topics and lessons.</p>
          </div>
        )}

      </div>
    </AppShell>
  );
}
