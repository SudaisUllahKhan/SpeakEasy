import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Contact Us — SpeakEasy" };

export default function ContactPage() {
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

      <main className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8">
        {/* Icon */}
        <div
          className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #7C3AED, #9333EA)", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }}
          aria-hidden="true"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>

        <div>
          <h1 className="text-3xl font-black text-[var(--color-text)] mb-3">Get in touch</h1>
          <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
            We are a small team and we genuinely read every message. Whether you have a bug report,
            a feature idea, or a question — we would love to hear from you.
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid gap-4 text-left">
          {[
            {
              label: "General enquiries",
              email: "hello@innov8ive.ai",
              description: "Questions about SpeakEasy, your account, or how the app works.",
            },
            {
              label: "Privacy & data requests",
              email: "privacy@innov8ive.ai",
              description: "GDPR requests, data deletion, or concerns about how we handle your information.",
            },
            {
              label: "Technical support",
              email: "support@innov8ive.ai",
              description: "Report a bug, a broken feature, or anything that is not working as expected.",
            },
          ].map(({ label, email, description }) => (
            <div
              key={label}
              className="rounded-2xl bg-white border border-[var(--color-border)] p-5"
              style={{ boxShadow: "0 2px 10px rgba(124,58,237,0.07)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)] mb-1">{label}</p>
              <a
                href={`mailto:${email}`}
                className="text-[var(--color-primary)] font-bold text-lg hover:underline"
              >
                {email}
              </a>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{description}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-[var(--color-muted)]">
          We aim to respond within 2 business days. For urgent issues, please include
          &ldquo;URGENT&rdquo; in your subject line.
        </p>
      </main>

      <footer className="border-t border-[var(--color-border)] mt-8 py-8 text-center">
        <p className="text-sm text-[var(--color-muted)]">
          &copy; {new Date().getFullYear()} Innov8ive.AI &middot;{" "}
          <Link href="/privacy" className="hover:text-[var(--color-text)] transition-colors">Privacy</Link>
          {" "}&middot;{" "}
          <Link href="/terms" className="hover:text-[var(--color-text)] transition-colors">Terms</Link>
        </p>
      </footer>
    </div>
  );
}
