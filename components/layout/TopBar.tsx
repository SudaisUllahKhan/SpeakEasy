"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { StreakIcon } from "@/components/ui/Icons";
import type { UserProfile } from "@/types";

interface TopBarProps {
  user?: UserProfile | null;
  title?: string;
  showBack?: boolean;
  backHref?: string;
  transparent?: boolean;
}

export function TopBar({
  user,
  title,
  showBack = false,
  backHref = "/dashboard",
  transparent = false,
}: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between px-4 h-14",
        transparent
          ? "bg-transparent"
          : "bg-[var(--color-nav)] shadow-lg shadow-black/20"
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-2 min-w-[40px]">
        {showBack ? (
          <Link
            href={backHref}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 transition-colors"
            aria-label="Go back"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-0.5" aria-label="SpeakEasy home">
            <span className="text-[1.25rem] font-black text-white tracking-tight">Speak</span>
            <span className="text-[1.25rem] font-black tracking-tight" style={{ color: "#818CF8" }}>Easy</span>
          </Link>
        )}
      </div>

      {/* Centre title */}
      {title && (
        <h1 className="absolute left-1/2 -translate-x-1/2 text-sm font-bold text-white/90 truncate max-w-[45%]">
          {title}
        </h1>
      )}

      {/* Right — streak + XP pills */}
      {user && (
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10"
            aria-label={`${user.streakCount} day streak`}
          >
            <StreakIcon size={14} className="text-orange-400" />
            <span className="text-sm font-bold text-white">{user.streakCount}</span>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10"
            aria-label={`${user.totalXP} XP`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24" aria-hidden="true">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
            <span className="text-xs font-bold text-white">{user.totalXP.toLocaleString()}</span>
          </div>
        </div>
      )}
    </header>
  );
}
