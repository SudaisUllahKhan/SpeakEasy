"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ScoreCardProps {
  label: string;
  score: number | null;
  icon: ReactNode;
  description?: string;
  className?: string;
}

const scoreColor = (score: number | null) => {
  if (score === null) return "text-[var(--color-muted)]";
  if (score >= 8) return "text-[var(--color-success)]";
  if (score >= 5) return "text-[var(--color-warning)]";
  return "text-[var(--color-danger)]";
};

const scoreLabel = (score: number | null) => {
  if (score === null) return "—";
  if (score >= 9) return "Excellent";
  if (score >= 7) return "Great";
  if (score >= 5) return "Good";
  if (score >= 3) return "Keep going";
  return "Needs practice";
};

export function ScoreCard({ label, score, icon, description, className }: ScoreCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-card)] p-4 text-center",
        className
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          score === null ? "bg-[var(--color-surface-2)] text-[var(--color-muted)]"
          : score >= 8   ? "bg-green-50 text-[var(--color-success)]"
          : score >= 5   ? "bg-amber-50 text-amber-600"
                         : "bg-red-50 text-[var(--color-danger)]"
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <span className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
        {label}
      </span>
      <span
        className={cn("text-3xl font-extrabold tabular-nums leading-none", scoreColor(score))}
        aria-label={`${label}: ${score ?? "not scored"} out of 10`}
      >
        {score !== null ? score.toFixed(1) : "—"}
      </span>
      <span className="text-[10px] text-[var(--color-muted)]">{scoreLabel(score)}</span>
      {description && (
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">{description}</p>
      )}
    </div>
  );
}
