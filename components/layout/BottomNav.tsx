"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { HomeIcon, GridIcon, StarIcon, ChartIcon, SettingsIcon } from "@/components/ui/Icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home",     Icon: HomeIcon     },
  { href: "/topics",    label: "Topics",   Icon: GridIcon     },
  { href: "/review",    label: "Review",   Icon: StarIcon     },
  { href: "/progress",  label: "Progress", Icon: ChartIcon    },
  { href: "/settings",  label: "Settings", Icon: SettingsIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe"
      style={{ background: "var(--color-nav)", boxShadow: "0 -1px 0 rgba(255,255,255,0.06), 0 -8px 32px rgba(0,0,0,0.35)" }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-3 min-h-[56px] min-w-[56px] relative"
              aria-current={active ? "page" : undefined}
            >
              {/* Active pill background */}
              {active && (
                <span
                  className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-7 rounded-full"
                  style={{ background: "rgba(167,139,250,0.32)" }}
                  aria-hidden="true"
                />
              )}
              <Icon
                size={22}
                className={cn(
                  "relative z-10 transition-all duration-200",
                  active
                    ? "text-white stroke-[2.5]"
                    : "text-white/45 stroke-[1.8]"
                )}
              />
              <span className={cn(
                "text-[10px] font-semibold relative z-10 transition-colors",
                active ? "text-white" : "text-white/40"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
