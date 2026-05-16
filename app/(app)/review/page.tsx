"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TrophyIcon, BookOpenIcon, CheckCircleIcon, RefreshIcon, CheckIcon } from "@/components/ui/Icons";
import type { DifficultWord } from "@/types";

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)]" aria-hidden="true">
        <CheckCircleIcon size={32} />
      </div>
      <h2 className="text-xl font-black text-[var(--color-text)]">All caught up!</h2>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-xs">
        No words due for review right now. Keep practising lessons to build your vocabulary.
      </p>
      <Button onClick={onBack} variant="secondary">Browse lessons</Button>
    </div>
  );
}

// ─── Flashcard ───────────────────────────────────────────────────────────────

function Flashcard({
  word,
  total,
  index,
  onResult,
}: {
  word: DifficultWord;
  total: number;
  index: number;
  onResult: (correct: boolean) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  // Reset flip on each word
  useEffect(() => { setRevealed(false); }, [word.id]);

  function speakWord() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(word.word);
      utt.lang = "en-US";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4">
      {/* Progress */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
            style={{ width: `${((index) / total) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-[var(--color-muted)] whitespace-nowrap">
          {index} / {total}
        </span>
      </div>

      {/* Card */}
      <Card
        className="w-full max-w-sm min-h-[220px] flex flex-col items-center justify-center gap-4 cursor-pointer select-none"
        padding="lg"
        onClick={!revealed ? () => setRevealed(true) : undefined}
        role={!revealed ? "button" : undefined}
        aria-label={!revealed ? "Tap to reveal pronunciation" : undefined}
      >
        {/* Word */}
        <div className="text-center">
          <p className="text-4xl font-black text-[var(--color-text)] mb-2">{word.word}</p>
          {revealed && word.phonetic && (
            <p className="text-lg text-[var(--color-muted)] font-mono">{word.phonetic}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <Badge variant="danger" className="text-xs">
            {word.timesIncorrect}× missed
          </Badge>
          {word.timesCorrect > 0 && (
            <Badge variant="success" className="text-xs">
              {word.timesCorrect}× correct
            </Badge>
          )}
        </div>

        {/* Hear button */}
        <button
          onClick={(e) => { e.stopPropagation(); speakWord(); }}
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded px-2 py-1"
          aria-label={`Hear pronunciation of ${word.word}`}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/>
            <path d="M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M19.07 4.93a10 10 0 010 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Hear it
        </button>

        {/* Tap hint */}
        {!revealed && (
          <p className="text-xs text-[var(--color-muted)]">Tap to reveal</p>
        )}
      </Card>

      {/* Result buttons — shown after reveal */}
      {revealed && (
        <div className="w-full max-w-sm flex gap-3">
          <Button
            variant="secondary"
            className="flex-1 gap-2"
            onClick={() => onResult(false)}
          >
            <RefreshIcon size={16} aria-hidden={true} />
            Still learning
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={() => onResult(true)}
          >
            <CheckIcon size={16} aria-hidden={true} />
            Got it
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Complete screen ──────────────────────────────────────────────────────────

function SessionComplete({
  correct,
  total,
  onRestart,
  onDone,
}: {
  correct: number;
  total: number;
  onRestart: () => void;
  onDone: () => void;
}) {
  const pct = Math.round((correct / total) * 100);
  return (
    <div className="flex flex-col items-center gap-6 py-16 px-4 text-center">
      <div
        className={[
          "w-20 h-20 rounded-full flex items-center justify-center",
          pct >= 80 ? "bg-amber-100 text-amber-500" : pct >= 50 ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]" : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
        ].join(" ")}
        aria-hidden="true"
      >
        {pct >= 80 ? <TrophyIcon size={40} /> : <BookOpenIcon size={36} />}
      </div>
      <div>
        <h2 className="text-2xl font-black text-[var(--color-text)] mb-1">Session complete!</h2>
        <p className="text-[var(--color-text-secondary)]">
          {correct} of {total} words correct ({pct}%)
        </p>
      </div>
      <div className="w-full max-w-xs">
        <div className="w-full h-4 bg-[var(--color-surface-2)] rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="flex gap-3 w-full max-w-xs">
        <Button variant="secondary" className="flex-1" onClick={onRestart}>Practice again</Button>
        <Button className="flex-1" onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const router = useRouter();
  const [words, setWords] = useState<DifficultWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const loadWords = useCallback(async () => {
    setLoading(true);
    setIndex(0);
    setCorrect(0);
    setDone(false);
    try {
      const res = await fetch("/api/review/words");
      if (res.ok) {
        const data = await res.json();
        setWords(data.words ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWords(); }, [loadWords]);

  async function handleResult(isCorrect: boolean) {
    if (index >= words.length) return;
    const word = words[index];

    // Fire-and-forget — don't block UI
    fetch("/api/review/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId: word.id, isCorrect }),
    }).catch(() => {});

    if (isCorrect) setCorrect((c) => c + 1);

    if (index + 1 >= words.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <AppShell user={null}>
      <div className="max-w-lg mx-auto pb-10 px-4 pt-4">
        {/* ── Page header ────────────────────────────────────────────── */}
        <div
          className="rounded-3xl px-5 pt-6 pb-5 mb-5"
          style={{ background: "linear-gradient(135deg, #FEF3C7 0%, #FFEDD5 100%)", border: "1px solid #FDE68A" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #F59E0B, #F97316)", boxShadow: "0 4px 14px rgba(245,158,11,0.35)" }}
              aria-hidden="true"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" strokeLinecap="round">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
            </div>
            <div>
              <h1
                className="text-[1.9rem] font-black leading-none tracking-tight"
                style={{ background: "linear-gradient(135deg, #D97706, #EA580C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                Word Review
              </h1>
              <p className="text-[var(--color-muted)] text-xs mt-0.5">Spaced repetition · right when you need it</p>
            </div>
          </div>
          <div className="pt-4 border-t border-amber-200">
            <p className="text-[var(--color-text-secondary)] text-[0.82rem] italic leading-snug">&ldquo;Repetition is the mother of learning, the father of action, and the architect of accomplishment.&rdquo;</p>
            <p className="text-[var(--color-muted)] text-[11px] mt-1">— Zig Ziglar</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
          </div>
        ) : words.length === 0 ? (
          <EmptyState onBack={() => router.push("/topics")} />
        ) : done ? (
          <SessionComplete
            correct={correct}
            total={words.length}
            onRestart={loadWords}
            onDone={() => router.push("/dashboard")}
          />
        ) : (
          <Flashcard
            word={words[index]}
            total={words.length}
            index={index}
            onResult={handleResult}
          />
        )}
      </div>
    </AppShell>
  );
}
