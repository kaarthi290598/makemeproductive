"use client";

import React, { useState, useMemo } from "react";
import { usePortfolioStore, Investment, InvestmentContribution } from "@/hooks/use-portfolio-store";
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
import { AddEditInvestmentDialog, AddEditContributionDialog } from "./add-edit-dialogs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  PlusCircle,
  Coins,
  History,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function InvestmentsList() {
  const { investments, deleteInvestment, deleteContribution } = usePortfolioStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Expanded Cards State
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Modal State
  const [editInv, setEditInv] = useState<Investment | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Contribution Modals
  const [activeInvForContrib, setActiveInvForContrib] = useState<Investment | null>(null);
  const [editContrib, setEditContrib] = useState<InvestmentContribution | null>(null);
  const [contribOpen, setContribOpen] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredInvestments = investments.filter((inv) => {
    const matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || inv.category === categoryFilter;
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
      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-card p-3 shadow-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground mr-2">
          <Filter className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Filter Assets</span>
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
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
            <SelectItem value="Stocks">Stocks</SelectItem>
            <SelectItem value="Mutual Funds">Mutual Funds</SelectItem>
            <SelectItem value="Crypto">Crypto</SelectItem>
            <SelectItem value="Real Estate">Real Estate</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid List */}
      <div className="grid gap-4 grid-cols-1">
        {filteredInvestments.map((inv) => {
          // Calculate sums
          const investedAmount = inv.contributions.reduce((acc, c) => acc + c.amount, 0);
          const currentValue = inv.contributions.reduce((acc, c) => acc + c.currentValue, 0);
          const returns = currentValue - investedAmount;
          const roi = investedAmount > 0 ? (returns / investedAmount) * 100 : 0;
          const isProfitable = returns >= 0;
          const isExpanded = !!expandedCards[inv.id];

          return (
            <Card
              key={inv.id}
              className="group overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-md transition-all rounded-xl"
            >
              <CardContent className="p-5 flex flex-col gap-4">
                {/* Main Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground truncate">{inv.name}</h3>
                        <Badge variant={inv.category} />
                      </div>
                      {inv.note && (
                        <p className="text-xs text-muted-foreground mt-0.5">{inv.note}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions in Header */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 rounded-lg border-border/60 text-xs font-semibold px-2.5"
                      onClick={() => {
                        setActiveInvForContrib(inv);
                        setEditContrib(null);
                        setContribOpen(true);
                      }}
                    >
                      <Plus className="size-3.5" />
                      <span>Log Purchase</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
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
                          className="size-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={deletingId === inv.id}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                    />
                  </div>
                </div>

                {/* Valuations Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border/30 pt-4">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Total Invested</p>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      ₹{investedAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Current Value</p>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      ₹{currentValue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Gain / Loss</p>
                    <p className={cn("text-base font-bold mt-0.5 flex items-center gap-1", isProfitable ? "text-emerald-600" : "text-rose-600")}>
                      {isProfitable ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                      ₹{Math.abs(returns).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">ROI Rate</p>
                    <p className={cn("text-base font-bold mt-0.5", isProfitable ? "text-emerald-600" : "text-rose-600")}>
                      {isProfitable ? "+" : ""}{roi.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Collapsible Action Footer */}
                <div className="flex items-center justify-between border-t border-border/20 pt-3 mt-1">
                  <button
                    onClick={() => toggleExpand(inv.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <History className="size-3.5" />
                    <span>Contribution History ({inv.contributions.length})</span>
                    {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  </button>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {inv.contributions.length > 0 ? `First logged: ${inv.contributions[inv.contributions.length - 1].date}` : "No entries"}
                  </span>
                </div>

                {/* Collapsible History Section */}
                {isExpanded && (
                  <div className="bg-muted/30 -mx-5 -mb-5 px-5 py-4 border-t border-border/20 space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Logged Transactions List</p>
                    <div className="overflow-x-auto rounded-lg border border-border/40 bg-background">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-border/40 text-[10px] uppercase font-semibold text-muted-foreground/80 bg-muted/20">
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">Note</th>
                            <th className="py-2 px-3 text-right">Invested (₹)</th>
                            <th className="py-2 px-3 text-right">Current Value (₹)</th>
                            <th className="py-2 px-3 text-right">Returns</th>
                            <th className="py-2 px-3 w-[70px]"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {inv.contributions.map((c) => {
                            const cReturns = c.currentValue - c.amount;
                            const cRoi = c.amount > 0 ? (cReturns / c.amount) * 100 : 0;
                            const cProfitable = cReturns >= 0;

                            return (
                              <tr key={c.id} className="border-b border-border/30 last:border-0 hover:bg-muted/10">
                                <td className="py-2 px-3 font-medium whitespace-nowrap">{c.date}</td>
                                <td className="py-2 px-3 text-muted-foreground truncate max-w-[120px]">{c.note || "-"}</td>
                                <td className="py-2 px-3 text-right font-medium tabular-nums">₹{c.amount.toLocaleString()}</td>
                                <td className="py-2 px-3 text-right font-medium tabular-nums">₹{c.currentValue.toLocaleString()}</td>
                                <td className={cn("py-2 px-3 text-right font-semibold tabular-nums", cProfitable ? "text-emerald-600" : "text-rose-600")}>
                                  {cProfitable ? "+" : ""}{cRoi.toFixed(0)}%
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-6 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                                      onClick={() => {
                                        setActiveInvForContrib(inv);
                                        setEditContrib(c);
                                        setContribOpen(true);
                                      }}
                                    >
                                      <Pencil className="size-3" />
                                    </Button>
                                    <ConfirmDialog
                                      title="Delete Contribution Log"
                                      description="Are you sure you want to delete this contribution? It will reduce your total valuation."
                                      onConfirm={() => handleDeleteContrib(inv.id, c.id)}
                                      variant="destructive"
                                      confirmText="Delete"
                                      trigger={
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="size-6 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                        >
                                          <Trash2 className="size-3" />
                                        </Button>
                                      }
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredInvestments.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed rounded-xl gap-2 text-center text-muted-foreground">
            <Coins className="size-8 text-muted-foreground/35" />
            <p className="text-sm font-medium">No assets found</p>
            <p className="text-xs">Add a new asset to get started with tracking.</p>
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

// Category Badge Helper Component
function Badge({ variant, className }: { variant: Investment["category"]; className?: string }) {
  const styles: Record<Investment["category"], string> = {
    "Stocks": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Mutual Funds": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "Crypto": "bg-purple-500/10 text-purple-600 border-purple-500/20",
    "Real Estate": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    "Gold": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Other": "bg-rose-500/10 text-rose-600 border-rose-500/20",
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
