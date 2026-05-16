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

const DAILY_QUOTES = [
  { text: "Every word you learn opens a new door.", attr: "Language learner's wisdom" },
  { text: "To speak another language is to have a second soul.", attr: "Charlemagne" },
  { text: "The limits of my language are the limits of my world.", attr: "Ludwig Wittgenstein" },
  { text: "A different language is a different vision of life.", attr: "Federico Fellini" },
  { text: "You live a new life for every new language you speak.", attr: "Czech proverb" },
  { text: "Language is the road map of a culture.", attr: "Rita Mae Brown" },
  { text: "With languages, you are at home anywhere.", attr: "Edmund De Waal" },
  { text: "Every sentence you speak is a small victory.", attr: "SpeakEasy" },
  { text: "Mistakes are proof that you are trying.", attr: "Anonymous" },
  { text: "Progress, not perfection, is the goal.", attr: "SpeakEasy" },
];

function getDailyQuote() {
  const d = new Date();
  return DAILY_QUOTES[(d.getDate() + d.getMonth() * 31) % DAILY_QUOTES.length];
}

const TOPIC_COLORS = [
  { grad: "from-violet-500 to-fuchsia-600",  shadow: "rgba(139,92,246,0.30)" },
  { grad: "from-rose-500 to-pink-600",        shadow: "rgba(244,63,94,0.30)"  },
  { grad: "from-amber-500 to-orange-500",     shadow: "rgba(245,158,11,0.30)" },
  { grad: "from-cyan-500 to-sky-600",         shadow: "rgba(6,182,212,0.30)"  },
];

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

  // First-time users: send to settings to choose their level
  if (!user.onboardingDone) {
    await prisma.user.update({ where: { id: userId }, data: { onboardingDone: true } });
    redirect("/settings?welcome=1");
  }

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
  const greeting =
    hour < 5  ? "Still up?" :
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
                "Good evening";

  const xpInLevel = user.totalXP % 500;
  const xpToNext  = 500 - xpInLevel;
  const xpPct     = Math.round((xpInLevel / 500) * 100);
  const quote = getDailyQuote();

  return (
    <AppShell user={profile}>
      <div className="max-w-lg mx-auto pb-10 px-4 pt-4 space-y-5">

        {/* ── Greeting header ────────────────────────────────────────── */}
        <div
          className="rounded-3xl px-5 pt-6 pb-5"
          style={{ background: "linear-gradient(135deg, #F3EEFF 0%, #EDE8FF 100%)", border: "1px solid #E4DAFF" }}
        >
          {/* Top row */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[var(--color-muted)] text-xs font-semibold uppercase tracking-widest mb-1">{greeting}</p>
              <h1
                className="text-[2rem] font-black leading-none tracking-tight"
                style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                {firstName}!
              </h1>
              {user.streakCount > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <svg width="13" height="13" fill="#F97316" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  <span className="text-[var(--color-accent)] text-xs font-bold">{user.streakCount}-day streak</span>
                </div>
              )}
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)", boxShadow: "0 4px 16px rgba(124,58,237,0.30)" }}
              aria-hidden="true"
            >
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </div>
          </div>

          {/* XP ring + stats */}
          <div className="flex items-center gap-5">
            <div className="shrink-0">
              <ProgressRing
                value={xpPct}
                size={84}
                strokeWidth={7}
                color="#7C3AED"
                label={`${xpPct}%`}
                sublabel="to next"
              />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-[var(--color-muted)] text-[10px] font-semibold uppercase tracking-widest">Level</p>
                <p className="text-[var(--color-text)] font-black text-lg leading-none mt-0.5">
                  {user.level}
                  <span className="text-[var(--color-muted)] font-normal text-xs ml-1.5">{user.totalXP.toLocaleString()} XP</span>
                </p>
              </div>
              <div className="h-px bg-[var(--color-border)]" />
              <div className="grid grid-cols-2 gap-x-4">
                <div>
                  <p className="text-[var(--color-muted)] text-[10px] font-semibold uppercase tracking-widest">Lessons</p>
                  <p className="text-[var(--color-text)] font-black text-lg leading-none mt-0.5">{totalLessonsCompleted}</p>
                </div>
                <div>
                  <p className="text-[var(--color-muted)] text-[10px] font-semibold uppercase tracking-widest">XP needed</p>
                  <p className="font-black text-lg leading-none mt-0.5" style={{ color: "#7C3AED" }}>{xpToNext}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <p className="text-[var(--color-text-secondary)] text-[0.82rem] italic leading-snug">&ldquo;{quote.text}&rdquo;</p>
            <p className="text-[var(--color-muted)] text-[11px] mt-1">— {quote.attr}</p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            START LESSON CTA
        ══════════════════════════════════════════════════════════════ */}
        <Link href="/topics" className="block">
          <div
            className="rounded-2xl px-6 py-5 flex items-center justify-between relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #EC4899 0%, #F97316 100%)",
              boxShadow: "0 6px 28px rgba(236,72,153,0.42)",
            }}
          >
            <div
              className="absolute right-0 top-0 bottom-0 w-28 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at right, rgba(255,255,255,0.18), transparent)" }}
              aria-hidden="true"
            />
            <div>
              <p className="text-pink-100 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">Ready?</p>
              <p className="text-white text-[1.4rem] font-black leading-tight">Start today&apos;s lesson</p>
              <p className="text-pink-100/70 text-xs mt-0.5">Earn XP · Build your streak</p>
            </div>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.22)" }}
              aria-hidden="true"
            >
              <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            </div>
          </div>
        </Link>

        {/* ══════════════════════════════════════════════════════════════
            STATS ROW — 4 compact tiles
        ══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: "⚡", value: user.streakCount, label: "Streak",  bg: "linear-gradient(135deg,#F59E0B,#EF4444)", shadow: "rgba(245,158,11,0.30)" },
            { icon: "📖", value: totalLessonsCompleted, label: "Done", bg: "linear-gradient(135deg,#7C3AED,#A855F7)", shadow: "rgba(124,58,237,0.30)" },
            { icon: "★",  value: user.totalXP, label: "XP",     bg: "linear-gradient(135deg,#22C55E,#16A34A)", shadow: "rgba(34,197,94,0.25)"  },
            { icon: "↑",  value: user.level,   label: "Level",  bg: "linear-gradient(135deg,#06B6D4,#0EA5E9)", shadow: "rgba(6,182,212,0.25)"  },
          ].map(({ value, label, bg, shadow }) => (
            <div
              key={label}
              className="rounded-2xl p-3 text-center"
              style={{ background: bg, boxShadow: `0 4px 14px ${shadow}` }}
            >
              <p className="text-white font-extrabold text-lg leading-none">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
              <p className="text-white/60 text-[9px] mt-1 font-semibold uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            TOPIC PROGRESS
        ══════════════════════════════════════════════════════════════ */}
        {progress.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-[var(--color-text)]">Your topics</h2>
              <Link href="/topics" className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-surface-2)] px-3 py-1 rounded-full">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {progress.slice(0, 4).map((p, idx) => {
                const total = topicLessonCountMap.get(p.topicId) ?? 1;
                const pct = Math.min(100, Math.round((p.lessonsCompleted / total) * 100));
                const { grad, shadow } = TOPIC_COLORS[idx % TOPIC_COLORS.length];
                return (
                  <Link key={p.id} href={`/topics/${p.topic.slug}`}>
                    <div
                      className="rounded-2xl overflow-hidden hover:-translate-y-0.5 transition-all duration-200"
                      style={{ boxShadow: `0 4px 16px ${shadow}` }}
                    >
                      {/* Gradient strip */}
                      <div className={`bg-gradient-to-r ${grad} px-4 py-3 flex items-center gap-2.5`}>
                        <div className="w-9 h-9 rounded-xl bg-white/22 flex items-center justify-center shrink-0">
                          <span className="text-base font-black text-white">{p.topic.name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-bold text-sm truncate leading-tight">{p.topic.name}</p>
                          <p className="text-white/60 text-[10px]">{p.lessonsCompleted}/{total} lessons</p>
                        </div>
                      </div>
                      {/* Progress footer */}
                      <div className="bg-white px-4 py-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-[var(--color-muted)] font-medium">
                            {pct === 100 ? "Mastered" : pct > 0 ? "In progress" : "Not started"}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--color-text)]">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${grad} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            RECENT ACTIVITY
        ══════════════════════════════════════════════════════════════ */}
        {recentAttempts.length > 0 && (
          <section>
            <h2 className="text-base font-black text-[var(--color-text)] mb-3">Recent activity</h2>
            <div
              className="rounded-2xl bg-white border border-[var(--color-border)] overflow-hidden divide-y divide-[var(--color-border)]"
              style={{ boxShadow: "0 2px 12px rgba(124,58,237,0.08)" }}
            >
              {recentAttempts.map((attempt) => (
                <Link key={attempt.id} href={`/lessons/${attempt.lesson.slug}`}>
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-surface-2)] transition-colors">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "linear-gradient(135deg, #F3EEFF, #EDE8FF)" }}
                      aria-hidden="true"
                    >
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round">
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

        {/* ══════════════════════════════════════════════════════════════
            EMPTY STATE
        ══════════════════════════════════════════════════════════════ */}
        {recentAttempts.length === 0 && (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: "linear-gradient(135deg, #1A0840 0%, #2D0F5E 100%)",
              boxShadow: "0 8px 32px rgba(124,58,237,0.25)",
            }}
          >
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.10)" }}
              aria-hidden="true"
            >
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.6" strokeLinecap="round">
                <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
              </svg>
            </div>
            <p className="font-black text-white text-lg mb-1">Your journey starts here!</p>
            <p className="text-white/50 text-sm mb-5">Complete your first lesson to track progress and earn XP.</p>
            <Link
              href="/topics"
              className="inline-flex items-center justify-center h-11 px-8 text-white text-sm font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #EC4899, #F97316)", boxShadow: "0 4px 16px rgba(236,72,153,0.40)" }}
            >
              Browse lessons
            </Link>
          </div>
        )}

      </div>
    </AppShell>
  );
}
