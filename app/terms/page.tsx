import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of Service — SpeakEasy" };

export default function TermsPage() {
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
          <h1 className="text-3xl font-black text-[var(--color-text)] mb-2">Terms of Service</h1>
          <p className="text-sm text-[var(--color-muted)]">Last updated: April 2025</p>
        </div>

        {[
          {
            title: "1. Acceptance of terms",
            body: "By creating an account or using SpeakEasy, you agree to these Terms of Service. If you do not agree, please do not use the application.",
          },
          {
            title: "2. Description of service",
            body: "SpeakEasy is an AI-powered language learning platform designed to help ESL learners practise English speaking skills. The service includes lesson content, AI-generated feedback, and progress tracking features.",
          },
          {
            title: "3. User accounts",
            body: "You are responsible for keeping your account credentials secure. You must be at least 13 years old to use SpeakEasy. You agree to provide accurate information when creating your account and to update it if it changes.",
          },
          {
            title: "4. Acceptable use",
            body: "You agree to use SpeakEasy only for lawful purposes. You must not attempt to reverse-engineer, scrape, or misuse the platform. You must not impersonate other users or upload harmful content.",
          },
          {
            title: "5. Intellectual property",
            body: "All lesson content, AI models, design, and code are the property of Innov8ive.AI and are protected by copyright. You may not reproduce or distribute any part of the service without written permission.",
          },
          {
            title: "6. AI-generated content",
            body: "SpeakEasy uses AI to generate questions, evaluate answers, and provide feedback. While we strive for accuracy, AI-generated content may not always be perfect. Do not rely solely on AI feedback for medical, legal, or other professional purposes.",
          },
          {
            title: "7. Subscription and payments",
            body: "Some features may require a paid subscription. Subscription fees are charged in advance and are non-refundable except as required by law. We reserve the right to change pricing with reasonable notice.",
          },
          {
            title: "8. Termination",
            body: "We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from the Settings page.",
          },
          {
            title: "9. Disclaimer of warranties",
            body: "SpeakEasy is provided 'as is' without warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free. Language learning outcomes depend on your individual effort and practice.",
          },
          {
            title: "10. Limitation of liability",
            body: "To the maximum extent permitted by law, Innov8ive.AI shall not be liable for any indirect, incidental, or consequential damages arising from your use of SpeakEasy.",
          },
          {
            title: "11. Governing law",
            body: "These terms are governed by the laws of the United Kingdom. Any disputes shall be resolved in the courts of England and Wales.",
          },
          {
            title: "12. Contact",
            body: "For questions about these terms, email us at legal@innov8ive.ai.",
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
          <Link href="/privacy" className="hover:text-[var(--color-text)] transition-colors">Privacy Policy</Link>
          {" "}&middot;{" "}
          <Link href="/contact" className="hover:text-[var(--color-text)] transition-colors">Contact</Link>
        </p>
      </footer>
    </div>
  );
}
