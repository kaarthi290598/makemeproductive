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
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Expense Tracker</h2>
        <div className="flex items-center space-x-2">
          {!loading && !error && (
            <>
              <ConfirmDialog
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
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                }
              />
              <ConfirmDialog
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
                  <Button variant="outline" disabled={isClosingMonth}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Close Month
                  </Button>
                }
              />
              <AddTransactionDialog
                defaultType="income"
                trigger={<Button>Add Credit</Button>}
              />
              <AddTransactionDialog
                defaultType="expense"
                trigger={<Button>Add Debit</Button>}
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
