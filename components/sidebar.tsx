"use client";

import React from "react";
import {
  Inbox,
  Wallet,
  Sparkles,
  ChevronRight,
  Landmark,
} from "lucide-react";

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
    title: "To-do",
    url: "/app/todo",
    icon: Inbox,
    description: "Manage tasks",
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
];

const SidebarApp = () => {
  const { setOpenMobile, state } = useSidebar();
  const pathname = usePathname();
  const isCollapsed = state === "collapsed";

  const isActive = (url: string) => {
    if (url === "/app/todo") return pathname.startsWith("/app/todo");
    if (url.includes("expense-tracker"))
      return pathname.startsWith("/app/expense-tracker");
    if (url.includes("portfolio"))
      return pathname.startsWith("/app/portfolio");
    return pathname === url;
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Branded Header */}
      <SidebarHeader className="border-b border-sidebar-border/50 px-3 py-4">
        <Link
          href="/app"
          className={cn(
            "flex items-center gap-2.5 transition-all duration-200",
            isCollapsed && "justify-center",
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-md shadow-primary/25">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
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
                          "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
                      )}
                    >
                      <Link
                        href={item.url}
                        onClick={() => setOpenMobile(false)}
                      >
                        {active && !isCollapsed && (
                          <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                        )}
                        <item.icon
                          className={cn(
                            "size-[18px] shrink-0 transition-colors duration-200",
                            active
                              ? "text-primary"
                              : "text-sidebar-foreground/60 group-hover/btn:text-sidebar-foreground",
                          )}
                        />
                        <div className="flex flex-1 items-center justify-between">
                          <span
                            className={cn(
                              "text-[13px] transition-colors duration-200",
                              active
                                ? "font-semibold text-primary"
                                : "font-medium text-sidebar-foreground/80 group-hover/btn:text-sidebar-foreground",
                            )}
                          >
                            {item.title}
                          </span>
                          {active && !isCollapsed && (
                            <ChevronRight className="size-3.5 text-primary/60" />
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
      {!isCollapsed && (
        <SidebarFooter className="border-t border-sidebar-border/50 px-3 py-3">
          <div className="rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 px-3 py-2.5">
            <p className="text-[11px] font-medium text-sidebar-foreground/60">
              Make Me Productive
            </p>
            <p className="mt-0.5 text-[10px] text-sidebar-foreground/40">
              Your all-in-one workspace
            </p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};

export default SidebarApp;
