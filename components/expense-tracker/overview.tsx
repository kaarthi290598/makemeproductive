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
    <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 p-3 sm:p-3.5 dark:border-slate-800"
        >
          <div className="mb-2 flex items-center gap-2">
            <Skeleton className="size-6 sm:size-7 rounded-lg" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-6 sm:h-7 w-24" />
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
    <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
      {/* Credits */}
      <div className="flex flex-col justify-between rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-3 sm:p-3.5 dark:border-emerald-800/40 dark:from-emerald-950/40 dark:to-emerald-900/20">
        <div>
          <div className="mb-1 flex items-center gap-1.5 sm:gap-2">
            <div className="flex size-6 sm:size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
              <ArrowUpRight className="size-3.5 sm:size-4" />
            </div>
            <span className="truncate text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">
              Credits
            </span>
          </div>
          <p className="font-mono text-base font-black tracking-tight text-emerald-900 dark:text-emerald-300 sm:text-xl">
            ₹{money(totalIncome)}
          </p>
        </div>
        <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500 dark:text-slate-400 sm:text-[11px]">
          Total income
        </p>
      </div>

      {/* Debits */}
      <div className="flex flex-col justify-between rounded-2xl border border-rose-200/60 bg-gradient-to-br from-rose-50 to-rose-100/40 p-3 sm:p-3.5 dark:border-rose-800/40 dark:from-rose-950/40 dark:to-rose-900/20">
        <div>
          <div className="mb-1 flex items-center gap-1.5 sm:gap-2">
            <div className="flex size-6 sm:size-7 shrink-0 items-center justify-center rounded-lg bg-rose-600/10 text-rose-700 dark:text-rose-400">
              <ArrowDownRight className="size-3.5 sm:size-4" />
            </div>
            <span className="truncate text-[10px] font-bold uppercase tracking-wider text-rose-600/80 dark:text-rose-400/80">
              Debits
            </span>
          </div>
          <p className="font-mono text-base font-black tracking-tight text-rose-900 dark:text-rose-300 sm:text-xl">
            ₹{money(totalExpense)}
          </p>
        </div>
        <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500 dark:text-slate-400 sm:text-[11px]">
          Total spending
        </p>
      </div>

      {/* Net */}
      <div className="flex flex-col justify-between rounded-2xl border border-teal-200/60 bg-gradient-to-br from-teal-50 to-teal-100/40 p-3 sm:p-3.5 dark:border-teal-800/40 dark:from-teal-950/40 dark:to-teal-900/20">
        <div>
          <div className="mb-1 flex items-center gap-1.5 sm:gap-2">
            <div className="flex size-6 sm:size-7 shrink-0 items-center justify-center rounded-lg bg-teal-600/10 text-teal-700 dark:text-teal-400">
              <Scale className="size-3.5 sm:size-4" />
            </div>
            <span className="truncate text-[10px] font-bold uppercase tracking-wider text-teal-600/80 dark:text-teal-400/80">
              Net Flow
            </span>
          </div>
          <p
            className={cn(
              "font-mono text-base font-black tracking-tight sm:text-xl",
              net >= 0
                ? "text-emerald-900 dark:text-emerald-300"
                : "text-rose-900 dark:text-rose-300",
            )}
          >
            {net >= 0 ? "+" : "−"}₹{money(Math.abs(net))}
          </p>
        </div>
        <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500 dark:text-slate-400 sm:text-[11px]">
          Income vs expense
        </p>
      </div>

      {/* Budget */}
      <div className="flex flex-col justify-between rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50 to-violet-100/40 p-3 sm:p-3.5 dark:border-violet-800/40 dark:from-violet-950/40 dark:to-violet-900/20">
        <div>
          <div className="mb-1 flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5">
              <div className="flex size-6 sm:size-7 shrink-0 items-center justify-center rounded-lg bg-violet-600/10 text-violet-700 dark:text-violet-400">
                <Wallet className="size-3.5 sm:size-4" />
              </div>
              <span className="truncate text-[10px] font-bold uppercase tracking-wider text-violet-600/80 dark:text-violet-400/80">
                Budget
              </span>
            </div>
            <span className="font-mono text-xs sm:text-sm font-black text-violet-900 dark:text-violet-300">
              {budgetProgress.toFixed(0)}%
            </span>
          </div>
          <Progress
            value={Math.min(budgetProgress, 100)}
            className="mt-1 h-1.5 rounded-full bg-violet-200/60 dark:bg-violet-900/40"
          />
        </div>
        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 sm:text-[11px]">
          {budgetProgress <= 100 ? "Within budget" : "Over budget"}
        </p>
      </div>
    </div>
  );
}
