"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    setLoading("email");
    try {
      await signIn("email", { email, callbackUrl: "/dashboard", redirect: false });
      setSent(true);
    } finally {
      setLoading(null);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setLoading(provider);
    await signIn(provider, { callbackUrl: "/dashboard" });
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-4 bg-[var(--color-surface)]">
        <div className="w-full max-w-sm bg-white dark:bg-[var(--color-dark-surface)] rounded-2xl border border-[var(--color-border)] p-8 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center" aria-hidden="true">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-[var(--color-text)] mb-2">Check your inbox</h1>
          <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
            We sent a magic link to <strong className="text-[var(--color-text)]">{email}</strong>.
            Click it to sign in — no password needed.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-6 text-sm text-[var(--color-primary)] hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 bg-[var(--color-surface)]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1" aria-label="SpeakEasy home">
            <span className="text-3xl font-black text-[var(--color-primary)]">Speak</span>
            <span className="text-3xl font-black text-[var(--color-accent)]">Easy</span>
          </Link>
          <p className="mt-2 text-[var(--color-text-secondary)] text-sm">
            Sign in to continue your speaking journey
          </p>
        </div>

        <div className="bg-white dark:bg-[var(--color-dark-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-sm space-y-4">
          {/* Google */}
          <Button
            variant="secondary"
            className="w-full gap-3"
            onClick={() => handleOAuth("google")}
            loading={loading === "google"}
            aria-label="Continue with Google"
          >
            {loading !== "google" && (
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.8-8 19.8-20 0-1.3-.1-2.7-.2-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 10-1.9 13.7-5.1l-6.3-5.2C29.6 35.5 26.9 36.5 24 36.5c-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9.8 40.1 16.4 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 5.9l6.3 5.2C40.8 36 44 30.4 44 24c0-1.3-.1-2.7-.4-4z"/>
              </svg>
            )}
            Continue with Google
          </Button>

          {/* Apple */}
          <Button
            variant="secondary"
            className="w-full gap-3"
            onClick={() => handleOAuth("apple")}
            loading={loading === "apple"}
            aria-label="Continue with Apple"
          >
            {loading !== "apple" && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            )}
            Continue with Apple
          </Button>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-muted)]">or use email</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          {/* Email magic link */}
          <form onSubmit={handleEmailSubmit} className="space-y-3" noValidate>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="your@email.com"
                className="w-full h-12 px-4 border border-[var(--color-border)] rounded-[var(--radius-button)] text-[var(--color-text)] bg-[var(--color-surface)] placeholder:text-[var(--color-muted)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-0 transition-colors"
                aria-describedby={error ? "email-error" : undefined}
                aria-invalid={!!error}
              />
              {error && (
                <p id="email-error" className="mt-1.5 text-xs text-[var(--color-danger)]" role="alert">
                  {error}
                </p>
              )}
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading === "email"}
            >
              Send magic link
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-muted)]">
          By signing in you agree to our{" "}
          <Link href="/terms" className="underline hover:text-[var(--color-text)]">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-[var(--color-text)]">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
