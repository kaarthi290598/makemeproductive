"use client";

import { useExpenseStore } from "@/hooks/use-expense-store";
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

interface RecentTransactionsProps {
  dateFilterType?: "all" | "month" | "year";
  selectedDates?: string[];
  limit?: number;
  global?: boolean;
  personFilter?: string;
  title?: string;
}

export function RecentTransactions({
  dateFilterType = "month",
  selectedDates = [new Date().toISOString().slice(0, 7)],
  limit = 5,
  global = false,
  personFilter = "all",
  title = "Recent Transactions",
}: RecentTransactionsProps) {
  const { transactions, categories } = useExpenseStore();

  // Get transactions either globally or filtered by period, and apply person filter
  const baseTransactions = transactions.filter((t) => {
    if (!global) {
      if (dateFilterType === "month" && !selectedDates.some(date => t.date.startsWith(date))) return false;
      if (dateFilterType === "year" && !selectedDates.some(date => t.date.startsWith(date.slice(0, 4)))) return false;
    }
    
    if (personFilter !== "all" && t.paid_by !== personFilter) return false;
    
    return true;
  });

  // Sort by arrival order (created_at or updated_at) as requested
  const sortedTransactions = [...baseTransactions].sort((a, b) => {
    const timeA = new Date(a.updated_at || a.created_at || a.date).getTime();
    const timeB = new Date(b.updated_at || b.created_at || b.date).getTime();
    return timeB - timeA;
  });

  // Get recent transactions
  const recentTransactions = sortedTransactions.slice(0, limit);

  const getCategoryName = (id?: string) => {
    if (!id) return "-";
    return categories.find((c) => c.id === id)?.name || "Unknown";
  };

  return (
    <Card className="border border-border/50 bg-card shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
          <ReceiptText className="size-3.5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          <p className="text-[10px] text-muted-foreground mt-0.5">Most recent logs</p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/40">
                <TableHead className="h-9 px-4 text-xs font-semibold text-muted-foreground">Date</TableHead>
                <TableHead className="h-9 px-4 text-xs font-semibold text-muted-foreground">Category</TableHead>
                <TableHead className="hidden h-9 px-4 text-xs font-semibold text-muted-foreground sm:table-cell">
                  Note
                </TableHead>
                <TableHead className="h-9 px-4 text-xs font-semibold text-muted-foreground text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-xs text-muted-foreground">
                    No recent activity.
                  </TableCell>
                </TableRow>
              ) : (
                recentTransactions.map((t) => (
                  <TableRow key={t.id} className="group transition-colors border-b border-border/30 last:border-0 hover:bg-muted/30">
                    <TableCell className="px-4 py-2.5 text-xs text-muted-foreground">
                      {format(parseLocalISODate(t.date), "MMM d")}
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-xs font-medium text-foreground">
                      {getCategoryName(t.category_id)}
                    </TableCell>
                    <TableCell className="hidden max-w-[120px] truncate px-4 py-2.5 text-xs text-muted-foreground/80 sm:table-cell">
                      {t.note || "-"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "px-4 py-2.5 text-right text-xs font-semibold tabular-nums",
                        t.type === "income" ? "text-emerald-600" : "text-rose-600"
                      )}
                    >
                      {t.type === "income" ? "+" : "-"}₹{t.amount.toFixed(0)}
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
