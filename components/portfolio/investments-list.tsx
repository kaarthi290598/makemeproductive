"use client";

import React, { useState } from "react";
import {
  usePortfolioStore,
  Investment,
  InvestmentContribution,
} from "@/hooks/use-portfolio-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AddEditInvestmentDialog,
  AddEditContributionDialog,
} from "./add-edit-dialogs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  Coins,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  surfaceCardClass,
  toolbarInputClass,
  toolbarSelectClass,
} from "@/components/finance/page-header";

export function InvestmentsList() {
  const investments = usePortfolioStore((s) => s.investments);
  const deleteInvestment = usePortfolioStore((s) => s.deleteInvestment);
  const deleteContribution = usePortfolioStore((s) => s.deleteContribution);
  const loadInvestmentHistory = usePortfolioStore((s) => s.loadInvestmentHistory);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(
    {},
  );

  const [editInv, setEditInv] = useState<Investment | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [activeInvForContrib, setActiveInvForContrib] =
    useState<Investment | null>(null);
  const [editContrib, setEditContrib] = useState<InvestmentContribution | null>(
    null,
  );
  const [contribOpen, setContribOpen] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) {
        void loadInvestmentHistory(id);
      }
      return next;
    });
  };

  const filteredInvestments = investments.filter((inv) => {
    const matchesSearch = inv.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || inv.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    setDeletingId(id);
    try {
      deleteInvestment(id);
      toast.success("Investment deleted successfully!");
    } catch {
      toast.error("Error deleting investment");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteContrib = (invId: string, cId: string) => {
    try {
      deleteContribution(invId, cId);
      toast.success("Transaction log deleted!");
    } catch {
      toast.error("Error deleting transaction log");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search assets"
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
            <SelectItem value="Stocks">Stocks</SelectItem>
            <SelectItem value="Mutual Funds">Mutual Funds</SelectItem>
            <SelectItem value="Crypto">Crypto</SelectItem>
            <SelectItem value="Real Estate">Real Estate</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {filteredInvestments.map((inv) => {
          const investedAmount = inv.investedAmount || 0;
          const currentValue = inv.currentValue || 0;
          const returns = currentValue - investedAmount;
          const roi = investedAmount > 0 ? (returns / investedAmount) * 100 : 0;
          const isProfitable = returns >= 0;
          const isExpanded = !!expandedCards[inv.id];

          return (
            <Card
              key={inv.id}
              className={surfaceCardClass}
            >
              <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {inv.name}
                      </h3>
                      <Badge variant={inv.category} />
                    </div>
                    {inv.note && (
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {inv.note}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      size="sm"
                      className="h-8 gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-500"
                      onClick={() => {
                        setActiveInvForContrib(inv);
                        setEditContrib(null);
                        setContribOpen(true);
                      }}
                    >
                      <Plus className="size-3.5" />
                      Log
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-slate-400 hover:text-slate-700"
                      onClick={() => {
                        setEditInv(inv);
                        setEditOpen(true);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <ConfirmDialog
                      title="Delete Investment"
                      description={`Are you sure you want to delete ${inv.name}? This will remove it and all contributions.`}
                      onConfirm={() => handleDelete(inv.id)}
                      loading={deletingId === inv.id}
                      variant="destructive"
                      confirmText="Delete"
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                          disabled={deletingId === inv.id}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Invested
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                      ₹
                      {investedAmount.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Current
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                      ₹
                      {currentValue.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Gain / loss
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 flex items-center gap-1 font-mono text-sm font-bold tabular-nums",
                        isProfitable ? "text-emerald-600" : "text-rose-600",
                      )}
                    >
                      {isProfitable ? (
                        <TrendingUp className="size-3.5" />
                      ) : (
                        <TrendingDown className="size-3.5" />
                      )}
                      ₹
                      {Math.abs(returns).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ROI</p>
                    <p
                      className={cn(
                        "mt-0.5 font-mono text-sm font-bold tabular-nums",
                        isProfitable ? "text-emerald-600" : "text-rose-600",
                      )}
                    >
                      {isProfitable ? "+" : ""}
                      {roi.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleExpand(inv.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  History ({inv.contributionCount})
                  {isExpanded ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                </button>

                {isExpanded && (
                  <div className="-mx-5 -mb-5 divide-y divide-slate-100 border-t border-slate-100 bg-slate-50 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950/40">
                    {!inv.historyLoaded ? (
                      <p className="px-5 py-6 text-center text-xs text-slate-500">
                        Loading history...
                      </p>
                    ) : inv.contributions.length === 0 ? (
                      <p className="px-5 py-6 text-center text-xs text-slate-500">
                        No contributions yet.
                      </p>
                    ) : (
                      inv.contributions.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-3 px-5 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                              ₹
                              {c.amount.toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              })}{" "}
                              <span className="font-normal text-slate-500">
                                → ₹
                                {c.currentValue.toLocaleString("en-IN", {
                                  maximumFractionDigits: 0,
                                })}
                              </span>
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {c.date}
                              {c.note ? ` · ${c.note}` : ""}
                            </p>
                          </div>
                          <div className="flex shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg text-slate-400"
                              onClick={() => {
                                setActiveInvForContrib(inv);
                                setEditContrib(c);
                                setContribOpen(true);
                              }}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <ConfirmDialog
                              title="Delete Contribution Log"
                              description="Are you sure you want to delete this contribution? It will reduce your total valuation."
                              onConfirm={() =>
                                handleDeleteContrib(inv.id, c.id)
                              }
                              variant="destructive"
                              confirmText="Delete"
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              }
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredInvestments.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-500 dark:border-slate-800">
            <Coins className="size-7 text-slate-300" />
            <p className="text-sm font-semibold">No assets found</p>
            <p className="text-xs">Add an asset to start tracking.</p>
          </div>
        )}
      </div>

      <AddEditInvestmentDialog
        open={editOpen}
        setOpen={setEditOpen}
        investmentToEdit={editInv}
      />

      <AddEditContributionDialog
        open={contribOpen}
        setOpen={setContribOpen}
        investment={activeInvForContrib}
        contributionToEdit={editContrib}
      />
    </div>
  );
}

function Badge({
  variant,
  className,
}: {
  variant: Investment["category"];
  className?: string;
}) {
  const styles: Record<Investment["category"], string> = {
    Stocks: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Mutual Funds": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Crypto: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    "Real Estate": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    Gold: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Other: "bg-rose-500/10 text-rose-600 border-rose-500/20",
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
