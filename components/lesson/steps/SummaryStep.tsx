"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface SummaryStepProps {
  lessonTitle: string;
  pronunciationScore: number | null;
  fluencyScore: number | null;
  comprehensionScore: number | null;
  xpEarned: number;
  difficultWordsCount: number;
  onAction: (action: "replay" | "next" | "review") => void;
}

const SCORE_ITEMS = [
  { key: "pronunciation" as const, label: "Pronunciation", icon: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 2a4 4 0 014 4v6a4 4 0 01-8 0V6a4 4 0 014-4z"/><path d="M19 10v1a7 7 0 01-14 0v-1M12 19v4"/>
    </svg>
  )},
  { key: "fluency" as const, label: "Fluency", icon: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  )},
  { key: "comprehension" as const, label: "Comprehension", icon: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  )},
];

export function SummaryStep({
  lessonTitle, pronunciationScore, fluencyScore, comprehensionScore,
  xpEarned, difficultWordsCount, onAction,
}: SummaryStepProps) {
  const [countedXP, setCountedXP] = useState(0);

  useEffect(() => {
    if (xpEarned === 0) { setCountedXP(0); return; }
    const steps = 30;
    const inc = xpEarned / steps;
    let cur = 0;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= xpEarned) { setCountedXP(xpEarned); clearInterval(t); }
      else setCountedXP(Math.round(cur));
    }, 40);
    return () => clearInterval(t);
  }, [xpEarned]);

  const scores = {
    pronunciation: pronunciationScore,
    fluency: fluencyScore,
    comprehension: comprehensionScore,
  };

  const avg = pronunciationScore !== null && fluencyScore !== null && comprehensionScore !== null
    ? (pronunciationScore + fluencyScore + comprehensionScore) / 3
    : null;

  const tier = avg === null ? "done" : avg >= 8 ? "great" : avg >= 5 ? "good" : "keep";

  const trophyColor = tier === "great" ? "from-yellow-400 to-amber-500"
    : tier === "good" ? "from-[var(--color-primary)] to-[var(--color-primary-light)]"
    : "from-slate-400 to-slate-500";

  const message = tier === "great" ? "Outstanding!" : tier === "good" ? "Great effort!" : tier === "keep" ? "Keep practising!" : "Lesson complete!";
  const subtitle = tier === "great" ? "You nailed this lesson." : tier === "good" ? "Solid work — keep it up." : "Every practice makes you better.";

  return (
    <div className="flex-1 flex flex-col items-center px-4 pt-8 pb-6 max-w-sm mx-auto w-full gap-6">

      {/* Trophy */}
      <div className="flex flex-col items-center gap-3">
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${trophyColor} flex items-center justify-center shadow-xl`}>
          <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9H4a2 2 0 000 4c0 1.7 1.3 3 3 3M18 9h2a2 2 0 010 4c0 1.7-1.3 3-3 3M8 21h8M12 17v4M8 9V3h8v6a4 4 0 01-8 0z"/>
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-[var(--color-text)]">{message}</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{subtitle}</p>
          <p className="text-xs text-[var(--color-muted)] mt-1">&ldquo;{lessonTitle}&rdquo;</p>
        </div>
      </div>

      {/* XP counter */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] p-5 flex flex-col items-center gap-1 shadow-lg shadow-[var(--color-primary)]/20">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
          <span className="text-5xl font-extrabold text-white tabular-nums" aria-label={`${xpEarned} XP earned`}>
            +{countedXP}
          </span>
        </div>
        <span className="text-xs font-bold text-white/70 uppercase tracking-widest">XP Earned</span>
      </div>

      {/* Score grid */}
      {avg !== null && (
        <div className="w-full grid grid-cols-3 gap-3">
          {SCORE_ITEMS.map(({ key, label, icon }) => {
            const s = scores[key];
            const good = s !== null && s >= 7;
            const ok   = s !== null && s >= 4 && s < 7;
            return (
              <div key={key} className="rounded-xl bg-white border border-[var(--color-border)] shadow-sm p-3 flex flex-col items-center gap-1.5">
                <div className={[
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  good ? "bg-emerald-100 text-emerald-600" :
                  ok   ? "bg-amber-100 text-amber-600" :
                         "bg-red-100 text-red-500",
                ].join(" ")}>
                  {icon}
                </div>
                <p className={["text-xl font-extrabold tabular-nums",
                  good ? "text-emerald-600" : ok ? "text-amber-600" : "text-red-500"
                ].join(" ")}>
                  {s !== null ? s.toFixed(1) : "—"}
                </p>
                <p className="text-[9px] text-[var(--color-muted)] uppercase tracking-wide text-center leading-tight">
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* CTAs */}
      <div className="w-full space-y-2.5 mt-auto">
        <Button variant="primary" size="lg" className="w-full" onClick={() => onAction("next")}>
          Next lesson →
        </Button>
        {difficultWordsCount > 0 && (
          <Button variant="secondary" size="md" className="w-full" onClick={() => onAction("review")}>
            Review {difficultWordsCount} difficult word{difficultWordsCount !== 1 ? "s" : ""}
          </Button>
        )}
        <Button variant="ghost" size="md" className="w-full" onClick={() => onAction("replay")}>
          Try again
        </Button>
      </div>
    </div>
  );
}
