import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SpeakEasy — AI Speaking Practice for English Learners",
};

const FEATURES = [
  {
    icon: "🎧",
    title: "Listen & Learn",
    description:
      "Hear natural English at your pace. Slow down or speed up — you're in control.",
  },
  {
    icon: "🎤",
    title: "Read Aloud",
    description:
      "Record yourself reading. Our AI scores every word and highlights what to improve.",
  },
  {
    icon: "🤖",
    title: "AI Questions",
    description:
      "Answer comprehension questions by voice. GPT-4 evaluates meaning, not just words.",
  },
  {
    icon: "📊",
    title: "Instant Feedback",
    description:
      "Get pronunciation, fluency, and comprehension scores after every lesson.",
  },
  {
    icon: "🔥",
    title: "Daily Streaks",
    description:
      "Build the habit with streaks, XP, and achievement badges that keep you motivated.",
  },
  {
    icon: "👩‍🏫",
    title: "Teacher Tools",
    description:
      "Assign lessons, track class progress, and create custom content with AI assistance.",
  },
];

const LEVELS = [
  { level: "A1", label: "Beginner", description: "Simple sentences, present tense, everyday vocabulary" },
  { level: "A2", label: "Elementary", description: "Past tense, short conversations, practical topics" },
  { level: "B1", label: "Intermediate", description: "Mixed tenses, opinions, longer passages" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* ─── Navigation ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0A1628]/90 backdrop-blur-sm border-b border-[var(--color-border)]">
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
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[var(--color-accent)] blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
              <span className="text-[var(--color-warning)]">★</span>
              AI-powered · CEFR A1–B1 · iOS &amp; Android coming soon
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-6">
              Duolingo taught you to read.
              <br />
              <span className="text-[var(--color-accent-light)]">SpeakEasy teaches you to speak.</span>
            </h1>

            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
              Structured listen-read-respond lessons with real AI pronunciation scoring.
              Build speaking confidence from day one — no embarrassment, no judgment.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-14 px-8 bg-[var(--color-accent)] text-white text-lg font-bold rounded-[var(--radius-button)] hover:bg-[var(--color-accent-light)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Start speaking for free
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center h-14 px-8 bg-white/10 border border-white/30 text-white text-lg font-semibold rounded-[var(--radius-button)] hover:bg-white/20 transition-colors"
              >
                See how it works
              </Link>
            </div>

            <p className="mt-5 text-sm text-white/60">
              Free forever · 3 lessons/day · No credit card required
            </p>
          </div>

          {/* Step preview cards */}
          <div className="relative max-w-4xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-5 gap-2 text-center">
              {["🎧 Listen", "🎤 Read Aloud", "❓ Questions", "📊 Feedback", "🏆 Summary"].map(
                (step, i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3"
                  >
                    <div className="text-xl mb-1">{step.split(" ")[0]}</div>
                    <div className="text-xs font-medium text-white/80">{step.split(" ").slice(1).join(" ")}</div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* ─── How it works ────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-20 bg-[var(--color-surface)]">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-black text-center text-[var(--color-text)] mb-4">
              One lesson. Five steps. Real progress.
            </h2>
            <p className="text-center text-[var(--color-text-secondary)] mb-14 max-w-xl mx-auto">
              Every SpeakEasy lesson follows the same proven cycle — designed for ESL learners who want to speak, not just study.
            </p>

            <div className="space-y-6">
              {[
                {
                  step: "01",
                  icon: "🎧",
                  title: "Listen",
                  description:
                    "Hear a native speaker read a short passage at your level. Control the speed — 0.75× to 1.25×. Replay up to 3 times.",
                  color: "var(--color-primary)",
                },
                {
                  step: "02",
                  icon: "🎤",
                  title: "Read Aloud",
                  description:
                    "Read the passage out loud while we record. AI analyses every word with Whisper speech recognition — colour-coded instantly.",
                  color: "var(--color-accent)",
                },
                {
                  step: "03",
                  icon: "❓",
                  title: "Answer Questions",
                  description:
                    "Respond to comprehension questions by voice. GPT-4 checks your meaning, not just your grammar. Skip anytime.",
                  color: "var(--color-warning)",
                },
                {
                  step: "04",
                  icon: "📊",
                  title: "Get Feedback",
                  description:
                    "See pronunciation, fluency, and comprehension scores. Difficult words go to your personal review queue.",
                  color: "#8B5CF6",
                },
                {
                  step: "05",
                  icon: "🏆",
                  title: "Earn XP",
                  description:
                    "Collect XP, build your streak, and unlock achievement badges. Progress is tracked across every lesson.",
                  color: "var(--color-danger)",
                },
              ].map(({ step, icon, title, description, color }) => (
                <div key={step} className="flex gap-5 items-start">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black text-white"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  >
                    {icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest">
                        Step {step}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--color-text)]">{title}</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Features grid ───────────────────────────────────────────── */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-black text-center text-[var(--color-text)] mb-14">
              Everything you need to speak with confidence
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map(({ icon, title, description }) => (
                <div
                  key={title}
                  className="bg-white dark:bg-[var(--color-dark-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-6 hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl mb-3" aria-hidden="true">{icon}</div>
                  <h3 className="font-bold text-[var(--color-text)] mb-2">{title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Levels ──────────────────────────────────────────────────── */}
        <section className="py-20 bg-[var(--color-surface)]">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-black text-center text-[var(--color-text)] mb-4">
              Built for CEFR A1–B1
            </h2>
            <p className="text-center text-[var(--color-text-secondary)] mb-12">
              SpeakEasy owns the beginner niche. Every lesson, word, and question is calibrated to your exact level.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {LEVELS.map(({ level, label, description }) => (
                <div
                  key={level}
                  className="bg-white dark:bg-[var(--color-dark-surface)] border-2 border-[var(--color-primary)]/20 rounded-[var(--radius-card)] p-6 text-center hover:border-[var(--color-primary)]/60 transition-colors"
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
        <section className="py-24 bg-[var(--color-primary)] text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-4xl font-black mb-4">
              Start speaking today. It&apos;s free.
            </h2>
            <p className="text-white/80 text-lg mb-10">
              3 free lessons every day. Full AI feedback. No credit card. No paywall on the core experience.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-14 px-10 bg-[var(--color-accent)] text-white text-lg font-bold rounded-[var(--radius-button)] hover:bg-[var(--color-accent-light)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
