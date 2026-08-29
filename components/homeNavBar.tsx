"use client";

import React from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { ModeToggle } from "./darkModeToggle";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Landmark,
  CreditCard,
  CalendarSync,
  KeyRound,
  Sparkles,
} from "lucide-react";

export default function HomeNavBar() {
  const pathname = usePathname();

  const getPageContext = () => {
    if (pathname === "/app") return { title: "Dashboard", icon: LayoutDashboard };
    if (pathname.startsWith("/app/expense-tracker")) return { title: "Expense Tracker", icon: Wallet };
    if (pathname.startsWith("/app/portfolio")) return { title: "Portfolio & Debts", icon: Landmark };
    if (pathname.startsWith("/app/credit-dues")) return { title: "Credit & Dues", icon: CreditCard };
    if (pathname.startsWith("/app/subscriptions")) return { title: "Subscriptions", icon: CalendarSync };
    if (pathname.startsWith("/app/passwords")) return { title: "Password Vault", icon: KeyRound };
    return { title: "ToolCity", icon: Sparkles };
  };

  const context = getPageContext();
  const Icon = context.icon;

  return (
    <div className="sticky top-0 z-30 flex h-12 w-full min-w-0 flex-row items-center justify-between border-b border-slate-200/90 bg-white/90 px-3 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90 sm:h-14 sm:px-6">
      {/* Left: Sidebar Trigger + Page Title Badge */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="size-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800" />

        <div className="flex items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 sm:hidden">
            <Icon className="size-3.5" />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white sm:text-base">
            {context.title}
          </span>
        </div>
      </div>

      {/* Right: Mode Toggle + User Profile */}
      <div className="flex items-center gap-2">
        <ModeToggle />
        <div className="flex size-8 items-center justify-center">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
}
