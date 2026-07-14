"use client";

import { useEffect, useState } from "react";
import { useExpenseStore } from "@/hooks/use-expense-store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddTransactionDialog } from "@/components/expense-tracker/add-transaction-dialog";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ModuleSkeleton } from "@/components/module-skeleton";
import { Suspense } from "react";
import { PlusCircle, MinusCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ExpenseTrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initialize, loading, error } = useExpenseStore();
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
    <div className="flex h-full w-full flex-col gap-4 overflow-y-auto p-3 lg:gap-6 lg:p-6">
      {/* Header section matching Todo style */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">
            Expense Tracker
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground lg:text-sm">
            Monitor budgets, balance sheets, and cash flow in real-time
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {!loading && !error && (
            <>
              <AddTransactionDialog
                defaultType="income"
                trigger={
                  <Button
                    size="sm"
                    className="h-9 gap-1.5 rounded-lg bg-emerald-600 px-3 hover:bg-emerald-700 text-white"
                  >
                    <PlusCircle className="size-4" />
                    <span>Add Credit</span>
                  </Button>
                }
              />
              <AddTransactionDialog
                defaultType="expense"
                trigger={
                  <Button
                    size="sm"
                    className="h-9 gap-1.5 rounded-lg bg-destructive px-3 hover:bg-destructive/90 text-white"
                  >
                    <MinusCircle className="size-4" />
                    <span>Add Debit</span>
                  </Button>
                }
              />
            </>
          )}
        </div>
      </div>

      {/* Tabs list matching modernized navigation */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full space-y-4"
      >
        <TabsList className="bg-muted/50 p-1 rounded-xl h-10 w-full sm:w-auto sm:inline-flex flex">
          <TabsTrigger
            value="overview"
            className="rounded-lg px-4 py-1.5 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="rounded-lg px-4 py-1.5 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-lg px-4 py-1.5 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-lg px-4 py-1.5 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 min-h-[400px]">
          {loading ? (
            <div className="w-full">
              <ModuleSkeleton />
            </div>
          ) : error ? (
            <div className="flex h-[400px] w-full items-center justify-center text-destructive font-medium">
              Error: {error}
            </div>
          ) : (
            <Suspense fallback={<ModuleSkeleton />}>{children}</Suspense>
          )}
        </div>
      </Tabs>
    </div>
  );
}
