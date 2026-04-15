import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Badge } from "@/components/ui/Badge";
import type { UserProfile } from "@/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [user, progress, recentAttempts, lessonCounts] = await Promise.all([
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
      where: { userId, isComplete: true },
      orderBy: { attemptedAt: "desc" },
      take: 4,
      include: { lesson: { select: { title: true, slug: true, level: true, topic: { select: { name: true } } } } },
    }),
    prisma.lesson.groupBy({
      by: ["topicId"],
      where: { isPublished: true },
      _count: { id: true },
    }),
  ]);

  if (!user) redirect("/login");

  const topicLessonCountMap = new Map(lessonCounts.map((lc) => [lc.topicId, lc._count.id]));
  const totalLessonsCompleted = progress.reduce((acc, p) => acc + p.lessonsCompleted, 0);

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

  const firstName = user.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const xpToNext = 500 - (user.totalXP % 500);
  const xpPct = Math.min(100, ((user.totalXP % 500) / 500) * 100);

  const TOPIC_COLORS = [
    "from-indigo-500 to-violet-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-cyan-500 to-blue-600",
    "from-purple-500 to-indigo-600",
  ];

  return (
    <AppShell user={profile}>
      <div className="max-w-2xl mx-auto pb-8">

        {/* ── Hero greeting ─────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden px-5 pt-7 pb-6"
          style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
        >
          {/* Decorative glow orbs */}
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.10), transparent)" }} aria-hidden="true" />
          <div className="absolute left-4 bottom-0 w-28 h-28 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.05), transparent)" }} aria-hidden="true" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium mb-0.5">{greeting}</p>
              <h1 className="text-[1.85rem] font-black text-white leading-tight">{firstName}!</h1>
              <p className="text-white/60 text-sm mt-1.5 max-w-[220px]">
                {user.streakCount > 0
                  ? `${user.streakCount}-day streak — keep going!`
                  : "Start a lesson to begin your streak."}
              </p>
            </div>
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0"
              style={{ background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.25)" }}
              aria-hidden="true"
            >
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </div>
          </div>

          {/* XP progress */}
          <div className="relative mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Level {user.level}
                </span>
                <span className="text-white/50 text-[11px]">{user.totalXP.toLocaleString()} XP total</span>
              </div>
              <span className="text-white/50 text-[11px]">{xpToNext} XP to next level</span>
            </div>
            <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${xpPct}%`, background: "linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))" }}
                role="progressbar"
                aria-valuenow={user.totalXP % 500}
                aria-valuemax={500}
                aria-label="XP progress"
              />
            </div>
          </div>
        </div>

        <div className="px-4 pt-5 space-y-5">

          {/* ── Stats row ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3">
            {/* Streak */}
            <div className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
              <div className="flex justify-center mb-1" aria-hidden="true">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" fill="rgba(255,255,255,0.25)" stroke="none"/>
                  <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-2xl font-extrabold text-white leading-none">{user.streakCount}</p>
              <p className="text-[10px] text-white/70 mt-1 font-semibold uppercase tracking-wide">Day streak</p>
            </div>
            {/* Lessons */}
            <div className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
              <div className="flex justify-center mb-1" aria-hidden="true">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                </svg>
              </div>
              <p className="text-2xl font-extrabold text-white leading-none">{totalLessonsCompleted}</p>
              <p className="text-[10px] text-white/70 mt-1 font-semibold uppercase tracking-wide">Lessons done</p>
            </div>
            {/* XP */}
            <div className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg, #10B981, #059669)", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
              <div className="flex justify-center mb-1" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
              </div>
              <p className="text-2xl font-extrabold text-white leading-none">{user.totalXP.toLocaleString()}</p>
              <p className="text-[10px] text-white/70 mt-1 font-semibold uppercase tracking-wide">Total XP</p>
            </div>
          </div>

          {/* ── Start lesson CTA ──────────────────────────────────────── */}
          <Link href="/topics">
            <div
              className="rounded-2xl p-5 flex items-center justify-between overflow-hidden relative"
              style={{
                background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                boxShadow: "0 8px 32px rgba(79,70,229,0.35)",
              }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10" style={{ background: "radial-gradient(circle at 80% 50%, white, transparent)" }} aria-hidden="true" />
              <div>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Ready to practise?</p>
                <p className="text-white text-[1.35rem] font-black leading-tight">Start today&apos;s lesson</p>
                <p className="text-indigo-200/70 text-xs mt-1">Earn XP · Track your progress</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0" aria-hidden="true">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                  <polygon points="5,3 19,12 5,21" fill="white" stroke="none"/>
                </svg>
              </div>
            </div>
          </Link>

          {/* ── Topic progress ────────────────────────────────────────── */}
          {progress.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-[var(--color-text)]">Your topics</h2>
                <Link href="/topics" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
                  See all →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {progress.slice(0, 4).map((p, idx) => {
                  const total = topicLessonCountMap.get(p.topicId) ?? 1;
                  const pct = Math.min(100, Math.round((p.lessonsCompleted / total) * 100));
                  const grad = TOPIC_COLORS[idx % TOPIC_COLORS.length];
                  return (
                    <Link key={p.id} href={`/topics/${p.topic.slug}`}>
                      <div
                        className="rounded-2xl bg-white border border-[var(--color-border)] p-4 flex items-center gap-3 hover:border-[var(--color-primary)]/40 hover:-translate-y-0.5 transition-all duration-200"
                        style={{ boxShadow: "0 2px 8px rgba(79,70,229,0.06)" }}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shrink-0`} aria-hidden="true">
                          <span className="text-white font-black text-base">{p.topic.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[var(--color-text)] truncate">{p.topic.name}</p>
                          <p className="text-xs text-[var(--color-muted)] mt-0.5">{p.lessonsCompleted}/{total}</p>
                          <div className="mt-1.5 w-full h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${grad}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Recent lessons ────────────────────────────────────────── */}
          {recentAttempts.length > 0 && (
            <section>
              <h2 className="text-base font-bold text-[var(--color-text)] mb-3">Recent activity</h2>
              <div className="rounded-2xl bg-white border border-[var(--color-border)] overflow-hidden divide-y divide-[var(--color-border)]" style={{ boxShadow: "0 2px 8px rgba(79,70,229,0.06)" }}>
                {recentAttempts.map((attempt) => (
                  <Link key={attempt.id} href={`/lessons/${attempt.lesson.slug}`}>
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-surface-2)] transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center shrink-0" aria-hidden="true">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round">
                          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text)] truncate">{attempt.lesson.title}</p>
                        <p className="text-xs text-[var(--color-muted)]">
                          {attempt.lesson.topic?.name} · {new Date(attempt.attemptedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {attempt.pronunciationScore !== null && (
                          <span className={[
                            "text-xs font-bold px-2 py-0.5 rounded-full",
                            attempt.pronunciationScore >= 7 ? "bg-emerald-100 text-emerald-700" :
                            attempt.pronunciationScore >= 4 ? "bg-amber-100 text-amber-700" :
                                                              "bg-red-100 text-red-700",
                          ].join(" ")}>
                            {attempt.pronunciationScore.toFixed(1)}
                          </span>
                        )}
                        <Badge variant={attempt.lesson.level === "A1" ? "a1" : attempt.lesson.level === "A2" ? "a2" : "b1"}>
                          {attempt.lesson.level}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── Empty state ───────────────────────────────────────────── */}
          {recentAttempts.length === 0 && (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: "linear-gradient(135deg, #F0F2FF, #E8EBFF)", border: "1px solid var(--color-border)" }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center" aria-hidden="true">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
                </svg>
              </div>
              <p className="font-bold text-[var(--color-text)] text-lg mb-1">Ready to start?</p>
              <p className="text-sm text-[var(--color-text-secondary)] mb-5">
                Complete your first lesson to track progress and earn XP.
              </p>
              <Link
                href="/topics"
                className="inline-flex items-center justify-center h-11 px-8 text-white text-sm font-bold rounded-[var(--radius-button)] transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)", boxShadow: "0 4px 16px rgba(79,70,229,0.35)" }}
              >
                Browse lessons
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
