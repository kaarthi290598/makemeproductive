"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "./overview";
import { TransactionList } from "./transaction-list";
import { RecentTransactions } from "./recent-transactions";
import { Settings } from "./settings";
import { Analytics } from "./analytics";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { Button } from "@/components/ui/button";
import { useExpenseStore } from "@/hooks/use-expense-store";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { RefreshCcw, Trash } from "lucide-react";

export function ExpenseDashboard() {
  const { reconcileBudget, resetData } = useExpenseStore();

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Expense Tracker</h2>
        <div className="flex items-center space-x-2">
          <ConfirmDialog
            title="Reset All Data"
            description="Are you sure you want to reset all data? This cannot be undone."
            onConfirm={() => {
              resetData();
              toast.success("All data reset");
            }}
            variant="destructive"
            confirmText="Reset Data"
            trigger={
              <Button variant="outline" title="Reset All Data">
                <Trash className="mr-2 h-4 w-4" />
                Reset
              </Button>
            }
          />
          <ConfirmDialog
            title="Close Month"
            description="Are you sure you want to close the current month? This will reset spent amounts and carry over savings."
            onConfirm={() => {
              reconcileBudget(new Date().toISOString().slice(0, 7)); // YYYY-MM
              toast.success("Month closed successfully");
            }}
            confirmText="Close Month"
            trigger={
              <Button variant="outline">
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
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Overview />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* We can add recent transactions or simple charts here if we want */}
            <div className="col-span-4">
              <Analytics />
            </div>
            <div className="col-span-3">
              <RecentTransactions />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="transactions" className="space-y-4">
          <TransactionList />
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Analytics />
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <Settings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
