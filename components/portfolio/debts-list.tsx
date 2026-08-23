"use client";

import React, { useState, useMemo } from "react";
import { usePortfolioStore, Debt } from "@/hooks/use-portfolio-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AddEditDebtDialog,
  AddEditDebtPaymentDialog,
} from "./add-edit-dialogs";
import { DebtPaymentsDialog } from "./debt-payments-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pencil, Trash2, Search, CreditCard, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  surfaceCardClass,
  toolbarInputClass,
  toolbarSelectClass,
} from "@/components/finance/page-header";

export function DebtsList() {
  const debts = usePortfolioStore((s) => s.debts);
  const deleteDebt = usePortfolioStore((s) => s.deleteDebt);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [payoffStrategy, setPayoffStrategy] = useState<"avalanche" | "snowball">(
    "avalanche",
  );

  const [editDebt, setEditDebt] = useState<Debt | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [debtToPayId, setDebtToPayId] = useState<string | null>(null);
  const activeDebtToPay = debts.find((d) => d.id === debtToPayId) || null;
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredDebts = debts.filter((d) => {
    const matchesSearch = d.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || d.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    setDeletingId(id);
    try {
      deleteDebt(id);
      toast.success("Liability deleted successfully!");
    } catch {
      toast.error("Error deleting liability");
    } finally {
      setDeletingId(null);
    }
  };

  const sortedStrategyDebts = useMemo(() => {
    const list = [...debts].filter((d) => d.remainingAmount > 0);
    if (payoffStrategy === "avalanche") {
      return list.sort(
        (a, b) => (b.interestRate || 0) - (a.interestRate || 0),
      );
    }
    return list.sort((a, b) => a.remainingAmount - b.remainingAmount);
  }, [debts, payoffStrategy]);

  return (
    <div className="space-y-5">
      {debts.length > 0 && (
        <Card className={surfaceCardClass}>
          <CardHeader className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Payoff order
              </CardTitle>
              <p className="text-xs text-slate-500">
                Priority for extra payments
              </p>
            </div>
            <div className="inline-flex rounded-xl border border-slate-200/60 bg-slate-100 p-1 dark:border-slate-700/60 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setPayoffStrategy("avalanche")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                  payoffStrategy === "avalanche"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-900",
                )}
              >
                Avalanche
              </button>
              <button
                type="button"
                onClick={() => setPayoffStrategy("snowball")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                  payoffStrategy === "snowball"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-900",
                )}
              >
                Snowball
              </button>
            </div>
          </CardHeader>
              <CardContent className="space-y-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              {sortedStrategyDebts.map((d, index) => (
                <React.Fragment key={d.id}>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-800 dark:bg-slate-950/40">
                    <span className="flex size-5 items-center justify-center rounded-lg bg-emerald-600 text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="max-w-[120px] truncate text-xs font-bold text-slate-900 dark:text-white">
                      {d.name}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {payoffStrategy === "avalanche"
                        ? d.interestRate != null
                          ? `${d.interestRate}%`
                          : "N/A"
                        : `₹${d.remainingAmount.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  {index < sortedStrategyDebts.length - 1 && (
                    <ArrowRight className="size-3.5 text-muted-foreground/50" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              {payoffStrategy === "avalanche" ? (
                <>
                  <strong className="text-slate-900 dark:text-white">Avalanche:</strong> pay
                  highest interest first to save the most.
                </>
              ) : (
                <>
                  <strong className="text-slate-900 dark:text-white">Snowball:</strong> clear
                  smallest balances first for quicker wins.
                </>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search debts"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={toolbarInputClass}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className={cn(toolbarSelectClass, "w-full sm:w-[150px]")}>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="Home Loan">Home Loan</SelectItem>
            <SelectItem value="Personal Loan">Personal Loan</SelectItem>
            <SelectItem value="Credit Card">Credit Card</SelectItem>
            <SelectItem value="Car Loan">Car Loan</SelectItem>
            <SelectItem value="Student Loan">Student Loan</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDebts.map((d) => {
          const payoffPercent =
            d.totalAmount > 0
              ? ((d.totalAmount - d.remainingAmount) / d.totalAmount) * 100
              : 0;
          const isCleared = d.remainingAmount === 0;

          return (
            <Card
              key={d.id}
              className={cn(
                surfaceCardClass,
                isCleared &&
                  "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-950/20",
              )}
            >
              <CardContent className="flex h-full flex-col gap-4 p-4 sm:p-5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {d.name}
                    </h3>
                    <Badge variant={d.category} className="mt-1" />
                  </div>
                  <div className="flex shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-slate-400 hover:text-slate-700"
                      onClick={() => {
                        setEditDebt(d);
                        setEditOpen(true);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <ConfirmDialog
                      title="Delete Liability"
                      description={`Are you sure you want to delete ${d.name}? This will remove it from your tracker.`}
                      onConfirm={() => handleDelete(d.id)}
                      loading={deletingId === d.id}
                      variant="destructive"
                      confirmText="Delete"
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          disabled={deletingId === d.id}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Owed
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                      ₹
                      {d.remainingAmount.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  {d.interestAmount ? (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Interest paid
                      </p>
                      <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-emerald-600">
                        ₹
                        {d.interestAmount.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Rate
                      </p>
                      <p className="mt-0.5 font-mono text-sm font-bold">
                        {d.interestRate != null ? `${d.interestRate}%` : "N/A"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>Paid off</span>
                    <span className="font-mono">{payoffPercent.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={payoffPercent}
                    className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800"
                    indicatorClassName="rounded-full bg-emerald-500"
                  />
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-slate-500">
                    {d.monthlyPayment != null
                      ? `EMI ₹${d.monthlyPayment.toLocaleString("en-IN")}/mo`
                      : "No EMI"}
                  </p>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDebtToPayId(d.id);
                        setPayDialogOpen(true);
                      }}
                      className="h-8 rounded-lg border-slate-200 px-3 text-xs font-bold dark:border-slate-700"
                    >
                      History
                    </Button>
                    {!isCleared && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setDebtToPayId(d.id);
                          setAddPaymentOpen(true);
                        }}
                        className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-500"
                      >
                        Pay
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredDebts.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-500 dark:border-slate-800">
            <CreditCard className="size-7 text-slate-300" />
            <p className="text-sm font-semibold">No debts found</p>
            <p className="text-xs">Add a liability to start tracking payoff.</p>
          </div>
        )}
      </div>

      <AddEditDebtDialog
        open={editOpen}
        setOpen={setEditOpen}
        debtToEdit={editDebt}
      />

      <DebtPaymentsDialog
        open={payDialogOpen}
        setOpen={setPayDialogOpen}
        debt={activeDebtToPay}
      />

      <AddEditDebtPaymentDialog
        open={addPaymentOpen}
        setOpen={setAddPaymentOpen}
        debt={activeDebtToPay}
      />
    </div>
  );
}

function Badge({
  variant,
  className,
}: {
  variant: Debt["category"];
  className?: string;
}) {
  const styles: Record<Debt["category"], string> = {
    "Home Loan": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Personal Loan": "bg-purple-500/10 text-purple-600 border-purple-500/20",
    "Credit Card": "bg-rose-500/10 text-rose-600 border-rose-500/20",
    "Car Loan": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    "Student Loan": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    Other: "bg-muted text-muted-foreground border-border/40",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold",
        styles[variant] || "bg-muted text-muted-foreground",
        className,
      )}
    >
      {variant}
    </span>
  );
}
