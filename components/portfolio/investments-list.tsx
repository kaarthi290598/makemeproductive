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
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets"
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
              className="overflow-hidden rounded-2xl border-border/40 shadow-none"
            >
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold">
                        {inv.name}
                      </h3>
                      <Badge variant={inv.category} />
                    </div>
                    {inv.note && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {inv.note}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 rounded-full px-3 text-xs"
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
                      className="size-8 rounded-full text-muted-foreground"
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
                          className="size-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
                    <p className="text-[11px] text-muted-foreground">
                      Invested
                    </p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums">
                      ₹
                      {investedAmount.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Current
                    </p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums">
                      ₹
                      {currentValue.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Gain / loss
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 flex items-center gap-1 text-sm font-semibold tabular-nums",
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
                    <p className="text-[11px] text-muted-foreground">ROI</p>
                    <p
                      className={cn(
                        "mt-0.5 text-sm font-semibold tabular-nums",
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
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  History ({inv.contributionCount})
                  {isExpanded ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                </button>

                {isExpanded && (
                  <div className="-mx-5 -mb-5 divide-y divide-border/40 border-t border-border/40 bg-muted/20">
                    {!inv.historyLoaded ? (
                      <p className="px-5 py-6 text-center text-xs text-muted-foreground">
                        Loading history...
                      </p>
                    ) : inv.contributions.length === 0 ? (
                      <p className="px-5 py-6 text-center text-xs text-muted-foreground">
                        No contributions yet.
                      </p>
                    ) : (
                      inv.contributions.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-3 px-5 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium tabular-nums">
                              ₹
                              {c.amount.toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              })}{" "}
                              <span className="font-normal text-muted-foreground">
                                → ₹
                                {c.currentValue.toLocaleString("en-IN", {
                                  maximumFractionDigits: 0,
                                })}
                              </span>
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {c.date}
                              {c.note ? ` · ${c.note}` : ""}
                            </p>
                          </div>
                          <div className="flex shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-full text-muted-foreground"
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
                                  className="size-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 py-16 text-center text-muted-foreground">
            <Coins className="size-7 text-muted-foreground/40" />
            <p className="text-sm font-medium">No assets found</p>
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
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        styles[variant] || "bg-muted text-muted-foreground",
        className,
      )}
    >
      {variant}
    </span>
  );
}
