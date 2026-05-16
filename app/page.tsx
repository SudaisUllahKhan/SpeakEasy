import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SpeakEasy — AI Speaking Practice for English Learners",
};

const FEATURES = [
  {
    title: "Listen & Learn",
    description: "Hear natural English at your pace. Slow down or speed up — you're in control.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
      </svg>
    ),
  },
  {
    title: "Read Aloud",
    description: "Record yourself reading. Our AI scores every word and highlights what to improve.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2a4 4 0 014 4v6a4 4 0 01-8 0V6a4 4 0 014-4z"/><path d="M19 10v1a7 7 0 01-14 0v-1M12 19v4"/>
      </svg>
    ),
  },
  {
    title: "AI Questions",
    description: "Answer comprehension questions by voice. AI evaluates meaning, not just words.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>
        <circle cx="12" cy="12" r="10"/>
      </svg>
    ),
  },
  {
    title: "Instant Feedback",
    description: "Get pronunciation, fluency, and comprehension scores after every lesson.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
  },
  {
    title: "Daily Streaks",
    description: "Build the habit with streaks, XP, and achievement badges that keep you motivated.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2c0 6-6 8-6 14a6 6 0 0012 0c0-6-6-8-6-14z"/>
        <path d="M12 12c0 3-2 4-2 6a2 2 0 004 0c0-2-2-3-2-6z" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    title: "Teacher Tools",
    description: "Assign lessons, track class progress, and create custom content with AI assistance.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
];

const LEVELS = [
  { level: "A1", label: "Beginner", description: "Simple sentences, present tense, everyday vocabulary" },
  { level: "A2", label: "Elementary", description: "Past tense, short conversations, practical topics" },
  { level: "B1", label: "Intermediate", description: "Mixed tenses, opinions, longer passages" },
];

const STEPS = [
  {
    step: "01", title: "Listen",
    description: "Hear a native-style voice read a short passage at your level. Control speed from 0.75× to 1.25×. Replay up to 3 times.",
    color: "#4F46E5",
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>,
  },
  {
    step: "02", title: "Read Aloud",
    description: "Read the passage out loud. AI analyses every word — colour-coded instantly so you see exactly where to improve.",
    color: "#10B981",
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 2a4 4 0 014 4v6a4 4 0 01-8 0V6a4 4 0 014-4z"/><path d="M19 10v1a7 7 0 01-14 0v-1M12 19v4"/></svg>,
  },
  {
    step: "03", title: "Answer Questions",
    description: "Respond to comprehension questions by voice. AI checks your meaning, not just grammar. Skip anytime.",
    color: "#F59E0B",
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>,
  },
  {
    step: "04", title: "Get Feedback",
    description: "See pronunciation, fluency, and comprehension scores. Difficult words go to your personal spaced-repetition queue.",
    color: "#8B5CF6",
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  },
  {
    step: "05", title: "Earn XP",
    description: "Collect XP, build your streak, and unlock achievement badges. Progress is tracked across every lesson.",
    color: "#EF4444",
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" strokeLinecap="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
  },
];

