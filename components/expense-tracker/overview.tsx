"use client";

import { useExpenseStore } from "@/hooks/use-expense-store";
import { useExpenseStats } from "@/hooks/use-expense-queries";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateFilterType } from "@/components/finance/period-filter";

interface OverviewProps {
  dateFilterType?: DateFilterType;
  selectedDates?: string[];
  personFilter?: string;
}

export function Overview({
  dateFilterType = "month",
  selectedDates = [new Date().toISOString().slice(0, 7)],
  personFilter = "all",
}: OverviewProps) {
  const categories = useExpenseStore((s) => s.categories);
  const { data: stats } = useExpenseStats(
    dateFilterType,
    selectedDates,
    personFilter,
  );

  const totalIncome = stats?.totalIncome || 0;
  const totalExpense = stats?.totalExpense || 0;

  const totalBudget = categories.reduce((acc, c) => {
    if (dateFilterType === "year") return acc + c.monthly_budget * 12;
    if (dateFilterType === "all") return acc;
    return acc + c.monthly_budget;
  }, 0);

  const totalSpent = totalExpense;
  const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const net = totalIncome - totalExpense;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card className="rounded-2xl border-border/40 shadow-none">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10">
            <ArrowUpRight className="size-5 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">Credits</p>
            <p className="mt-0.5 truncate text-2xl font-semibold tracking-tight text-emerald-600">
              ₹
              {totalIncome.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/40 shadow-none">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10">
            <ArrowDownRight className="size-5 text-rose-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">Debits</p>
            <p className="mt-0.5 truncate text-2xl font-semibold tracking-tight text-rose-600">
              ₹
              {totalExpense.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/40 shadow-none">
        <CardContent className="flex h-full flex-col justify-center gap-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Budget
              </p>
              <p className="mt-0.5 text-2xl font-semibold tracking-tight">
                {budgetProgress.toFixed(0)}%
              </p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  net >= 0 ? "text-emerald-600" : "text-rose-600",
                )}
              >
                {net >= 0 ? "+" : "−"}₹
                {Math.abs(net).toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-[11px] text-muted-foreground">
                ₹{totalSpent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}{" "}
                / ₹{totalBudget.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <Progress
            value={Math.min(budgetProgress, 100)}
            className="h-1.5 rounded-full bg-muted"
            indicatorClassName={cn(
              "rounded-full",
              budgetProgress > 100
                ? "bg-rose-500"
                : budgetProgress > 80
                  ? "bg-amber-500"
                  : "bg-emerald-500",
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
