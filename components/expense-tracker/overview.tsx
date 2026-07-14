"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useExpenseStore } from "@/hooks/use-expense-store";
import { ArrowDownRight, ArrowUpRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface OverviewProps {
  dateFilterType?: "all" | "month" | "year";
  selectedDates?: string[];
  personFilter?: string;
}

export function Overview({
  dateFilterType = "month",
  selectedDates = [new Date().toISOString().slice(0, 7)],
  personFilter = "all",
}: OverviewProps) {
  const { transactions, categories } = useExpenseStore();

  // Monthly Activity (Selected Period + Selected Person)
  const filteredTransactions = transactions.filter((t) => {
    let matchesDate = true;
    if (dateFilterType === "month") {
      matchesDate = selectedDates.some(date => t.date.startsWith(date));
    } else if (dateFilterType === "year") {
      matchesDate = selectedDates.some(date => t.date.startsWith(date.slice(0, 4)));
    }

    const matchesPerson = personFilter === "all" || t.paid_by === personFilter;

    return matchesDate && matchesPerson;
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
      {/* Income Card */}
      <Card className="overflow-hidden border border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
            <ArrowUpRight className="size-5 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Income</p>
            <p className="text-3xl font-bold tracking-tight text-emerald-600 truncate mt-0.5">
              ₹{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total money credited</p>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Card */}
      <Card className="overflow-hidden border border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
            <ArrowDownRight className="size-5 text-rose-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Expenses</p>
            <p className="text-3xl font-bold tracking-tight text-rose-600 truncate mt-0.5">
              ₹{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total money debited</p>
          </div>
        </CardContent>
      </Card>

      {/* Budget Health Card */}
      <Card className="overflow-hidden border border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
        <CardContent className="p-5 flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <Activity className="size-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Budget Health</p>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                  {budgetProgress.toFixed(1)}% Used
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-md">
              ₹{totalSpent.toFixed(0)} / ₹{totalBudget.toFixed(0)}
            </span>
          </div>

          <div className="w-full mt-1">
            <Progress
              value={budgetProgress}
              className="h-2 rounded-full bg-muted"
              indicatorClassName={cn(
                "rounded-full transition-all",
                budgetProgress > 100
                  ? "bg-rose-500"
                  : budgetProgress > 80
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
