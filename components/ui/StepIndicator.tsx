"use client";

import type { LessonStep } from "@/types";

const STEPS: { key: LessonStep; label: string }[] = [
  { key: "listen",    label: "Listen"   },
  { key: "read",      label: "Read"     },
  { key: "questions", label: "Questions"},
  { key: "feedback",  label: "Feedback" },
  { key: "summary",   label: "Summary"  },
];

interface StepIndicatorProps {
  current: LessonStep;
}

export function StepIndicator({ current }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <nav aria-label="Lesson steps" className="flex items-center gap-2 px-4">
      {STEPS.map((step, i) => {
        const done    = i < currentIndex;
        const active  = i === currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-2 flex-1 last:flex-none">
            {/* Dot */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  done   ? "bg-[var(--color-accent)] scale-100" : "",
                  active ? "bg-[var(--color-primary)] scale-125 ring-2 ring-[var(--color-primary)]/30" : "",
                  !done && !active ? "bg-[var(--color-border)]" : "",
                ].join(" ")}
                aria-current={active ? "step" : undefined}
                aria-label={`${step.label}${done ? " (done)" : active ? " (current)" : ""}`}
              />
              <span
                className={[
                  "text-[10px] font-medium hidden sm:block",
                  active ? "text-[var(--color-primary)]" : "text-[var(--color-muted)]",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {/* Connector line — not after last item */}
            {i < STEPS.length - 1 && (
              <div
                className={[
                  "flex-1 h-0.5 rounded-full transition-all duration-300",
                  done ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
