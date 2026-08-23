"use client";

import { useExpenseStore } from "@/hooks/use-expense-store";
import { useRecentExpenseTransactions } from "@/hooks/use-expense-queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { parseLocalISODate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentTransactionsProps {
  dateFilterType?: "all" | "month" | "year";
  selectedDates?: string[];
  limit?: number;
  global?: boolean;
  personFilter?: string;
  title?: string;
}

export function RecentTransactions({
  limit = 5,
  personFilter = "all",
  title = "Recent Transactions",
}: RecentTransactionsProps) {
  const categories = useExpenseStore((s) => s.categories);
  const { data: recentTransactions = [], isLoading } = useRecentExpenseTransactions(
    limit,
    personFilter,
  );

  const getCategoryName = (id?: string) => {
    if (!id) return "-";
    return categories.find((c) => c.id === id)?.name || "Unknown";
  };

  return (
    <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm dark:border-slate-800">
      <CardHeader className="flex flex-row items-center gap-2 border-b border-slate-100 py-3 dark:border-slate-800">
        <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600/10">
          <ReceiptText className="size-3.5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </CardTitle>
          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
            Most recent logs
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 hover:bg-transparent dark:border-slate-800">
                <TableHead className="h-9 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Date
                </TableHead>
                <TableHead className="h-9 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Category
                </TableHead>
                <TableHead className="hidden h-9 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:table-cell">
                  Note
                </TableHead>
                <TableHead className="h-9 px-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <TableRow
                    key={i}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <TableCell className="px-4 py-2.5">
                      <Skeleton className="h-3 w-12" />
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <Skeleton className="h-3 w-20" />
                    </TableCell>
                    <TableCell className="hidden px-4 py-2.5 sm:table-cell">
                      <Skeleton className="h-3 w-24" />
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-right">
                      <Skeleton className="ml-auto h-3 w-14" />
                    </TableCell>
                  </TableRow>
                ))
              ) : recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-xs text-slate-500 dark:text-slate-400"
                  >
                    No recent activity.
                  </TableCell>
                </TableRow>
              ) : (
                recentTransactions.map((t) => (
                  <TableRow
                    key={t.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50"
                  >
                    <TableCell className="px-4 py-2.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {format(parseLocalISODate(t.date), "dd-MM")}
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {getCategoryName(t.category_id)}
                    </TableCell>
                    <TableCell className="hidden max-w-[120px] truncate px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 sm:table-cell">
                      {t.note || "-"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "px-4 py-2.5 text-right font-mono text-xs font-bold",
                        t.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400",
                      )}
                    >
                      {t.type === "income" ? "+" : "−"}₹
                      {t.amount.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
