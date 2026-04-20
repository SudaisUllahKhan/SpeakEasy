import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Check your email" };

export default function VerifyPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 bg-[var(--color-surface)]">
      <div className="w-full max-w-sm bg-white dark:bg-[var(--color-dark-surface)] rounded-2xl border border-[var(--color-border)] p-8 text-center shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center" aria-hidden="true">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/>
          </svg>
        </div>
        <h1 className="text-2xl font-black text-[var(--color-text)] mb-2">Check your inbox</h1>
        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-6">
          A magic sign-in link has been sent to your email.
          Click it to sign in — no password needed.
        </p>
        <p className="text-xs text-[var(--color-muted)]">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <Link href="/login" className="text-[var(--color-primary)] hover:underline">
            try again
          </Link>.
        </p>
      </div>
    </div>
  );
}
