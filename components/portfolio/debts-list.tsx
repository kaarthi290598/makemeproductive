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
        <Card className="overflow-hidden rounded-2xl border-border/40 shadow-none">
          <CardHeader className="flex flex-col gap-3 border-b border-border/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">
                Payoff order
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Priority for extra payments
              </p>
            </div>
            <div className="inline-flex rounded-full bg-muted/80 p-1">
              <button
                type="button"
                onClick={() => setPayoffStrategy("avalanche")}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                  payoffStrategy === "avalanche"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Avalanche
              </button>
              <button
                type="button"
                onClick={() => setPayoffStrategy("snowball")}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                  payoffStrategy === "snowball"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Snowball
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              {sortedStrategyDebts.map((d, index) => (
                <React.Fragment key={d.id}>
                  <div className="flex items-center gap-2 rounded-full border border-border/40 bg-muted/40 px-2.5 py-1.5">
                    <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                      {index + 1}
                    </span>
                    <span className="max-w-[120px] truncate text-xs font-semibold">
                      {d.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
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
            <p className="text-xs leading-relaxed text-muted-foreground">
              {payoffStrategy === "avalanche" ? (
                <>
                  <strong className="text-foreground">Avalanche:</strong> pay
                  highest interest first to save the most.
                </>
              ) : (
                <>
                  <strong className="text-foreground">Snowball:</strong> clear
                  smallest balances first for quicker wins.
                </>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search debts"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 rounded-full border-border/50 bg-card pl-9 text-sm shadow-none"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-[150px] rounded-full border-border/50 bg-card text-xs shadow-none">
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
                "overflow-hidden rounded-2xl shadow-none",
                isCleared
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-border/40",
              )}
            >
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">{d.name}</h3>
                    <Badge variant={d.category} className="mt-1" />
                  </div>
                  <div className="flex shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-full text-muted-foreground"
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
                          className="size-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
                    <p className="text-[11px] text-muted-foreground">Owed</p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums">
                      ₹
                      {d.remainingAmount.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  {d.interestAmount ? (
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Interest paid
                      </p>
                      <p className="mt-0.5 text-sm font-semibold tabular-nums text-emerald-600">
                        ₹
                        {d.interestAmount.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[11px] text-muted-foreground">Rate</p>
                      <p className="mt-0.5 text-sm font-semibold">
                        {d.interestRate != null ? `${d.interestRate}%` : "N/A"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Paid off</span>
                    <span>{payoffPercent.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={payoffPercent}
                    className="h-1.5 rounded-full bg-muted"
                    indicatorClassName="rounded-full bg-emerald-500"
                  />
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] text-muted-foreground">
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
                      className="h-8 rounded-full px-3 text-xs"
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
                        className="h-8 rounded-full bg-foreground px-3 text-xs text-background hover:bg-foreground/90"
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
          <div className="col-span-full flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 py-16 text-center text-muted-foreground">
            <CreditCard className="size-7 text-muted-foreground/40" />
            <p className="text-sm font-medium">No debts found</p>
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
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        styles[variant] || "bg-muted text-muted-foreground",
        className,
      )}
    >
      {variant}
    </span>
  );
}
