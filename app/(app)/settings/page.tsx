"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { UserProfile, Accent, Level } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ACCENT_LABELS: Record<Accent, string> = {
  US: "American English",
  UK: "British English",
  AU: "Australian English",
  IN: "Indian English",
};

const SPEED_OPTIONS: { value: number; label: string }[] = [
  { value: 0.75, label: "0.75× Slow" },
  { value: 1.0,  label: "1×  Normal" },
  { value: 1.25, label: "1.25× Fast" },
];

const LEVEL_LABELS: Record<Level, string> = {
  A1: "A1 — Beginner",
  A2: "A2 — Elementary",
  B1: "B1 — Intermediate",
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`section-${title}`}>
      <h2
        id={`section-${title}`}
        className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)] mb-3 px-1"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

// ─── Field row ────────────────────────────────────────────────────────────────

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
      <span className="text-sm text-[var(--color-text-secondary)] font-medium">{label}</span>
      <div className="ml-4">{children}</div>
    </div>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────

function DeleteAccountDialog({
  onCancel,
  onDeleted,
}: {
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (input !== "DELETE") return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Deletion failed");
      }
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <Card className="w-full max-w-sm" padding="lg">
        <h3 id="delete-dialog-title" className="text-lg font-black text-[var(--color-danger)] mb-2">
          Delete account?
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          This permanently deletes your account, progress, vocabulary, and all data. This
          cannot be undone. You will receive a GDPR confirmation email.
        </p>
        <label className="block text-sm font-semibold text-[var(--color-text)] mb-1">
          Type <strong>DELETE</strong> to confirm
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-11 px-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)] mb-4"
          placeholder="DELETE"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {error && (
          <p className="text-sm text-[var(--color-danger)] mb-3">{error}</p>
        )}
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleDelete}
            disabled={input !== "DELETE" || loading}
            loading={loading}
          >
            Delete forever
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return <Suspense><SettingsContent /></Suspense>
}

function SettingsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "1";
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [accent, setAccent] = useState<Accent>("US");
  const [audioSpeed, setAudioSpeed] = useState(1.0);
  const [level, setLevel] = useState<Level>("A1");

  // UI state
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load user data
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (!session?.user) return;

    async function loadUser() {
      const res = await fetch("/api/user/settings-read");
      if (!res.ok) return;
      const data = await res.json();
      if (data.user) {
        setName(data.user.name ?? "");
        setNativeLanguage(data.user.nativeLanguage ?? "");
        setAccent((data.user.preferredAccent as Accent) ?? "US");
        setAudioSpeed(data.user.audioSpeed ?? 1.0);
        setLevel((data.user.level as Level) ?? "A1");
      }
    }
    loadUser();
  }, [session, status, router]);

  async function handleSave() {
    setSaved(false);
    setSaveError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/user/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim() || undefined,
            nativeLanguage: nativeLanguage.trim() || undefined,
            preferredAccent: accent,
            audioSpeed,
            level,
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? "Save failed");
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  if (status === "loading" || !session?.user) {
    return (
      <AppShell user={null}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
        </div>
      </AppShell>
    );
  }

  const profile: UserProfile = {
    id: (session.user as { id?: string }).id ?? "",
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    image: session.user.image ?? null,
    role: "STUDENT",
    level,
    nativeLanguage,
    preferredAccent: accent,
    audioSpeed,
    streakCount: 0,
    totalXP: 0,
    onboardingDone: true,
    isPremium: false,
    badges: [],
    createdAt: new Date().toISOString(),
  };

  return (
    <>
      {showDeleteDialog && (
        <DeleteAccountDialog
          onCancel={() => setShowDeleteDialog(false)}
          onDeleted={async () => {
            await signOut({ redirect: false });
            router.replace("/");
          }}
        />
      )}

      <AppShell user={profile}>
        <div className="max-w-lg mx-auto pb-10 px-4 pt-4 space-y-5">

          {/* ── Welcome banner (first login only) ───────────────────────── */}
          {isWelcome && (
            <div
              className="rounded-2xl px-5 py-4 flex items-start gap-3"
              style={{ background: "linear-gradient(135deg,#F0FDF4,#DCFCE7)", border: "1px solid #86EFAC" }}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
              </div>
              <div>
                <p className="font-bold text-emerald-800">Welcome to SpeakEasy!</p>
                <p className="text-sm text-emerald-700 mt-0.5">Set your English level and preferences below, then tap <strong>Save changes</strong> to get started.</p>
              </div>
            </div>
          )}

          {/* ── Page header ─────────────────────────────────────────────── */}
          <div
            className="rounded-3xl px-5 pt-6 pb-5"
            style={{ background: "linear-gradient(135deg, #FDF2FF 0%, #FAE8FF 100%)", border: "1px solid #E9D5FF" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #D946EF, #A855F7)", boxShadow: "0 4px 14px rgba(217,70,239,0.32)" }}
                aria-hidden="true"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <div>
                <h1
                  className="text-[1.9rem] font-black leading-none tracking-tight"
                  style={{ background: "linear-gradient(135deg, #A855F7, #D946EF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  Settings
                </h1>
                <p className="text-[var(--color-muted)] text-xs mt-0.5">Profile, learning preferences &amp; account</p>
              </div>
            </div>
            <div className="pt-4 border-t border-purple-100">
              <p className="text-[var(--color-text-secondary)] text-[0.82rem] italic leading-snug">&ldquo;Personalise your experience — your learning, your way.&rdquo;</p>
              <p className="text-[var(--color-muted)] text-[11px] mt-1">— SpeakEasy</p>
            </div>
          </div>

          {/* ─── Profile ──────────────────────────────────────────────────────── */}
          <Section title="Profile">
            <Card padding="md">
              <FieldRow label="Email">
                <span className="text-sm text-[var(--color-muted)] font-mono">
                  {session.user.email}
                </span>
              </FieldRow>
              <FieldRow label="Display name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                  className="h-9 w-44 px-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </FieldRow>
              <FieldRow label="Native language">
                <input
                  type="text"
                  value={nativeLanguage}
                  onChange={(e) => setNativeLanguage(e.target.value)}
                  placeholder="e.g. Mandarin"
                  maxLength={50}
                  className="h-9 w-44 px-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </FieldRow>
            </Card>
          </Section>

          {/* ─── Learning preferences ──────────────────────────────────────────── */}
          <Section title="Learning">
            <Card padding="md">
              <FieldRow label="CEFR level">
                <div className="flex gap-2">
                  {(["A1", "A2", "B1"] as Level[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`h-9 px-4 rounded-full text-sm font-semibold transition-colors ${
                        level === l
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
                      }`}
                      aria-pressed={level === l}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </FieldRow>

              <FieldRow label="Accent preference">
                <select
                  value={accent}
                  onChange={(e) => setAccent(e.target.value as Accent)}
                  className="h-9 pl-3 pr-8 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none cursor-pointer"
                >
                  {(Object.entries(ACCENT_LABELS) as [Accent, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </FieldRow>

              <FieldRow label="Lesson audio speed">
                <div className="flex gap-1.5">
                  {SPEED_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setAudioSpeed(value)}
                      className={`h-9 px-3 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                        audioSpeed === value
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
                      }`}
                      aria-pressed={audioSpeed === value}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </FieldRow>
            </Card>
          </Section>

          {/* ─── Save button ──────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              loading={isPending}
              className="flex-1"
            >
              Save changes
            </Button>
            {saved && (
              <Badge variant="success" className="animate-fade-in flex items-center gap-1">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>
                Saved
              </Badge>
            )}
            {saveError && (
              <span className="text-sm text-[var(--color-danger)]">{saveError}</span>
            )}
          </div>

          {/* ─── Account ──────────────────────────────────────────────────────── */}
          <Section title="Account">
            <Card padding="md">
              <FieldRow label="Signed in as">
                <Badge variant="primary">{session.user.email}</Badge>
              </FieldRow>
              <div className="pt-3 flex flex-col gap-3">
                <Button
                  variant="secondary"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full"
                >
                  Sign out
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full"
                >
                  Delete my account
                </Button>
              </div>
            </Card>
          </Section>

          {/* ─── App info ─────────────────────────────────────────────────────── */}
          <Section title="About">
            <Card padding="md">
              <FieldRow label="App">
                <span className="text-sm text-[var(--color-muted)] font-semibold">SpeakEasy</span>
              </FieldRow>
              <FieldRow label="Version">
                <Badge variant="muted">1.0.0</Badge>
              </FieldRow>
              <FieldRow label="By">
                <span className="text-sm text-[var(--color-muted)]">Innov8ive.AI</span>
              </FieldRow>
            </Card>
          </Section>
        </div>
      </AppShell>
    </>
  );
}
