"use client";

import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";
import type { UserProfile } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  user?: UserProfile | null;
  title?: string;
  showBack?: boolean;
  backHref?: string;
  hideNav?: boolean;
}

export function AppShell({
  children,
  user,
  title,
  showBack = false,
  backHref,
  hideNav = false,
}: AppShellProps) {
  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar user={user} title={title} showBack={showBack} backHref={backHref} />
      <main className={`flex-1 ${hideNav ? "" : "pb-20"}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
