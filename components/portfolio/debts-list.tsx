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
import { AddEditDebtDialog, PayDebtDialog } from "./add-edit-dialogs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Pencil,
  Trash2,
  Search,
  Filter,
  CreditCard,
  PlusCircle,
  HelpCircle,
  TrendingDown,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function DebtsList() {
  const { debts, deleteDebt } = usePortfolioStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Strategy Tab
  const [payoffStrategy, setPayoffStrategy] = useState<"avalanche" | "snowball">("avalanche");

  // Modal State
  const [editDebt, setEditDebt] = useState<Debt | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [payDebtSelected, setPayDebtSelected] = useState<Debt | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredDebts = debts.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || d.category === categoryFilter;
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

  // Payoff Strategy Ordering
  const sortedStrategyDebts = useMemo(() => {
    // Clone array
    const list = [...debts].filter((d) => d.remainingAmount > 0);
    if (payoffStrategy === "avalanche") {
      // Sort by highest interest rate
      return list.sort((a, b) => b.interestRate - a.interestRate);
    } else {
      // Sort by lowest remaining amount (Snowball)
      return list.sort((a, b) => a.remainingAmount - b.remainingAmount);
    }
  }, [debts, payoffStrategy]);

  return (
    <div className="space-y-6">
      {/* Snowball vs Avalanche Calculator Widget */}
      {debts.length > 0 && (
        <Card className="border border-border/50 bg-card shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50 py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10">
                <Zap className="size-3.5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Debt Payoff Strategy Guide</CardTitle>
                <p className="text-[10px] text-muted-foreground mt-0.5">Determine the order of priority for extra payments</p>
              </div>
            </div>
            {/* Strategy Toggles */}
            <div className="flex bg-muted/60 p-0.5 rounded-lg border text-xs">
              <button
                onClick={() => setPayoffStrategy("avalanche")}
                className={cn(
                  "px-3 py-1 rounded-md font-medium transition-all",
                  payoffStrategy === "avalanche" ? "bg-background text-indigo-600 shadow-sm" : "text-muted-foreground"
                )}
              >
                Avalanche (High Rate)
              </button>
              <button
                onClick={() => setPayoffStrategy("snowball")}
                className={cn(
                  "px-3 py-1 rounded-md font-medium transition-all",
                  payoffStrategy === "snowball" ? "bg-background text-indigo-600 shadow-sm" : "text-muted-foreground"
                )}
              >
                Snowball (Low Balance)
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-4 bg-muted/10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payoff Priority:</span>
              {sortedStrategyDebts.map((d, index) => (
                <React.Fragment key={d.id}>
                  <div className="flex items-center gap-2 bg-background border px-2.5 py-1.5 rounded-lg shadow-sm">
                    <span className="flex size-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-foreground truncate max-w-[100px]" title={d.name}>
                      {d.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {payoffStrategy === "avalanche" ? `${d.interestRate}%` : `₹${d.remainingAmount.toLocaleString()}`}
                    </span>
                  </div>
                  {index < sortedStrategyDebts.length - 1 && (
                    <ArrowRight className="size-3.5 text-muted-foreground/50" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
              {payoffStrategy === "avalanche" ? (
                <><strong>Debt Avalanche:</strong> Mathematically optimal. Saves the most money in interest charges by tackling the highest interest rate loans first while paying minimums on others.</>
              ) : (
                <><strong>Debt Snowball:</strong> Psychologically powerful. Builds momentum by knocking out the smallest balances first, creating quick victories that help you stick to the plan.</>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-card p-3 shadow-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground mr-2">
          <Filter className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Filter Debts</span>
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search loans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 pl-9 pr-4 rounded-lg border-border/60 bg-background text-sm shadow-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-[150px] rounded-lg border-border/60 bg-background text-sm shadow-none transition-colors hover:bg-accent">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Home Loan">Home Loan</SelectItem>
            <SelectItem value="Personal Loan">Personal Loan</SelectItem>
            <SelectItem value="Credit Card">Credit Card</SelectItem>
            <SelectItem value="Car Loan">Car Loan</SelectItem>
            <SelectItem value="Student Loan">Student Loan</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Debts Grid List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDebts.map((d) => {
          const payoffPercent = d.totalAmount > 0 ? ((d.totalAmount - d.remainingAmount) / d.totalAmount) * 100 : 0;
          const isCleared = d.remainingAmount === 0;

          return (
            <Card
              key={d.id}
              className={cn(
                "group overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all rounded-xl",
                isCleared ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50"
              )}
            >
              <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                {/* Header */}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{d.name}</h3>
                    <Badge variant={d.category} className="mt-1" />
                  </div>
                  {/* Actions (visible on card hover) */}
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
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
                          className="size-7 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          disabled={deletingId === d.id}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                    />
                  </div>
                </div>

                {/* Valuations Row */}
                <div className="grid grid-cols-2 gap-2 border-t border-border/30 pt-3">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Owed Principal</p>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      ₹{d.remainingAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Interest Rate</p>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      {d.interestRate}% <span className="text-[10px] font-normal text-muted-foreground">p.a.</span>
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                    <span>Payoff Progress</span>
                    <span>{payoffPercent.toFixed(0)}%</span>
                  </div>
                  <Progress value={payoffPercent} className="h-1.5 bg-muted" indicatorClassName="bg-emerald-500 rounded-full" />
                </div>

                {/* Payoff Action & Info Footer */}
                <div className="flex items-center justify-between bg-muted/30 -mx-5 -mb-5 px-5 py-3 border-t border-border/20">
                  <div className="text-[10px] text-muted-foreground font-medium">
                    EMI: ₹{d.monthlyPayment.toLocaleString()}/mo
                  </div>
                  {!isCleared ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setPayDebtSelected(d);
                        setPayOpen(true);
                      }}
                      className="h-7 px-2.5 text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                    >
                      Log Payment
                    </Button>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                      Cleared 🎉
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredDebts.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed rounded-xl gap-2 text-center text-muted-foreground">
            <CreditCard className="size-8 text-muted-foreground/35" />
            <p className="text-sm font-medium">No debts found</p>
            <p className="text-xs">Add a new liability to start tracking payoff strategies.</p>
          </div>
        )}
      </div>

      <AddEditDebtDialog
        open={editOpen}
        setOpen={setEditOpen}
        debtToEdit={editDebt}
      />

      <PayDebtDialog
        open={payOpen}
        setOpen={setPayOpen}
        debt={payDebtSelected}
      />
    </div>
  );
}

// Category Badge Helper Component
function Badge({ variant, className }: { variant: Debt["category"]; className?: string }) {
  const styles: Record<Debt["category"], string> = {
    "Home Loan": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Personal Loan": "bg-purple-500/10 text-purple-600 border-purple-500/20",
    "Credit Card": "bg-rose-500/10 text-rose-600 border-rose-500/20",
    "Car Loan": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    "Student Loan": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    "Other": "bg-muted text-muted-foreground border-border/40",
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold",
      styles[variant] || "bg-muted text-muted-foreground",
      className
    )}>
      {variant}
    </span>
  );
}
