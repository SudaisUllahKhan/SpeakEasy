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

        {/* ══════════════════════════════════════════════════════════════
            HERO CARD — dark floating, colorful topic-dot decoration
        ══════════════════════════════════════════════════════════════ */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(140deg, #030D1A 0%, #062035 55%, #083658 100%)",
            boxShadow: "0 8px 40px rgba(6,182,212,0.28), 0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          {/* Cyan glow top-right */}
          <div
            className="absolute -top-8 -right-8 w-44 h-44 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.32), transparent 70%)" }}
            aria-hidden="true"
          />
          {/* Sky blue glow bottom-left */}
          <div
            className="absolute -bottom-8 -left-6 w-36 h-36 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(56,189,248,0.22), transparent 70%)" }}
            aria-hidden="true"
          />

          <div className="relative px-5 pt-6 pb-5">

            {/* Top: count + label */}
            <div className="flex items-end gap-3 mb-1">
              <span
                className="text-[3.5rem] font-black leading-none"
                style={{ background: "linear-gradient(135deg, #22D3EE, #38BDF8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                {topics.length}
              </span>
              <div className="pb-2">
                <p className="text-white font-black text-xl leading-tight">Topics</p>
                <p className="text-white/40 text-xs font-medium">{totalDone} lessons completed</p>
              </div>
            </div>

            {/* Coloured topic dot row */}
            <div className="flex gap-2 flex-wrap mb-5 mt-3">
              {topics.map((t, idx) => {
                const col = TOPIC_GRADIENTS[idx % TOPIC_GRADIENTS.length];
                const prog = progressMap.get(t.id);
                const tot  = countMap.get(t.id) ?? 0;
                const pct  = tot > 0 ? Math.min(100, Math.round(((prog?.lessonsCompleted ?? 0) / tot) * 100)) : 0;
                return (
                  <div
                    key={t.id}
                    className="group relative"
                    title={`${t.name} — ${pct}%`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-white transition-transform hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${col.dot}, ${col.dot}99)`,
                        boxShadow: pct > 0 ? `0 0 8px ${col.dot}70` : "none",
                        opacity: pct === 0 ? 0.45 : 1,
                      }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    {pct === 100 && (
                      <div
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0D0A2A] flex items-center justify-center"
                        aria-label="Mastered"
                      >
                        <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
                          <path d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quote */}
            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              <p className="text-white/75 text-[0.8rem] italic leading-snug">&ldquo;{quote.text}&rdquo;</p>
              <p className="text-white/30 text-[10px] mt-1 font-medium">— {quote.attr}</p>
            </div>
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
