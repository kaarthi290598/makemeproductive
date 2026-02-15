"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useExpenseStore } from "@/hooks/use-expense-store";
import { ArrowDownIcon, ArrowUpIcon, Wallet } from "lucide-react";

interface OverviewProps {
  dateFilterType?: "all" | "month" | "year";
  selectedDate?: string;
}

export function Overview({
  dateFilterType = "month",
  selectedDate = new Date().toISOString().slice(0, 7),
}: OverviewProps) {
  const { transactions, categories } = useExpenseStore();

  // Monthly Activity (Selected Period)
  const filteredTransactions = transactions.filter((t) => {
    if (dateFilterType === "all") return true;
    if (dateFilterType === "month") {
      return t.date.startsWith(selectedDate);
    }
    if (dateFilterType === "year") {
      return t.date.startsWith(selectedDate.slice(0, 4));
    }
    return true;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalBudget = categories.reduce((acc, c) => {
    if (dateFilterType === "year") return acc + c.monthly_budget * 12;
    if (dateFilterType === "all") return acc; // No clear budget for all time
    return acc + c.monthly_budget;
  }, 0);

  const totalSpent = totalExpense;
  const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Income</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">
            +₹{totalIncome.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Total money in</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            -₹{totalExpense.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Total money out</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
          <span className="text-xs text-muted-foreground">
            {totalSpent.toFixed(0)} / {totalBudget.toFixed(0)}
          </span>
        </CardHeader>
        <CardContent>
          <Progress
            value={budgetProgress}
            className="mt-2 h-2"
            indicatorClassName={
              budgetProgress > 100
                ? "bg-red-500"
                : budgetProgress > 80
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {budgetProgress.toFixed(1)}% of budget used
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
