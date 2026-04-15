import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Check your email" };

export default function VerifyPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 bg-[var(--color-surface)]">
      <div className="w-full max-w-sm bg-white dark:bg-[var(--color-dark-surface)] rounded-2xl border border-[var(--color-border)] p-8 text-center shadow-sm">
        <div className="text-5xl mb-4" aria-hidden="true">📬</div>
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
