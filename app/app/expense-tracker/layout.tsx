"use client";

import { useEffect, Suspense } from "react";
import { useExpenseStore } from "@/hooks/use-expense-store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddTransactionDialog } from "@/components/expense-tracker/add-transaction-dialog";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ModuleSkeleton } from "@/components/module-skeleton";
import { Plus, Minus } from "lucide-react";
import {
  FinancePageHeader,
  tabListClassName,
  tabTriggerClassName,
} from "@/components/finance/page-header";

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

  useEffect(() => {
    initialize();
  }, [initialize]);

  const activeTab = pathname.split("/").pop() || "overview";

  const handleTabChange = (value: string) => {
    router.push(`/app/expense-tracker/${value}`);
  };

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto p-4 lg:gap-6 lg:p-8">
      <FinancePageHeader
        title="Expenses"
        subtitle="Track cash flow, budgets, and settlements"
        actions={
          !loading && !error ? (
            <>
              <AddTransactionDialog
                defaultType="income"
                trigger={
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 gap-1.5 rounded-full border-emerald-500/30 bg-emerald-500/10 px-4 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400"
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
                    variant="outline"
                    className="h-10 gap-1.5 rounded-full border-rose-500/30 bg-rose-500/10 px-4 text-rose-700 hover:bg-rose-500/15 dark:text-rose-400"
                  >
                    <Minus className="size-4" />
                    Debit
                  </Button>
                }
              />
            </>
          ) : undefined
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex min-h-0 w-full flex-1 flex-col"
      >
        <TabsList className={tabListClassName()}>
          <TabsTrigger value="overview" className={tabTriggerClassName()}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions" className={tabTriggerClassName()}>
            Transactions
          </TabsTrigger>
          <TabsTrigger value="analytics" className={tabTriggerClassName()}>
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className={tabTriggerClassName()}>
            Settings
          </TabsTrigger>
        </TabsList>

        <div className="mt-5 min-h-[400px] flex-1">
          {loading ? (
            <ModuleSkeleton />
          ) : error ? (
            <div className="flex h-[320px] w-full items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 text-sm font-medium text-destructive">
              {error}
            </div>
          ) : (
            <Suspense fallback={<ModuleSkeleton />}>{children}</Suspense>
          )}
        </div>
      </Tabs>
    </div>
  );
}
