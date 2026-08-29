"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Landmark,
  CreditCard,
  CalendarSync,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Home",
    url: "/app",
    icon: LayoutDashboard,
    isActive: (pathname: string) => pathname === "/app",
  },
  {
    title: "Expenses",
    url: "/app/expense-tracker/overview",
    icon: Wallet,
    isActive: (pathname: string) => pathname.startsWith("/app/expense-tracker"),
  },
  {
    title: "Portfolio",
    url: "/app/portfolio/overview",
    icon: Landmark,
    isActive: (pathname: string) => pathname.startsWith("/app/portfolio"),
  },
  {
    title: "Cards",
    url: "/app/credit-dues",
    icon: CreditCard,
    isActive: (pathname: string) => pathname.startsWith("/app/credit-dues"),
  },
  {
    title: "Bills",
    url: "/app/subscriptions",
    icon: CalendarSync,
    isActive: (pathname: string) => pathname.startsWith("/app/subscriptions"),
  },
  {
    title: "Vault",
    url: "/app/passwords",
    icon: KeyRound,
    isActive: (pathname: string) => pathname.startsWith("/app/passwords"),
  },
];

export function AndroidBottomNav() {
  const pathname = usePathname();

  // Only render within the authenticated /app workspace
  if (!pathname.startsWith("/app")) return null;

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed inset-x-0 bottom-0 z-40 block border-t border-slate-200/90 bg-white/95 pb-[max(0.45rem,calc(env(safe-area-inset-bottom)+0.25rem))] pt-1.5 shadow-[0_-2px_15px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all dark:border-slate-800/80 dark:bg-slate-950/95 md:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-6 items-center px-1">
        {navItems.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.url}
              className="group relative flex flex-col items-center justify-center py-0.5 text-center transition-all select-none"
            >
              {/* Material 3 Active Pill Indicator */}
              <div
                className={cn(
                  "relative flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200",
                  active
                    ? "bg-emerald-600/15 text-emerald-700 shadow-2xs dark:bg-emerald-500/20 dark:text-emerald-400 ring-1 ring-emerald-500/30"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white active:scale-90",
                )}
              >
                <Icon
                  className={cn(
                    "size-5 transition-transform duration-200",
                    active && "scale-105",
                  )}
                />
              </div>

              {/* Label */}
              <span
                className={cn(
                  "mt-1 text-[11px] tracking-tight transition-colors duration-200 leading-none",
                  active
                    ? "font-extrabold text-emerald-700 dark:text-emerald-400"
                    : "font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white",
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
