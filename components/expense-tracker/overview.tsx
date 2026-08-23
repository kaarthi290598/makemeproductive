"use client";

import { useExpenseStore } from "@/hooks/use-expense-store";
import { useExpenseStats } from "@/hooks/use-expense-queries";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownRight, ArrowUpRight, Scale, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateFilterType } from "@/components/finance/period-filter";

function OverviewStatsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800"
        >
          <div className="mb-2 flex items-center gap-2">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-7 w-28" />
        </div>
      ))}
    </div>
  );
}

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
  const { data: stats, isLoading } = useExpenseStats(
    dateFilterType,
    selectedDates,
    personFilter,
  );

  if (isLoading) {
    return <OverviewStatsSkeleton />;
  }

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

  const money = (n: number) =>
    n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-3.5 dark:border-emerald-800/40 dark:from-emerald-950/40 dark:to-emerald-900/20">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
            <ArrowUpRight className="size-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">
            Credits
          </span>
        </div>
        <p className="font-mono text-xl font-extrabold text-emerald-900 dark:text-emerald-300">
          ₹{money(totalIncome)}
        </p>
      </div>

      <div className="rounded-xl border border-rose-200/60 bg-gradient-to-br from-rose-50 to-rose-100/40 p-3.5 dark:border-rose-800/40 dark:from-rose-950/40 dark:to-rose-900/20">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-rose-600/10 text-rose-700 dark:text-rose-400">
            <ArrowDownRight className="size-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600/80 dark:text-rose-400/80">
            Debits
          </span>
        </div>
        <p className="font-mono text-xl font-extrabold text-rose-900 dark:text-rose-300">
          ₹{money(totalExpense)}
        </p>
      </div>

      <div className="rounded-xl border border-teal-200/60 bg-gradient-to-br from-teal-50 to-teal-100/40 p-3.5 dark:border-teal-800/40 dark:from-teal-950/40 dark:to-teal-900/20">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-teal-600/10 text-teal-700 dark:text-teal-400">
            <Scale className="size-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600/80 dark:text-teal-400/80">
            Net
          </span>
        </div>
        <p
          className={cn(
            "font-mono text-xl font-extrabold",
            net >= 0
              ? "text-emerald-900 dark:text-emerald-300"
              : "text-rose-900 dark:text-rose-300",
          )}
        >
          {net >= 0 ? "+" : "−"}₹{money(Math.abs(net))}
        </p>
      </div>

      <div className="rounded-xl border border-violet-200/60 bg-gradient-to-br from-violet-50 to-violet-100/40 p-3.5 dark:border-violet-800/40 dark:from-violet-950/40 dark:to-violet-900/20">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-violet-600/10 text-violet-700 dark:text-violet-400">
              <Wallet className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600/80 dark:text-violet-400/80">
              Budget
            </span>
          </div>
          <span className="font-mono text-xl font-extrabold text-violet-900 dark:text-violet-300">
            {budgetProgress.toFixed(0)}%
          </span>
        </div>
        <Progress
          value={Math.min(budgetProgress, 100)}
          className="h-1.5 rounded-full bg-violet-200/60 dark:bg-violet-900/40"
          indicatorClassName={cn(
            "rounded-full",
            budgetProgress > 100
              ? "bg-rose-500"
              : budgetProgress > 80
                ? "bg-amber-500"
                : "bg-emerald-500",
          )}
        />
        <p className="mt-2 font-mono text-[10px] font-semibold text-violet-700/80 dark:text-violet-300/80">
          ₹{money(totalSpent)} / ₹{money(totalBudget)}
        </p>
      </div>
    </div>
  );
}
