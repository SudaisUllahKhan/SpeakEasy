import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy Policy — SpeakEasy" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-lg" style={{ background: "linear-gradient(135deg,#7C3AED,#C4B5FD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            SpeakEasy
          </Link>
          <Link href="/" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
            Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-text)] mb-2">Privacy Policy</h1>
          <p className="text-sm text-[var(--color-muted)]">Last updated: April 2025</p>
        </div>

        {[
          {
            title: "1. Who we are",
            body: "SpeakEasy is an AI-powered English speaking practice application built by Innov8ive.AI. We are committed to protecting your personal data and being transparent about how we use it.",
          },
          {
            title: "2. Data we collect",
            body: "We collect the information you provide when you create an account (name, email address), data you generate while using the app (lesson attempts, pronunciation scores, vocabulary progress), and technical data such as your device type and browser for improving the service.",
          },
          {
            title: "3. How we use your data",
            body: "Your data is used solely to provide and improve the SpeakEasy learning experience. This includes personalising lesson recommendations, tracking your progress, and generating AI-powered feedback. We do not sell your data to third parties.",
          },
          {
            title: "4. Voice recordings",
            body: "When you complete a speaking exercise, your audio is processed to generate pronunciation feedback. Audio recordings are automatically deleted from our servers within 90 days in compliance with GDPR Article 5(1)(e). Transcripts used for scoring may be retained as part of your learning history.",
          },
          {
            title: "5. Third-party services",
            body: "We use OpenAI (Whisper) for speech-to-text processing, Microsoft Azure for hosting and AI services, Google for authentication (if you use Sign in with Google), and Resend for transactional emails. Each of these services has its own privacy policy.",
          },
          {
            title: "6. Your rights (GDPR)",
            body: "If you are located in the European Economic Area, you have the right to access, correct, or delete your personal data at any time. You can delete your account and all associated data from the Settings page. For any other data requests, contact us at privacy@innov8ive.ai.",
          },
          {
            title: "7. Data retention",
            body: "We retain your account data for as long as your account is active. If you delete your account, your personal data and progress records are permanently removed within 30 days. Audio recordings are deleted within 90 days of creation.",
          },
          {
            title: "8. Cookies",
            body: "We use only essential session cookies required for authentication. We do not use advertising or tracking cookies.",
          },
          {
            title: "9. Changes to this policy",
            body: "We may update this privacy policy from time to time. We will notify you of significant changes via email. Continued use of the app after changes constitutes acceptance of the updated policy.",
          },
          {
            title: "10. Contact",
            body: "For privacy-related questions or requests, email us at privacy@innov8ive.ai.",
          },
        ].map(({ title, body }) => (
          <section key={title}>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-2">{title}</h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">{body}</p>
          </section>
        ))}
      </main>

      <footer className="border-t border-[var(--color-border)] mt-16 py-8 text-center">
        <p className="text-sm text-[var(--color-muted)]">
          &copy; {new Date().getFullYear()} Innov8ive.AI &middot;{" "}
          <Link href="/terms" className="hover:text-[var(--color-text)] transition-colors">Terms</Link>
          {" "}&middot;{" "}
          <Link href="/contact" className="hover:text-[var(--color-text)] transition-colors">Contact</Link>
        </p>
      </footer>
    </div>
  );
}
