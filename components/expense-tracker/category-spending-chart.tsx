"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryData {
  id?: string;
  name: string;
  spent: number;
  budget: number;
  color: string;
}

interface CategorySpendingChartProps {
  data: CategoryData[];
  height?: number | string;
  isLoading?: boolean;
}

function formatInr(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function CategorySpendingChart({
  data,
  isLoading = false,
}: CategorySpendingChartProps) {
  const maxSpent = Math.max(...data.map((d) => d.spent), 0);

  return (
    <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm dark:border-slate-800">
      <CardHeader className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
          Spending by category
        </CardTitle>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Total spent per category
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-3.5" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-24 shrink-0" />
                <Skeleton
                  className="h-4 flex-1 rounded-full"
                  style={{ maxWidth: `${70 - i * 8}%` }}
                />
                <Skeleton className="h-3 w-12 shrink-0" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[220px] flex-col items-center justify-center space-y-2 text-slate-500 dark:text-slate-400">
            <p className="text-sm">No expenses found for this period.</p>
            <p className="text-xs">Try changing the date filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((row, index) => {
              const width =
                maxSpent > 0 ? Math.max((row.spent / maxSpent) * 100, 2) : 0;
              return (
                <div
                  key={row.id || `${row.name}-${index}`}
                  className="grid grid-cols-[minmax(0,5.5rem)_1fr_auto] items-center gap-2 sm:grid-cols-[minmax(0,8.5rem)_1fr_auto] sm:gap-3"
                >
                  <p
                    className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200"
                    title={row.name}
                  >
                    {row.name}
                  </p>
                  <div className="h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${width}%`,
                        backgroundColor: row.color || "#6366f1",
                      }}
                    />
                  </div>
                  <span className="min-w-[3.75rem] text-right font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200 sm:min-w-[4.5rem] sm:text-xs">
                    ₹{formatInr(row.spent)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