const STEP_ICONS_NAV = [
  { label: "Listen",    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M3 18v-6a9 9 0 0118 0v6"/></svg> },
  { label: "Read Aloud", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 2a4 4 0 014 4v6a4 4 0 01-8 0V6a4 4 0 014-4z"/><path d="M19 10v1a7 7 0 01-14 0v-1"/></svg> },
  { label: "Questions", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg> },
  { label: "Feedback",  icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
  { label: "Summary",   icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" strokeLinecap="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg> },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* ─── Navigation ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black text-[var(--color-primary)] tracking-tight">Speak</span>
            <span className="text-2xl font-black text-[var(--color-accent)] tracking-tight">Easy</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-10 px-5 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-[var(--radius-button)] hover:bg-[var(--color-primary-light)] transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ─── Hero ───────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)] via-[#1a4a8a] to-[var(--color-primary-dark)] text-white">
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[var(--color-accent)] blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-24 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24" aria-hidden="true">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
              AI-powered · CEFR A1–B1 · Works on any device
            </div>

            <h1 className="text-[1.75rem] sm:text-5xl font-black tracking-tight leading-tight mb-4 sm:mb-6">
              Stop studying English.{" "}
              <span className="text-[var(--color-accent-light)]">Start speaking it.</span>
            </h1>

            <p className="text-base sm:text-xl text-white/80 max-w-2xl mx-auto mb-8 sm:mb-10">
              Structured listen-read-respond lessons with real AI pronunciation scoring.
              Build speaking confidence from day one — no embarrassment, no judgment.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 sm:h-14 px-6 sm:px-8 bg-[var(--color-accent)] text-white text-base sm:text-lg font-bold rounded-[var(--radius-button)] hover:bg-[var(--color-accent-light)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Start speaking for free
              </Link>
              <Link
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 sm:h-14 px-6 sm:px-8 bg-white/10 border border-white/30 text-white text-base sm:text-lg font-semibold rounded-[var(--radius-button)] hover:bg-white/20 transition-colors"
              >
                See how it works
              </Link>
            </div>

            <p className="mt-4 sm:mt-5 text-xs sm:text-sm text-white/60">
              Free forever · 3 lessons/day · No credit card required
            </p>
          </div>

          {/* Step preview — horizontal scroll on mobile */}
          <div className="relative max-w-4xl mx-auto px-4 pb-10 sm:pb-16">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-5 scrollbar-hide snap-x snap-mandatory">
              {STEP_ICONS_NAV.map(({ icon, label }, i) => (
                <div
                  key={i}
                  className="snap-start shrink-0 w-[88px] sm:w-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2.5 sm:p-3 text-center flex flex-col items-center gap-1.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    {icon}
                  </div>
                  <div className="text-[10px] sm:text-xs font-medium text-white/80 leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Social proof strip ─────────────────────────────────────── */}
        <section className="bg-[var(--color-surface-2)] border-y border-[var(--color-border)] py-4">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-[var(--color-muted)] font-medium">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>
                Real-time AI pronunciation scoring
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>
                CEFR A1–B1 calibrated lessons
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>
                No app install required
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>
                Works on any device
              </span>
            </div>
          </div>
        </section>

        {/* ─── How it works ────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-12 sm:py-20 bg-[var(--color-surface)]">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-black text-center text-[var(--color-text)] mb-3 sm:mb-4">
              One lesson. Five steps. Real progress.
            </h2>
            <p className="text-center text-[var(--color-text-secondary)] mb-10 sm:mb-14 max-w-xl mx-auto">
              Every SpeakEasy lesson follows the same proven cycle — designed for ESL learners who want to speak, not just study.
            </p>

            <div className="space-y-5">
              {STEPS.map(({ step, icon, title, description, color }) => (
                <div key={step} className="flex gap-4 items-start">
                  <div
                    className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  >
                    {icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] sm:text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest">
                        Step {step}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--color-text)]">{title}</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Features grid ───────────────────────────────────────────── */}
        <section className="py-12 sm:py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-black text-center text-[var(--color-text)] mb-8 sm:mb-14">
              Everything you need to speak with confidence
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {FEATURES.map(({ icon, title, description }) => (
                <div
                  key={title}
                  className="bg-white border border-[var(--color-border)] rounded-[var(--radius-card)] p-5 sm:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  style={{ boxShadow: "0 2px 8px rgba(79,70,229,0.06)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-[var(--color-primary)]"
                    style={{ background: "rgba(79,70,229,0.08)" }}
                    aria-hidden="true"
                  >
                    {icon}
                  </div>
                  <h3 className="font-bold text-[var(--color-text)] mb-2">{title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Levels ──────────────────────────────────────────────────── */}
        <section className="py-12 sm:py-20 bg-[var(--color-surface)]">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-black text-center text-[var(--color-text)] mb-3 sm:mb-4">
              Built for CEFR A1–B1
            </h2>
            <p className="text-center text-[var(--color-text-secondary)] mb-8 sm:mb-12">
              SpeakEasy targets the learners who need the most support. Every lesson, word, and question is calibrated to your exact level.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
              {LEVELS.map(({ level, label, description }) => (
                <div
                  key={level}
                  className="bg-white border-2 border-[var(--color-primary)]/20 rounded-[var(--radius-card)] p-5 sm:p-6 text-center hover:border-[var(--color-primary)]/60 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-primary)] text-white text-xl font-black mb-4">
                    {level}
                  </div>
                  <h3 className="font-bold text-[var(--color-text)] mb-2">{label}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ────────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 bg-[var(--color-primary)] text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-2xl sm:text-4xl font-black mb-3 sm:mb-4">
              Start speaking today. It&apos;s free.
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-8 sm:mb-10">
              3 free lessons every day. Full AI feedback. No credit card. No paywall on the core experience.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-12 sm:h-14 px-8 sm:px-10 bg-[var(--color-accent)] text-white text-base sm:text-lg font-bold rounded-[var(--radius-button)] hover:bg-[var(--color-accent-light)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Create your free account
            </Link>
          </div>
        </section>
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-border)] py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--color-muted)]">
          <div className="flex items-center gap-1 font-bold">
            <span className="text-[var(--color-primary)]">Speak</span>
            <span className="text-[var(--color-accent)]">Easy</span>
            <span className="ml-2 font-normal">by Innov8ive.AI</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[var(--color-text)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--color-text)] transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-[var(--color-text)] transition-colors">Contact</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Innov8ive.AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
