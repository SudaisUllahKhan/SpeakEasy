import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "primary" | "success" | "warning" | "danger" | "muted" | "level" | "a1" | "a2" | "b1";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "primary", children, className }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    primary: "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20",
    success: "bg-[var(--color-success)]/10 text-[var(--color-accent-dark)] border border-[var(--color-success)]/20",
    warning: "bg-[var(--color-warning)]/10 text-amber-700 border border-[var(--color-warning)]/20",
    danger:  "bg-[var(--color-danger)]/10 text-red-700 border border-[var(--color-danger)]/20",
    muted:   "bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)]",
    level:   "bg-[var(--color-primary)] text-white font-bold",
    a1:      "bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold",
    a2:      "bg-blue-100 text-blue-700 border border-blue-200 font-bold",
    b1:      "bg-violet-100 text-violet-700 border border-violet-200 font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
