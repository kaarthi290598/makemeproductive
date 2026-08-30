"use client";

import React from "react";
import {
  Inbox,
  Wallet,
  Sparkles,
  ChevronRight,
  Landmark,
  LayoutDashboard,
  KeyRound,
  CalendarSync,
  CreditCard,
  Download,
  Settings,
  LogOut,
} from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { toast } from "sonner";
import { useUser, useClerk, UserButton } from "@clerk/nextjs";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Dashboard",
    url: "/app",
    icon: LayoutDashboard,
    description: "Overview",
  },
  {
    title: "Expense Tracker",
    url: "/app/expense-tracker/overview",
    icon: Wallet,
    description: "Track spending",
  },
  {
    title: "Investments & Debts",
    url: "/app/portfolio/overview",
    icon: Landmark,
    description: "Assets & liabilities",
  },
  {
    title: "Credit & Dues",
    url: "/app/credit-dues",
    icon: CreditCard,
    description: "Card limits & dues",
  },
  {
    title: "Subscriptions",
    url: "/app/subscriptions",
    icon: CalendarSync,
    description: "Recurring bills",
  },
  {
    title: "Password Manager",
    url: "/app/passwords",
    icon: KeyRound,
    description: "Vault & credentials",
  },
];

const SidebarApp = () => {
  const { setOpenMobile, state } = useSidebar();
  const pathname = usePathname();
  const isCollapsed = state === "collapsed";

  const isActive = (url: string) => {
    if (url === "/app") return pathname === "/app";
    if (url === "/app/credit-dues")
      return pathname.startsWith("/app/credit-dues");
    if (url === "/app/subscriptions")
      return pathname.startsWith("/app/subscriptions");
    if (url === "/app/passwords") return pathname.startsWith("/app/passwords");
    if (url.includes("expense-tracker"))
      return pathname.startsWith("/app/expense-tracker");
    if (url.includes("portfolio"))
      return pathname.startsWith("/app/portfolio");
    return pathname === url;
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Branded Header */}
      <SidebarHeader className="border-b border-sidebar-border/50 px-3 py-4 pt-[max(1rem,calc(env(safe-area-inset-top,0px)+0.5rem))]">
        <Link
          href="/app"
          className={cn(
            "flex items-center gap-2.5 transition-all duration-200",
            isCollapsed && "justify-center",
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-600/25">
            <Sparkles className="size-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
                Productive
              </span>
              <span className="text-[10px] font-medium text-sidebar-foreground/50">
                Stay focused
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup className="p-0">
          {!isCollapsed && (
            <div className="mb-2 px-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                Workspace
              </span>
            </div>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {items.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className={cn(
                        "group/btn relative h-9 transition-all duration-200",
                        active &&
                          "bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/15 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-400",
                      )}
                    >
                      <Link
                        href={item.url}
                        onClick={() => setOpenMobile(false)}
                      >
                        {active && !isCollapsed && (
                          <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-600" />
                        )}
                        <item.icon
                          className={cn(
                            "size-[18px] shrink-0 transition-colors duration-200",
                            active
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-sidebar-foreground/60 group-hover/btn:text-sidebar-foreground",
                          )}
                        />
                        <div className="flex flex-1 items-center justify-between">
                          <span
                            className={cn(
                              "text-[13px] transition-colors duration-200",
                              active
                                ? "font-bold text-emerald-700 dark:text-emerald-400"
                                : "font-medium text-sidebar-foreground/80 group-hover/btn:text-sidebar-foreground",
                            )}
                          >
                            {item.title}
                          </span>
                          {active && !isCollapsed && (
                            <ChevronRight className="size-3.5 text-emerald-600/60" />
                          )}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border/50 p-2.5 pb-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))]">
        {isCollapsed ? (
          <div className="flex w-full items-center justify-center py-1">
            <UserButton
              afterSignOutUrl="/"
              userProfileMode="modal"
              appearance={{
                elements: {
                  avatarBox: "size-8",
                  userButtonAvatarBox: "size-8",
                },
              }}
            />
          </div>
        ) : (
          <SidebarUserAccountCard />
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

function SidebarUserAccountCard() {
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const { setOpenMobile } = useSidebar();

  const handleOpenProfile = () => {
    setOpenMobile(false);
    openUserProfile();
  };

  const handleSignOut = () => {
    setOpenMobile(false);
    signOut({ redirectUrl: "/" });
  };

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Account";

  const email = user?.primaryEmailAddress?.emailAddress || "";

  return (
    <div className="space-y-2">
      <SidebarInstallButton />

      {/* Clerk User Account & Settings Card */}
      <div className="rounded-xl border border-sidebar-border/70 bg-sidebar-accent/40 p-2.5 backdrop-blur-xs transition-colors hover:bg-sidebar-accent/70">
        <div className="flex items-center gap-2.5">
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
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold tracking-tight text-sidebar-foreground">
              {displayName}
            </p>
            {email && (
              <p className="truncate text-[10px] text-sidebar-foreground/50">
                {email}
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1 border-t border-sidebar-border/50 pt-2">
          <button
            type="button"
            onClick={handleOpenProfile}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-left text-[11px] font-bold text-emerald-700 transition-all hover:bg-emerald-500/20 active:scale-[0.98] dark:text-emerald-400"
          >
            <Settings className="size-3.5" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            title="Sign Out"
            className="flex size-7.5 items-center justify-center rounded-lg border border-sidebar-border/40 text-sidebar-foreground/60 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SidebarInstallButton() {
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
    <button
      type="button"
      onClick={handleInstall}
      className="flex w-full items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-left text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-500/20 active:scale-[0.98] dark:text-emerald-300"
    >
      <div className="flex items-center gap-2">
        <Download className="size-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Install App</span>
      </div>
      <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white">
        PWA
      </span>
    </button>
  );
}

export default SidebarApp;
