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
  ArrowUpRight,
  Edit2,
  Download,
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
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPaidBy, setFilterPaidBy] = useState<string>("all");
  const [filterSettlement, setFilterSettlement] = useState<
    "all" | "settlement"
  >("all");
  const [dateFilterType, setDateFilterType] = useState<
    "all" | "month" | "year"
  >("month");
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateToLocalISO(new Date()).slice(0, 7),
  ); // YYYY-MM
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null); // For future Edit Dialog
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      matchesDate = t.date.startsWith(selectedDate);
    } else if (dateFilterType === "year") {
      matchesDate = t.date.startsWith(selectedDate.slice(0, 4));
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
        <div className="space-y-2 rounded-lg border bg-sidebar p-2 lg:p-3">
          {/* Row 1: General Filters & Export */}
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full border-none bg-secondary sm:w-48 lg:w-48 xl:w-64"
            />
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <Select
                value={filterType}
                onValueChange={(val) =>
                  setFilterType(val as "all" | "income" | "expense")
                }
              >
                <SelectTrigger className="h-9 w-[calc(50%-4px)] border-none bg-secondary sm:w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Credits</SelectItem>
                  <SelectItem value="expense">Debits</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-9 w-[calc(50%-4px)] border-none bg-secondary sm:w-[150px]">
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
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <Select
                value={filterSettlement}
                onValueChange={(val) =>
                  setFilterSettlement(val as "all" | "settlement")
                }
              >
                <SelectTrigger className="h-9 w-[calc(50%-4px)] border-none bg-secondary sm:w-[150px]">
                  <SelectValue placeholder="Settlement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="settlement">Needs Settlement</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPaidBy} onValueChange={setFilterPaidBy}>
                <SelectTrigger className="h-9 w-[calc(50%-4px)] border-none bg-secondary sm:w-[130px]">
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
          <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-2">
            <span className="mr-2 w-full text-xs font-medium text-muted-foreground sm:w-auto">
              Filter by Date:
            </span>
            <Select
              value={dateFilterType}
              onValueChange={(val) =>
                setDateFilterType(val as "all" | "month" | "year")
              }
            >
              <SelectTrigger className="h-9 w-full border-none bg-secondary sm:w-[130px]">
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
                value={selectedDate.slice(0, 4)}
                onValueChange={(year) => {
                  const currentMonth =
                    selectedDate.slice(5, 7) ||
                    new Date().toISOString().slice(5, 7);
                  setSelectedDate(`${year}-${currentMonth}`);
                }}
              >
                <SelectTrigger className="h-9 w-[calc(50%-4px)] border-none bg-secondary sm:w-[100px]">
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
              <Select
                value={selectedDate.slice(5, 7)}
                onValueChange={(month) => {
                  const currentYear = selectedDate.slice(0, 4);
                  setSelectedDate(`${currentYear}-${month}`);
                }}
              >
                <SelectTrigger className="h-9 w-[calc(50%-4px)] border-none bg-secondary sm:w-[120px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date(0, i);
                    const monthStr = format(date, "MM");
                    const monthName = format(date, "MMMM");
                    return { value: monthStr, label: monthName };
                  }).map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              onClick={handleExport}
              size="sm"
              className="h-9 w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:ml-auto sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="hidden md:table-cell">Paid By</TableHead>
              <TableHead className="hidden sm:table-cell">Note</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(parseLocalISODate(t.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={t.type === "income" ? "default" : "destructive"}
                      className={
                        t.type === "income"
                          ? "bg-green-500 px-2 py-0 text-[10px] hover:bg-green-600"
                          : "bg-red-500 px-2 py-0 text-[10px] hover:bg-red-600"
                      }
                    >
                      {t.type === "income" ? "Credit" : "Debit"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[100px] truncate">
                    {getCategoryName(t.category_id)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {t.paid_by || "-"}
                  </TableCell>
                  <TableCell className="hidden max-w-[150px] truncate sm:table-cell">
                    {t.note || "-"}
                  </TableCell>
                  <TableCell>
                    {t.needs_settlement && (
                      <Badge
                        variant="outline"
                        className="flex w-fit cursor-pointer items-center gap-1 border-yellow-500 px-1 py-0 text-[10px] text-yellow-600"
                        onClick={() => toggleSettlement(t.id, false)}
                      >
                        <AlertCircle className="h-3 w-3" />
                        <span className="">Settlement</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium tabular-nums ${t.type === "income" ? "text-green-600" : "text-red-600"}`}
                  >
                    {t.type === "income" ? "+" : "-"}₹{t.amount.toFixed(0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <AddTransactionDialog
                        transactionToEdit={t}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-blue-500" />
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
                            className="h-8 w-8"
                            disabled={deletingId === t.id}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
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

      {/* Edit Dialog Logic will go here eventually, or we wrap TransactionList rows with AddTransactionDialog in Edit Mode */}
    </div>
  );
}
