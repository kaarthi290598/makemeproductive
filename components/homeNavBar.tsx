"use client";

import React from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { ModeToggle } from "./darkModeToggle";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  Wallet,
  Landmark,
  CreditCard,
  CalendarSync,
  KeyRound,
  Sparkles,
  Download,
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
    <div className="sticky top-0 z-30 flex h-[calc(3rem+env(safe-area-inset-top,0px))] w-full min-w-0 flex-row items-center justify-between border-b border-slate-200/90 bg-white/90 px-3 pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90 sm:h-14 sm:px-6 sm:pt-0">
      {/* Left: Sidebar Trigger + Page Title Badge */}
      <div className="flex min-w-0 flex-1 items-center gap-2 mr-2">
        <SidebarTrigger className="size-8 shrink-0 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800" />

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 sm:hidden">
            <Icon className="size-3.5" />
          </div>
          <span className="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-white sm:text-base">
            {context.title}
          </span>
        </div>
      </div>

      {/* Right: Install Button + Mode Toggle + User Profile */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <NavBarInstallButton />
        <ModeToggle />
        <div className="flex size-8 shrink-0 items-center justify-center">
          <UserButton
            afterSignOutUrl="/"
            userProfileMode="modal"
            appearance={{
              elements: {
                avatarBox: "size-8",
                userButtonAvatarBox: "size-8",
                userButtonPopoverCard:
                  "shadow-2xl border border-slate-200 dark:border-slate-800",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

function NavBarInstallButton() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  if (isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    if (isInstallable) {
      await promptInstall();
    } else {
      const isIOS =
        typeof window !== "undefined" &&
        /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
      if (isIOS) {
        toast.info(
          "To install on iOS: Tap the Share button (⎋) at the bottom of Safari and choose 'Add to Home Screen' (+)",
        );
      } else {
        toast.info(
          "To install: Open browser menu (⋮) and choose 'Install ToolCity' or 'Add to Home Screen'",
        );
      }
    }
  };

  return (
    <Button
      size="sm"
      onClick={handleInstall}
      className="h-7 gap-1 rounded-lg bg-emerald-600 px-2 text-[11px] font-bold text-white shadow-xs transition-all hover:bg-emerald-500 active:scale-95 sm:h-8 sm:gap-1.5 sm:px-2.5 sm:text-xs"
    >
      <Download className="size-3.5" />
      <span className="hidden sm:inline">Install</span>
    </Button>
  );
}
