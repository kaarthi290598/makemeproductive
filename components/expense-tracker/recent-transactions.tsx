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
import { Badge } from "@/components/ui/badge";
import { parseLocalISODate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentTransactionsProps {
  dateFilterType?: "all" | "month" | "year";
  selectedDate?: string;
  limit?: number;
  global?: boolean;
  title?: string;
}

export function RecentTransactions({
  dateFilterType = "month",
  selectedDate = new Date().toISOString().slice(0, 7),
  limit = 5,
  global = false,
  title = "Recent Transactions",
}: RecentTransactionsProps) {
  const { transactions, categories } = useExpenseStore();

  // Get transactions either globally or filtered by period
  const baseTransactions = global
    ? transactions
    : transactions.filter((t) => {
        if (dateFilterType === "all") return true;
        if (dateFilterType === "month") {
          return t.date.startsWith(selectedDate);
        }
        if (dateFilterType === "year") {
          return t.date.startsWith(selectedDate.slice(0, 4));
        }
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
    <Card className="border-primary/10 shadow-md">
      <CardHeader className="py-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md border-t">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 px-4">Date</TableHead>
                <TableHead className="h-9 px-4">Category</TableHead>
                <TableHead className="h-9 px-4">Note</TableHead>
                <TableHead className="h-9 px-4 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No recent activity.
                  </TableCell>
                </TableRow>
              ) : (
                recentTransactions.map((t) => (
                  <TableRow key={t.id} className="group transition-colors">
                    <TableCell className="px-4 py-2 text-xs">
                      {format(parseLocalISODate(t.date), "MMM d")}
                    </TableCell>
                    <TableCell className="px-4 py-2 text-xs font-medium">
                      {getCategoryName(t.category_id)}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate px-4 py-2 text-xs text-muted-foreground">
                      {t.note || "-"}
                    </TableCell>
                    <TableCell
                      className={`px-4 py-2 text-right text-xs font-bold tabular-nums ${t.type === "income" ? "text-green-600" : "text-red-600"}`}
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
