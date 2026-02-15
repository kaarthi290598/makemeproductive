"use client";

import { useEffect, useState } from "react";
import { useExpenseStore } from "@/hooks/use-expense-store";
import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddTransactionDialog } from "@/components/expense-tracker/add-transaction-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { RefreshCcw, Trash } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import SpinnerLoad from "@/components/spinner";
import { Suspense } from "react";

export default function ExpenseTrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initialize, loading, error, reconcileBudget, resetData } =
    useExpenseStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const activeTab = pathname.split("/").pop() || "overview";
  const [isResetting, setIsResetting] = useState(false);
  const [isClosingMonth, setIsClosingMonth] = useState(false);

  const handleTabChange = (value: string) => {
    router.push(`/app/expense-tracker/${value}`);
  };

  return (
    <div className="h-full flex-1 space-y-4 overflow-y-auto p-4 pt-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          Expense Tracker
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {!loading && !error && (
            <>
              {/* <ConfirmDialog
                title="Reset All Data"
                description="Are you sure you want to reset all data? This cannot be undone."
                onConfirm={async () => {
                  setIsResetting(true);
                  try {
                    await resetData();
                    toast.success("All data reset");
                  } finally {
                    setIsResetting(false);
                  }
                }}
                loading={isResetting}
                variant="destructive"
                confirmText="Reset Data"
                trigger={
                  <Button
                    variant="outline"
                    title="Reset All Data"
                    disabled={isResetting}
                    size="sm"
                    className="h-9 px-3"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <span className="xs:inline hidden">Reset</span>
                  </Button>
                }
              /> */}
              {/* <ConfirmDialog
                title="Close Month"
                description="Are you sure you want to close the current month? This will reset spent amounts and carry over savings."
                onConfirm={async () => {
                  setIsClosingMonth(true);
                  try {
                    await reconcileBudget(new Date().toISOString().slice(0, 7));
                    toast.success("Month closed successfully");
                  } finally {
                    setIsClosingMonth(false);
                  }
                }}
                loading={isClosingMonth}
                confirmText="Close Month"
                trigger={
                  <Button
                    variant="outline"
                    disabled={isClosingMonth}
                    size="sm"
                    className="h-9 px-3"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    <span className="xs:inline hidden">Close Month</span>
                  </Button>
                }
              /> */}
              <AddTransactionDialog
                defaultType="income"
                trigger={
                  <Button size="sm" className="h-9 px-3">
                    <span className="xs:hidden">+</span>
                    <span className="">Add Credit</span>
                  </Button>
                }
              />
              <AddTransactionDialog
                defaultType="expense"
                trigger={
                  <Button size="sm" className="h-9 px-3">
                    <span className="xs:hidden">-</span>
                    <span className="">Add Debit</span>
                  </Button>
                }
              />
            </>
          )}
        </div>
      </div>

      {loading ? (
        <SpinnerLoad />
      ) : error ? (
        <div className="flex h-[400px] w-full items-center justify-center text-destructive">
          Error: {error}
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <div className="mt-4">
            <Suspense fallback={<SpinnerLoad />}>{children}</Suspense>
          </div>
        </Tabs>
      )}
    </div>
  );
}
