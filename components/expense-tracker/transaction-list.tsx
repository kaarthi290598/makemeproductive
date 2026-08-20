"use client";

import { useEffect, useState } from "react";
import { useExpenseStore } from "@/hooks/use-expense-store";
import {
  useExpenseTransactionsPage,
  useInvalidateExpense,
} from "@/hooks/use-expense-queries";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  AlertCircle,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { parseLocalISODate, formatDateToLocalISO } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  PeriodFilter,
  type DateFilterType,
} from "@/components/finance/period-filter";
import { exportExpenseTransactionsCsv } from "@/lib/actions/expenseData";
import type { ExpenseTransactionFilters } from "@/types/expense";

interface TransactionListProps {
  hideFilters?: boolean;
}

export function TransactionList({ hideFilters = false }: TransactionListProps) {
  const categories = useExpenseStore((s) => s.categories);
  const persons = useExpenseStore((s) => s.persons);
  const deleteTransaction = useExpenseStore((s) => s.deleteTransaction);
  const toggleSettlement = useExpenseStore((s) => s.toggleSettlement);
  const invalidateExpense = useInvalidateExpense();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPaidBy, setFilterPaidBy] = useState<string>("all");
  const [filterSettlement, setFilterSettlement] = useState<
    "all" | "settlement"
  >("all");
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("month");
  const [selectedDates, setSelectedDates] = useState<string[]>([
    formatDateToLocalISO(new Date()).slice(0, 7),
  ]);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const pageSize = 40;

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => window.clearTimeout(id);
  }, [searchTerm]);

  const filters: ExpenseTransactionFilters = {
    dateFilterType,
    selectedDates,
    searchTerm: debouncedSearch,
    filterType,
    filterCategory,
    filterPaidBy,
    filterSettlement,
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    dateFilterType,
    selectedDates,
    debouncedSearch,
    filterType,
    filterCategory,
    filterPaidBy,
    filterSettlement,
  ]);

  const { data, isFetching } = useExpenseTransactionsPage(
    filters,
    currentPage,
    pageSize,
  );
  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    if (currentPage > totalPages && totalCount > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, totalCount]);

  const getCategoryName = (id?: string) => {
    if (!id) return "-";
    return categories.find((c) => c.id === id)?.name || "Unknown";
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      await invalidateExpense();
      toast.success("Transaction deleted");
    } catch {
      // Error handled by store
    } finally {
      setDeletingId(null);
    }
  };

  const handleSettle = async (id: string) => {
    await toggleSettlement(id, false);
    await invalidateExpense();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const csvContent = await exportExpenseTransactionsCsv(filters);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `transactions_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast.error("Could not export CSV");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {!hideFilters && (
        <div className="space-y-3">
          <PeriodFilter
            dateFilterType={dateFilterType}
            onDateFilterTypeChange={setDateFilterType}
            selectedDates={selectedDates}
            onSelectedDatesChange={setSelectedDates}
            extra={
              <Button
                onClick={handleExport}
                size="sm"
                variant="outline"
                disabled={exporting}
                className="ml-auto h-8 gap-1.5 rounded-full text-xs"
              >
                <Download className="size-3.5" />
                CSV
              </Button>
            }
          />
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notes"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 rounded-full border-border/50 bg-card pl-9 text-sm shadow-none"
              />
            </div>
            <Select
              value={filterType}
              onValueChange={(val) =>
                setFilterType(val as "all" | "income" | "expense")
              }
            >
              <SelectTrigger className="h-9 w-[120px] rounded-full border-border/50 bg-card text-xs shadow-none">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="income">Credits</SelectItem>
                <SelectItem value="expense">Debits</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-9 w-[140px] rounded-full border-border/50 bg-card text-xs shadow-none">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterSettlement}
              onValueChange={(val) =>
                setFilterSettlement(val as "all" | "settlement")
              }
            >
              <SelectTrigger className="h-9 w-[150px] rounded-full border-border/50 bg-card text-xs shadow-none">
                <SelectValue placeholder="Settlement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="settlement">Needs settlement</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPaidBy} onValueChange={setFilterPaidBy}>
              <SelectTrigger className="h-9 w-[130px] rounded-full border-border/50 bg-card text-xs shadow-none">
                <SelectValue placeholder="Paid by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All people</SelectItem>
                {persons.map((person) => (
                  <SelectItem key={person.id} value={person.name}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-border/40 bg-card",
          isFetching && "opacity-80",
        )}
      >
        {items.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-muted-foreground">
            No transactions found.
          </p>
        ) : (
          <div className="divide-y divide-border/40">
            {items.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      {getCategoryName(t.category_id)}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-2 py-0 text-[10px] font-semibold",
                        t.type === "income"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                          : "border-rose-500/20 bg-rose-500/10 text-rose-600",
                      )}
                    >
                      {t.type === "income" ? "Credit" : "Debit"}
                    </Badge>
                    {t.needs_settlement && (
                      <button
                        type="button"
                        onClick={() => handleSettle(t.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600"
                      >
                        <AlertCircle className="size-3" />
                        Settle
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {format(parseLocalISODate(t.date), "MMM d, yyyy")}
                    {t.paid_by ? ` · ${t.paid_by}` : ""}
                    {t.note ? ` · ${t.note}` : ""}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 text-sm font-semibold tabular-nums",
                    t.type === "income" ? "text-emerald-600" : "text-rose-600",
                  )}
                >
                  {t.type === "income" ? "+" : "−"}₹
                  {t.amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </p>
                <div className="flex shrink-0 gap-0.5">
                  <AddTransactionDialog
                    transactionToEdit={t}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full text-muted-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    title="Delete Transaction"
                    description="Are you sure you want to delete this transaction? This action cannot be undone."
                    onConfirm={() => handleDelete(t.id)}
                    loading={deletingId === t.id}
                    variant="destructive"
                    confirmText="Delete"
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        disabled={deletingId === t.id}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-full"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[3rem] text-center text-xs font-medium">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-full"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
