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
  Receipt,
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
import { Skeleton } from "@/components/ui/skeleton";
import { parseLocalISODate, formatDateToLocalISO } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  PeriodFilter,
  type DateFilterType,
} from "@/components/finance/period-filter";
import { exportExpenseTransactionsCsv } from "@/lib/actions/expenseData";
import type { ExpenseTransactionFilters } from "@/types/expense";
import { useReportTabReadyAfterFirstLoad } from "./tab-ready";

function TransactionListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-14 rounded-lg" />
            </div>
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-0.5">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

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

  const { data, isLoading, isFetching } = useExpenseTransactionsPage(
    filters,
    currentPage,
    pageSize,
  );
  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const showEmpty = !isLoading && items.length === 0;
  useReportTabReadyAfterFirstLoad(isLoading);

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
      invalidateExpense();
      toast.success("Transaction deleted");
    } catch {
      // Error handled by store
    } finally {
      setDeletingId(null);
    }
  };

  const handleSettle = async (id: string) => {
    try {
      await toggleSettlement(id, false);
      invalidateExpense();
      toast.success("Transaction marked as settled");
    } catch {
      // Error handled by store
    }
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
                className="ml-auto h-8 gap-1.5 rounded-lg border-slate-200 text-xs font-bold dark:border-slate-700"
              >
                <Download className="size-3.5" />
                CSV
              </Button>
            }
          />
          <div className="grid min-w-0 grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:flex sm:flex-wrap sm:items-center">
            <div className="relative col-span-2 min-w-0 sm:min-w-[180px] sm:flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search notes, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-9 text-sm shadow-none dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <Select
              value={filterType}
              onValueChange={(val) =>
                setFilterType(val as "all" | "income" | "expense")
              }
            >
              <SelectTrigger className="h-9 w-full min-w-0 rounded-lg border-slate-200 bg-white text-xs font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="income">Credits</SelectItem>
                <SelectItem value="expense">Debits</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-9 w-full min-w-0 rounded-lg border-slate-200 bg-white text-xs font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:w-[140px]">
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
              <SelectTrigger className="h-9 w-full min-w-0 rounded-lg border-slate-200 bg-white text-xs font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:w-[150px]">
                <SelectValue placeholder="Settlement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="settlement">Needs settlement</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPaidBy} onValueChange={setFilterPaidBy}>
              <SelectTrigger className="h-9 w-full min-w-0 rounded-lg border-slate-200 bg-white text-xs font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:w-[130px]">
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
          "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950",
          isFetching && !isLoading && items.length > 0 && "opacity-70",
        )}
        aria-busy={isLoading || isFetching}
      >
        {isLoading ? (
          <TransactionListSkeleton />
        ) : showEmpty ? (
          <div className="px-4 py-16 text-center">
            <Receipt className="mx-auto mb-2 size-8 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              No transactions found.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Try another month or add a credit / debit.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((t) => (
              <div
                key={t.id}
                className="flex min-w-0 items-start gap-2 px-3 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 sm:items-center sm:gap-3 sm:px-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {getCategoryName(t.category_id)}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full border px-2 py-0 text-[10px] font-bold",
                        t.type === "income"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
                      )}
                    >
                      {t.type === "income" ? "Credit" : "Debit"}
                    </Badge>
                    {t.needs_settlement && (
                      <button
                        type="button"
                        onClick={() => handleSettle(t.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                      >
                        <AlertCircle className="size-3" />
                        Settle
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {format(parseLocalISODate(t.date), "dd-MM-yyyy")}
                    {t.paid_by ? ` · ${t.paid_by}` : ""}
                    {t.note ? ` · ${t.note}` : ""}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 font-mono text-xs font-extrabold sm:text-sm",
                    t.type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400",
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
                        className="size-8 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
                        className="size-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
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

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-slate-200 dark:border-slate-700"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[3rem] text-center text-xs font-bold text-slate-700 dark:text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-slate-200 dark:border-slate-700"
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
