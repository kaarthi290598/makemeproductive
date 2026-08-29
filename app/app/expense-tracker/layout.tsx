"use client";

import { useCallback, useEffect, Suspense, useState, useTransition } from "react";
import { useExpenseStore } from "@/hooks/use-expense-store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddTransactionDialog } from "@/components/expense-tracker/add-transaction-dialog";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ModuleSkeleton } from "@/components/module-skeleton";
import { ExpenseTabReadyProvider } from "@/components/expense-tracker/tab-ready";
import { cn } from "@/lib/utils";
import {
  Plus,
  Minus,
  LayoutDashboard,
  Receipt,
  BarChart3,
  Settings,
} from "lucide-react";

const tabTriggerClass =
  "h-auto shrink-0 gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-600 shadow-none sm:gap-1.5 sm:px-3.5 sm:text-xs dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white";

export default function ExpenseTrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialize = useExpenseStore((s) => s.initialize);
  const loading = useExpenseStore((s) => s.loading);
  const error = useExpenseStore((s) => s.error);
  const pathname = usePathname();
  const router = useRouter();
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [tabReady, setTabReady] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const activeTab = pathname.split("/").pop() || "overview";
  const displayedTab = pendingTab ?? activeTab;

  useEffect(() => {
    setPendingTab(null);
  }, [pathname]);

  const handleTabChange = (value: string) => {
    if (value === activeTab) return;
    setPendingTab(value);
    setTabReady(false);
    startTransition(() => {
      router.push(`/app/expense-tracker/${value}`);
    });
  };

  const onReadyChange = useCallback((ready: boolean) => {
    setTabReady(ready);
  }, []);

  const showTabLoading =
    loading ||
    !tabReady ||
    isPending ||
    (pendingTab !== null && pendingTab !== activeTab);

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:p-8">
      <Tabs
        value={displayedTab}
        onValueChange={handleTabChange}
        className="flex min-h-0 w-full min-w-0 flex-1 flex-col"
      >
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <div className="min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className="inline-flex h-auto w-max justify-start gap-1 rounded-xl border border-slate-200/60 bg-slate-100 p-1 dark:border-slate-700/60 dark:bg-slate-800 sm:gap-1.5">
              <TabsTrigger value="overview" className={cn(tabTriggerClass, "shrink-0 whitespace-nowrap")}>
                <LayoutDashboard className="h-3.5 w-3.5 text-emerald-600" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="transactions" className={cn(tabTriggerClass, "shrink-0 whitespace-nowrap")}>
                <Receipt className="h-3.5 w-3.5 text-blue-500" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="analytics" className={cn(tabTriggerClass, "shrink-0 whitespace-nowrap")}>
                <BarChart3 className="h-3.5 w-3.5 text-violet-500" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className={cn(tabTriggerClass, "shrink-0 whitespace-nowrap")}>
                <Settings className="h-3.5 w-3.5 text-slate-500" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {!loading && !error && (
            <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
              <AddTransactionDialog
                defaultType="income"
                trigger={
                  <Button
                    size="sm"
                    className="h-9 flex-1 gap-1.5 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-500 sm:flex-none sm:px-3.5"
                  >
                    <Plus className="size-4" />
                    Credit
                  </Button>
                }
              />
              <AddTransactionDialog
                defaultType="expense"
                trigger={
                  <Button
                    size="sm"
                    className="h-9 flex-1 gap-1.5 rounded-xl bg-rose-600 px-3 text-sm font-bold text-white shadow-sm shadow-rose-600/20 hover:bg-rose-500 sm:flex-none sm:px-3.5"
                  >
                    <Minus className="size-4" />
                    Debit
                  </Button>
                }
              />
            </div>
          )}
        </div>

        <div className="relative mt-5 min-h-[400px] flex-1">
          {error ? (
            <div className="flex h-[320px] w-full items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </div>
          ) : (
            <ExpenseTabReadyProvider onReadyChange={onReadyChange}>
              {showTabLoading && (
                <div className="absolute inset-0 z-10 bg-background">
                  <ModuleSkeleton />
                </div>
              )}
              <div className={showTabLoading ? "invisible" : undefined}>
                <Suspense fallback={<ModuleSkeleton />}>{children}</Suspense>
              </div>
            </ExpenseTabReadyProvider>
          )}
        </div>
      </Tabs>
    </div>
  );
}
