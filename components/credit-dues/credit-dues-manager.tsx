"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCreditDuesStore } from "@/hooks/use-credit-dues-store";
import {
  CreditDueItem,
  calculateRemainingDue,
  calculateUtilization,
  getUtilizationHealth,
} from "@/types/credit-due";
import { CreditDueCard } from "./credit-due-card";
import { CreditDuesTableView } from "./credit-dues-table-view";
import { AddEditCreditDueDialog } from "./add-edit-credit-due-dialog";
import { ViewCreditDueDialog } from "./view-credit-due-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Plus,
  Search,
  X,
  Trash2,
  LayoutGrid,
  List,
  Sparkles,
  TrendingDown,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { parseISO, differenceInCalendarDays } from "date-fns";

type ViewMode = "grid" | "list";

export function CreditDuesManager() {
  const {
    creditDues,
    loading,
    searchQuery,
    filterStatus,
    selectedIds,
    setSearchQuery,
    setFilterStatus,
    selectAll,
    clearSelection,
    loadCreditDues,
    removeMultipleCreditDues,
  } = useCreditDuesStore();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CreditDueItem | null>(null);
  const [viewingItem, setViewingItem] = useState<CreditDueItem | null>(null);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);

  useEffect(() => {
    loadCreditDues();
  }, [loadCreditDues]);

  // Filtered accounts
  const filteredCreditDues = useMemo(() => {
    return creditDues.filter((item) => {
      const remainingDue = calculateRemainingDue(item);
      const utilization = calculateUtilization(item);

      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "unpaid" && remainingDue > 0) ||
        (filterStatus === "paid" && remainingDue === 0) ||
        (filterStatus === "high_utilization" && utilization > 30);

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [creditDues, filterStatus, searchQuery]);

  // KPI calculations
  const totalRemainingDue = useMemo(() => {
    return creditDues.reduce((sum, item) => sum + calculateRemainingDue(item), 0);
  }, [creditDues]);

  const totalCreditLimit = useMemo(() => {
    return creditDues.reduce((sum, item) => sum + item.credit_limit, 0);
  }, [creditDues]);

  const totalOutstanding = useMemo(() => {
    return creditDues.reduce((sum, item) => sum + item.total_outstanding, 0);
  }, [creditDues]);

  const overallUtilization = useMemo(() => {
    if (totalCreditLimit <= 0) return 0;
    return (totalOutstanding / totalCreditLimit) * 100;
  }, [totalOutstanding, totalCreditLimit]);

  const utilizationHealth = getUtilizationHealth(overallUtilization);

  const duesThisWeekCount = useMemo(() => {
    return creditDues.filter((item) => {
      const remaining = calculateRemainingDue(item);
      if (remaining <= 0 || !item.due_date) return false;
      const days = differenceInCalendarDays(
        parseISO(item.due_date),
        new Date(),
      );
      return days >= 0 && days <= 7;
    }).length;
  }, [creditDues]);

  const allFilteredSelected =
    filteredCreditDues.length > 0 &&
    filteredCreditDues.every((c) => selectedIds.includes(c.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  const handleBulkDelete = async () => {
    setIsDeletingMultiple(true);
    try {
      await removeMultipleCreditDues(selectedIds);
    } finally {
      setIsDeletingMultiple(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setAddOpen(true);
  };

  const handleOpenEdit = (item: CreditDueItem) => {
    setEditingItem(item);
    setAddOpen(true);
  };

  const handleOpenView = (item: CreditDueItem) => {
    setViewingItem(item);
    setViewOpen(true);
  };

  return (
    <div className="relative flex flex-col gap-4 p-4 sm:p-6 lg:p-8">
      {/* KPI Stat Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Remaining Due */}
        <div className="rounded-xl border border-rose-200/60 bg-gradient-to-br from-rose-50 to-rose-100/40 p-3.5 dark:border-rose-800/40 dark:from-rose-950/40 dark:to-rose-900/20">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-rose-600/10 text-rose-700 dark:text-rose-400">
              <TrendingDown className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600/80 dark:text-rose-400/80">
              Remaining Due
            </span>
          </div>
          <p className="font-mono text-xl font-extrabold text-rose-900 dark:text-rose-300">
            ₹{totalRemainingDue.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Current unpaid statement dues
          </p>
        </div>

        {/* Portfolio Credit Utilization */}
        <div className="rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-indigo-100/40 p-3.5 dark:border-indigo-800/40 dark:from-indigo-950/40 dark:to-indigo-900/20">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-700 dark:text-indigo-400">
              <Sparkles className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600/80 dark:text-indigo-400/80">
              Credit Utilization
            </span>
          </div>
          <p className="font-mono text-xl font-extrabold text-indigo-900 dark:text-indigo-300">
            {overallUtilization.toFixed(1)}%
            <span className={cn("ml-2 text-xs font-bold", utilizationHealth.color)}>
              {utilizationHealth.label}
            </span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Target &lt; 30% for ideal health
          </p>
        </div>

        {/* Total Credit Limit */}
        <div className="rounded-xl border border-teal-200/60 bg-gradient-to-br from-teal-50 to-teal-100/40 p-3.5 dark:border-teal-800/40 dark:from-teal-950/40 dark:to-teal-900/20">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-teal-600/10 text-teal-700 dark:text-teal-400">
              <CreditCard className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600/80 dark:text-teal-400/80">
              Total Limit
            </span>
          </div>
          <p className="font-mono text-xl font-extrabold text-teal-900 dark:text-teal-300">
            ₹{totalCreditLimit.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Avail: ₹{(totalCreditLimit - totalOutstanding).toLocaleString("en-IN")}
          </p>
        </div>

        {/* Dues Due This Week */}
        <div className="rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-100/40 p-3.5 dark:border-amber-800/40 dark:from-amber-950/40 dark:to-amber-900/20">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-600/10 text-amber-700 dark:text-amber-400">
              <Clock className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600/80 dark:text-amber-400/80">
              Due This Week
            </span>
          </div>
          <p className="font-mono text-xl font-extrabold text-amber-900 dark:text-amber-300">
            {duesThisWeekCount}
            <span className="text-xs font-normal text-amber-600/70 dark:text-amber-400/70"> accounts</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Due in next 7 calendar days
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by card name, bank, notes..."
              className="h-9.5 rounded-xl border-slate-200 bg-white pl-9 pr-8 text-xs shadow-2xs placeholder:text-slate-400 focus-visible:border-rose-500 dark:border-slate-800 dark:bg-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Right Toolbar: Filter Tabs + View Mode Toggle + Select All + Add Button */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center rounded-xl border border-slate-200/80 bg-white p-1 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              {[
                { value: "all", label: "All" },
                { value: "unpaid", label: "Unpaid Dues" },
                { value: "paid", label: "Settled" },
                { value: "high_utilization", label: "High Util (>30%)" },
              ].map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilterStatus(f.value as any)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                    filterStatus === f.value
                      ? "bg-rose-600 text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* View Mode Switcher Pills */}
            <div className="flex items-center rounded-xl border border-slate-200/80 bg-white p-1 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                  viewMode === "grid"
                    ? "bg-slate-100 text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white",
                )}
                title="Card Grid View"
              >
                <LayoutGrid className="size-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                  viewMode === "list"
                    ? "bg-slate-100 text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white",
                )}
                title="Table List View"
              >
                <List className="size-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            {/* Select All Checkbox */}
            {filteredCreditDues.length > 0 && (
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
                <Checkbox
                  checked={allFilteredSelected}
                  onCheckedChange={handleToggleSelectAll}
                  className="size-4 rounded border-slate-300 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                />
                <span className="hidden sm:inline">Select all</span>
              </label>
            )}

            {/* Add Credit Account Button */}
            <Button
              onClick={handleOpenAdd}
              className="h-9 gap-1.5 rounded-xl bg-rose-600 px-3.5 text-xs font-bold text-white shadow-sm shadow-rose-600/25 transition-all hover:bg-rose-500 active:scale-[0.98]"
            >
              <Plus className="size-4" />
              <span>Add Account</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Render */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : filteredCreditDues.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            <CreditCard className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
            {searchQuery || filterStatus !== "all"
              ? "No matching credit accounts found"
              : "No credit cards or dues tracked yet"}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            {searchQuery || filterStatus !== "all"
              ? "Try adjusting your search query or switching to a different filter tab."
              : "Add your credit cards, pay later accounts, and line-of-credit limits to track utilization and never miss a payment."}
          </p>
          {!(searchQuery || filterStatus !== "all") && (
            <Button
              onClick={handleOpenAdd}
              className="mt-5 h-9.5 gap-2 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-500"
            >
              <Plus className="size-4" />
              <span>Add Your First Credit Account</span>
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCreditDues.map((item) => (
            <CreditDueCard
              key={item.id}
              item={item}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
            />
          ))}
        </div>
      ) : (
        <CreditDuesTableView
          items={filteredCreditDues}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
        />
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-2.5 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
            <span className="flex size-6 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {selectedIds.length === 1 ? "1 account" : `${selectedIds.length} accounts`} selected
            </span>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-8 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Clear
            </Button>

            <ConfirmDialog
              title={`Delete ${selectedIds.length} ${
                selectedIds.length === 1 ? "Account" : "Accounts"
              }`}
              description="Are you sure you want to delete the selected credit accounts? This action cannot be undone."
              onConfirm={handleBulkDelete}
              loading={isDeletingMultiple}
              variant="destructive"
              confirmText="Delete Selected"
              trigger={
                <Button
                  size="sm"
                  className="h-8 gap-1.5 rounded-xl bg-rose-600 px-3 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-500"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete ({selectedIds.length})</span>
                </Button>
              }
            />
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <AddEditCreditDueDialog
        open={addOpen}
        setOpen={setAddOpen}
        accountToEdit={editingItem}
      />

      {/* View Dialog */}
      <ViewCreditDueDialog
        open={viewOpen}
        setOpen={setViewOpen}
        account={viewingItem}
        onEdit={handleOpenEdit}
      />
    </div>
  );
}
