"use client";

import { useState } from "react";
import { useExpenseStore } from "@/hooks/use-expense-store";
import { Transaction } from "@/types/expense";
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
import { Button } from "@/components/ui/button";
import {
  Trash2,
  AlertCircle,
  Pencil,
  Download,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pen,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface TransactionListProps {
  hideFilters?: boolean;
}

export function TransactionList({ hideFilters = false }: TransactionListProps) {
  const {
    transactions,
    categories,
    persons,
    deleteTransaction,
    toggleSettlement,
  } = useExpenseStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPaidBy, setFilterPaidBy] = useState<string>("all");
  const [filterSettlement, setFilterSettlement] = useState<
    "all" | "settlement"
  >("all");
  const [dateFilterType, setDateFilterType] = useState<
    "all" | "month" | "year"
  >("month");
  const [selectedDates, setSelectedDates] = useState<string[]>([
    formatDateToLocalISO(new Date()).slice(0, 7),
  ]); // Array of YYYY-MM
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 40;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      toast.success("Transaction deleted");
    } catch (err) {
      // Error handled by store
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryName = (id?: string) => {
    if (!id) return "-";
    return categories.find((c) => c.id === id)?.name || "Unknown";
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.note?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesCategory =
      filterCategory === "all" || t.category_id === filterCategory;
    const matchesPaidBy = filterPaidBy === "all" || t.paid_by === filterPaidBy;

    let matchesSettlement = true;
    if (filterSettlement === "settlement") {
      matchesSettlement = !!t.needs_settlement;
    }

    let matchesDate = true;
    if (dateFilterType === "month") {
      matchesDate = selectedDates.some(date => t.date.startsWith(date));
    } else if (dateFilterType === "year") {
      matchesDate = selectedDates.some(date => t.date.startsWith(date.slice(0, 4)));
    }

    return (
      matchesSearch &&
      matchesType &&
      matchesCategory &&
      matchesPaidBy &&
      matchesSettlement &&
      matchesDate
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset pagination when filters change
  // We can just rely on the UI to reset, or implicitly handle out of bounds:
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  } else if (totalPages === 0 && currentPage !== 1) {
    setCurrentPage(1);
  }

  const handleExport = () => {
    const headers = [
      "Date",
      "Type",
      "Category",
      "Amount",
      "Paid By",
      "Note",
      "Settlement Status",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((t) =>
        [
          format(parseLocalISODate(t.date), "yyyy-MM-dd"),
          t.type,
          getCategoryName(t.category_id),
          t.amount,
          t.paid_by || "-",
          `"${t.note || ""}"`,
          t.needs_settlement ? "Needs Settlement" : "Cleared",
        ].join(","),
      ),
    ].join("\n");

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
  };

  return (
    <div className="space-y-4">
      {!hideFilters && (
        <div className="space-y-3 rounded-xl border border-border/50 bg-card p-3 shadow-sm">
          {/* Row 1: General Filters & Export */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 pr-4 rounded-lg border-border/60 bg-background text-sm shadow-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={filterType}
                onValueChange={(val) =>
                  setFilterType(val as "all" | "income" | "expense")
                }
              >
                <SelectTrigger className="h-9 w-[130px] rounded-lg border-border/60 bg-background text-sm shadow-none transition-colors hover:bg-accent">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Credits</SelectItem>
                  <SelectItem value="expense">Debits</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-9 w-[150px] rounded-lg border-border/60 bg-background text-sm shadow-none transition-colors hover:bg-accent">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
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
                <SelectTrigger className="h-9 w-[150px] rounded-lg border-border/60 bg-background text-sm shadow-none transition-colors hover:bg-accent">
                  <SelectValue placeholder="Settlement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="settlement">Needs Settlement</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPaidBy} onValueChange={setFilterPaidBy}>
                <SelectTrigger className="h-9 w-[130px] rounded-lg border-border/60 bg-background text-sm shadow-none transition-colors hover:bg-accent">
                  <SelectValue placeholder="Paid By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All People</SelectItem>
                  {persons.map((person) => (
                    <SelectItem key={person.id} value={person.name}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Date Related Filters */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
            <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">
              <Filter className="size-3" /> Filter Date:
            </span>

            <Select
              value={dateFilterType}
              onValueChange={(val) =>
                setDateFilterType(val as "all" | "month" | "year")
              }
            >
              <SelectTrigger className="h-9 w-[130px] rounded-lg border-border/60 bg-background text-sm shadow-none transition-colors hover:bg-accent">
                <SelectValue placeholder="Date Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>

            {(dateFilterType === "month" || dateFilterType === "year") && (
              <Select
                value={selectedDates.length > 0 ? selectedDates[0].slice(0, 4) : new Date().getFullYear().toString()}
                onValueChange={(year) => {
                  setSelectedDates((prev) => {
                    if (prev.length === 0) {
                      const currentMonth = new Date().toISOString().slice(5, 7);
                      return [`${year}-${currentMonth}`];
                    }
                    return prev.map((d) => `${year}-${d.slice(5, 7)}`);
                  });
                }}
              >
                <SelectTrigger className="h-9 w-[100px] rounded-lg border-border/60 bg-background text-sm shadow-none transition-colors hover:bg-accent">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() - i,
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {dateFilterType === "month" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 min-w-[120px] justify-between rounded-lg border-border/60 bg-background text-sm shadow-none transition-colors hover:bg-accent font-normal">
                    {selectedDates.length === 0 ? "Select Month" : selectedDates.length === 1 ? format(new Date(0, parseInt(selectedDates[0].slice(5, 7)) - 1), "MMMM") : `${selectedDates.length} Months`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[150px]">
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date(0, i);
                    const monthStr = format(date, "MM");
                    const monthName = format(date, "MMMM");
                    
                    const currentYear = selectedDates.length > 0 ? selectedDates[0].slice(0, 4) : new Date().getFullYear().toString();
                    const value = `${currentYear}-${monthStr}`;
                    const isSelected = selectedDates.includes(value);

                    return (
                      <DropdownMenuCheckboxItem
                        key={monthStr}
                        checked={isSelected}
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDates((prev) => [...prev, value].sort());
                          } else {
                            setSelectedDates((prev) => prev.filter((d) => d !== value));
                          }
                        }}
                      >
                        {monthName}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              onClick={handleExport}
              size="sm"
              variant="outline"
              className="h-9 ml-auto gap-1.5 rounded-lg border-border/60 bg-background text-xs font-semibold shadow-none transition-colors hover:bg-accent"
            >
              <Download className="size-3.5 text-muted-foreground" /> Export CSV
            </Button>
          </div>
        </div>
      )}

      {/* Modern Table Card wrapper */}
      <div className="overflow-x-auto rounded-xl border border-border/50 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/40">
              <TableHead className="h-9 px-4 text-xs font-semibold text-muted-foreground">Date</TableHead>
              <TableHead className="h-9 px-4 text-xs font-semibold text-muted-foreground">Type</TableHead>
              <TableHead className="h-9 px-4 text-xs font-semibold text-muted-foreground">Category</TableHead>
              <TableHead className="hidden h-9 px-4 text-xs font-semibold text-muted-foreground md:table-cell">Paid By</TableHead>
              <TableHead className="hidden h-9 px-4 text-xs font-semibold text-muted-foreground sm:table-cell">Note</TableHead>
              <TableHead className="h-9 px-4 text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="h-9 px-4 text-xs font-semibold text-muted-foreground text-right">Amount</TableHead>
              <TableHead className="h-9 w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-xs text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((t) => (
                <TableRow key={t.id} className="group transition-colors border-b border-border/30 last:border-0 hover:bg-muted/30">
                  <TableCell className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                    {format(parseLocalISODate(t.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-semibold rounded-md inline-flex items-center",
                        t.type === "income"
                          ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                      )}
                    >
                      {t.type === "income" ? "Credit" : "Debit"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-xs font-medium text-foreground max-w-[100px] truncate">
                    {getCategoryName(t.category_id)}
                  </TableCell>
                  <TableCell className="hidden px-4 py-2.5 text-xs text-muted-foreground/80 md:table-cell">
                    {t.paid_by || "-"}
                  </TableCell>
                  <TableCell className="hidden px-4 py-2.5 text-xs text-muted-foreground/80 max-w-[150px] truncate sm:table-cell">
                    {t.note || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    {t.needs_settlement && (
                      <Badge
                        variant="outline"
                        className="inline-flex cursor-pointer items-center gap-1 border-amber-500/40 bg-amber-500/5 px-2 py-0.5 text-[10px] font-semibold text-amber-600 hover:bg-amber-500/15"
                        onClick={() => toggleSettlement(t.id, false)}
                      >
                        <AlertCircle className="size-3" />
                        <span>Settlement</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "px-4 py-2.5 text-right text-xs font-semibold tabular-nums",
                      t.type === "income" ? "text-emerald-600" : "text-rose-600"
                    )}
                  >
                    {t.type === "income" ? "+" : "-"}₹{t.amount.toFixed(0)}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <AddTransactionDialog
                        transactionToEdit={t}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
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
                            className="size-7 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            disabled={deletingId === t.id}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * pageSize, filteredTransactions.length)}</span> of <span className="font-medium text-foreground">{filteredTransactions.length}</span> entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="text-xs font-medium text-foreground flex items-center justify-center min-w-[2rem]">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg"
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
