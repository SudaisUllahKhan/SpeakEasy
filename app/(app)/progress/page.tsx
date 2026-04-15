import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import type { UserProfile } from "@/types";

export const metadata: Metadata = { title: "Progress" };

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [user, topicProgress, recentAttempts, difficultWordsCount, totalLessons] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true, name: true, email: true, image: true,
          role: true, level: true, nativeLanguage: true,
          preferredAccent: true, audioSpeed: true,
          streakCount: true, totalXP: true, onboardingDone: true,
          isPremium: true, badges: true, createdAt: true,
        },
      }),
      prisma.userProgress.findMany({
        where: { userId },
        include: { topic: true },
        orderBy: { lastActivityAt: "desc" },
      }),
      prisma.lessonAttempt.findMany({
        where: { userId, isComplete: true, attemptedAt: { gte: thirtyDaysAgo } },
        orderBy: { attemptedAt: "desc" },
        take: 50,
        select: {
          pronunciationScore: true, fluencyScore: true, comprehensionScore: true,
          attemptedAt: true,
          lesson: { select: { level: true, title: true, slug: true } },
        },
      }),
      prisma.difficultWord.count({ where: { userId, isMastered: false } }),
      prisma.lessonAttempt.count({ where: { userId, isComplete: true } }),
    ]);

  if (!user) redirect("/login");

  const profile: UserProfile = {
    id: user.id, email: user.email, name: user.name, image: user.image,
    role: user.role as UserProfile["role"], level: user.level as UserProfile["level"],
    nativeLanguage: user.nativeLanguage,
    preferredAccent: user.preferredAccent as UserProfile["preferredAccent"],
    audioSpeed: user.audioSpeed, streakCount: user.streakCount, totalXP: user.totalXP,
    onboardingDone: user.onboardingDone, isPremium: user.isPremium,
    badges: Array.isArray(user.badges) ? (user.badges as unknown as UserProfile["badges"]) : [],
    createdAt: user.createdAt.toISOString(),
  };

  const withPron = recentAttempts.filter((a) => a.pronunciationScore !== null);
  const withFluen = recentAttempts.filter((a) => a.fluencyScore !== null);
  const withComp  = recentAttempts.filter((a) => a.comprehensionScore !== null);
  const avgPronunciation = withPron.length ? withPron.reduce((s, a) => s + (a.pronunciationScore ?? 0), 0) / withPron.length : 0;
  const avgFluency       = withFluen.length ? withFluen.reduce((s, a) => s + (a.fluencyScore ?? 0), 0) / withFluen.length : 0;
  const avgComprehension = withComp.length  ? withComp.reduce((s, a) => s + (a.comprehensionScore ?? 0), 0) / withComp.length : 0;

  const topicLessonCounts = await prisma.lesson.groupBy({
    by: ["topicId"],
    where: { isPublished: true },
    _count: { id: true },
  });
  const countMap = Object.fromEntries(topicLessonCounts.map((t) => [t.topicId, t._count.id]));
  const masteredTopics = topicProgress.filter(
    (p) => (countMap[p.topicId] ?? 0) > 0 && p.lessonsCompleted >= (countMap[p.topicId] ?? 1)
  ).length;

  const TOPIC_GRADS = [
    "from-indigo-500 to-violet-600", "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600", "from-amber-500 to-orange-600",
    "from-cyan-500 to-blue-600", "from-purple-500 to-indigo-600",
  ];

  return (
    <AppShell user={profile}>
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-8 space-y-5">

        <h1 className="text-2xl font-black text-[var(--color-text)]">Your progress</h1>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: user.streakCount, label: "Day streak", grad: "linear-gradient(135deg,#F59E0B,#EF4444)" },
            { value: totalLessons,     label: "Lessons",    grad: "linear-gradient(135deg,#4F46E5,#6366F1)" },
            { value: user.totalXP.toLocaleString(), label: "Total XP", grad: "linear-gradient(135deg,#10B981,#059669)" },
            { value: difficultWordsCount, label: "To review", grad: "linear-gradient(135deg,#EF4444,#DB2777)" },
            { value: recentAttempts.length, label: "Last 30 days", grad: "linear-gradient(135deg,#06B6D4,#3B82F6)" },
            { value: masteredTopics,  label: "Topics done", grad: "linear-gradient(135deg,#8B5CF6,#6366F1)" },
          ].map(({ value, label, grad }) => (
            <div key={label} className="rounded-2xl p-4 text-center" style={{ background: grad, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
              <p className="text-2xl font-extrabold text-white leading-none">{value}</p>
              <p className="text-[10px] text-white/65 mt-1 font-semibold uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        {/* Avg scores */}
        {recentAttempts.length > 0 && (
          <div className="rounded-2xl bg-white border border-[var(--color-border)] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(79,70,229,0.06)" }}>
            <div className="px-5 pt-4 pb-2 border-b border-[var(--color-border)]">
              <h2 className="text-sm font-bold text-[var(--color-text)]">Average scores — last 30 days</h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              {[
                { label: "Pronunciation", value: avgPronunciation, grad: "from-indigo-500 to-violet-500" },
                { label: "Fluency",       value: avgFluency,       grad: "from-emerald-500 to-teal-500" },
                { label: "Comprehension", value: avgComprehension, grad: "from-amber-500 to-orange-500" },
              ].map(({ label, value, grad }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-muted)] w-28 shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
                      style={{ width: `${Math.round((value / 10) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[var(--color-text)] w-8 text-right tabular-nums">
                    {value > 0 ? value.toFixed(1) : "–"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topic progress */}
        {topicProgress.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-[var(--color-text)] mb-3">Topics</h2>
            <div className="rounded-2xl bg-white border border-[var(--color-border)] overflow-hidden divide-y divide-[var(--color-border)]" style={{ boxShadow: "0 2px 8px rgba(79,70,229,0.06)" }}>
              {topicProgress.map((p, idx) => {
                const total = countMap[p.topicId] ?? 1;
                const pct   = Math.min(100, Math.round((p.lessonsCompleted / total) * 100));
                const avg   = p.avgPronunciation > 0
                  ? ((p.avgPronunciation + p.avgFluency + p.avgComprehension) / 3).toFixed(1)
                  : null;
                const grad = TOPIC_GRADS[idx % TOPIC_GRADS.length];
                return (
                  <Link key={p.id} href={`/topics/${p.topic.slug}`}>
                    <div className="flex items-center gap-4 px-4 py-3.5 hover:bg-[var(--color-surface-2)] transition-colors">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shrink-0`} aria-hidden="true">
                        <span className="text-white font-black text-sm">{p.topic.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text)] truncate">{p.topic.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${grad}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[11px] text-[var(--color-muted)] shrink-0">{p.lessonsCompleted}/{total}</span>
                        </div>
                      </div>
                      {avg && (
                        <span className="text-sm font-bold text-[var(--color-primary)] shrink-0">{avg}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent activity */}
        {recentAttempts.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-[var(--color-text)] mb-3">Recent activity</h2>
            <div className="rounded-2xl bg-white border border-[var(--color-border)] overflow-hidden divide-y divide-[var(--color-border)]" style={{ boxShadow: "0 2px 8px rgba(79,70,229,0.06)" }}>
              {recentAttempts.slice(0, 10).map((a, i) => (
                <Link key={i} href={`/lessons/${a.lesson.slug}`}>
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-2)] transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">{a.lesson.title}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {new Date(a.attemptedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.pronunciationScore !== null && (
                        <span className={[
                          "text-xs font-bold px-2 py-0.5 rounded-full",
                          a.pronunciationScore >= 7 ? "bg-emerald-100 text-emerald-700" :
                          a.pronunciationScore >= 4 ? "bg-amber-100 text-amber-700" :
                                                      "bg-red-100 text-red-700",
                        ].join(" ")}>
                          {a.pronunciationScore.toFixed(1)}
                        </span>
                      )}
                      <Badge variant={a.lesson.level === "A1" ? "a1" : a.lesson.level === "A2" ? "a2" : "b1"}>
                        {a.lesson.level}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {recentAttempts.length === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: "linear-gradient(135deg, #F0F2FF, #E8EBFF)", border: "1px solid var(--color-border)" }}>
            <p className="font-bold text-[var(--color-text)] mb-1">No data yet</p>
            <p className="text-sm text-[var(--color-text-secondary)] mb-5">Complete lessons to see your progress.</p>
            <Link
              href="/topics"
              className="inline-flex items-center justify-center h-11 px-8 text-white text-sm font-bold rounded-[var(--radius-button)] transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)", boxShadow: "0 4px 16px rgba(79,70,229,0.35)" }}
            >
              Start learning
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
