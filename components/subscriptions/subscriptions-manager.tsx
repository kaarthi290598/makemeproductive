"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSubscriptionsStore } from "@/hooks/use-subscriptions-store";
import {
  SubscriptionItem,
  SUBSCRIPTION_CATEGORIES,
  calculateMonthlyEquivalent,
  calculateYearlyEquivalent,
} from "@/types/subscription";
import { SubscriptionCard } from "./subscription-card";
import { SubscriptionTableView } from "./subscription-table-view";
import { AddEditSubscriptionDialog } from "./add-edit-subscription-dialog";
import { ViewSubscriptionDialog } from "./view-subscription-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import {
  CalendarSync,
  Plus,
  Search,
  X,
  Trash2,
  LayoutGrid,
  List,
  Sparkles,
  Calendar,
  CreditCard,
  Clock,
  TrendingUp,
} from "lucide-react";
import { parseISO, differenceInCalendarDays } from "date-fns";

type ViewMode = "grid" | "list";

export function SubscriptionsManager() {
  const {
    subscriptions,
    loading,
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedIds,
    setSearchQuery,
    setSelectedCategory,
    setSelectedStatus,
    selectAll,
    clearSelection,
    loadSubscriptions,
    removeMultipleSubscriptions,
  } = useSubscriptionsStore();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SubscriptionItem | null>(null);
  const [viewingItem, setViewingItem] = useState<SubscriptionItem | null>(null);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((item) => {
      const matchCat =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchStatus =
        selectedStatus === "all" || item.status === selectedStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.payment_method &&
          item.payment_method.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));
      return matchCat && matchStatus && matchSearch;
    });
  }, [subscriptions, selectedCategory, selectedStatus, searchQuery]);

  // Statistics
  const activeSubs = useMemo(
    () => subscriptions.filter((s) => s.status === "active"),
    [subscriptions],
  );

  const totalMonthlySpend = useMemo(() => {
    return activeSubs.reduce(
      (sum, s) =>
        sum + calculateMonthlyEquivalent(s.amount, s.billing_frequency),
      0,
    );
  }, [activeSubs]);

  const totalYearlySpend = useMemo(() => {
    return activeSubs.reduce(
      (sum, s) =>
        sum + calculateYearlyEquivalent(s.amount, s.billing_frequency),
      0,
    );
  }, [activeSubs]);

  const upcomingRenewalsCount = useMemo(() => {
    return activeSubs.filter((s) => {
      const days = differenceInCalendarDays(
        parseISO(s.next_payment_date),
        new Date(),
      );
      return days >= 0 && days <= 7;
    }).length;
  }, [activeSubs]);

  const allFilteredSelected =
    filteredSubscriptions.length > 0 &&
    filteredSubscriptions.every((s) => selectedIds.includes(s.id));

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
      await removeMultipleSubscriptions(selectedIds);
    } finally {
      setIsDeletingMultiple(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setAddOpen(true);
  };

  const handleOpenEdit = (item: SubscriptionItem) => {
    setEditingItem(item);
    setAddOpen(true);
  };

  const handleOpenView = (item: SubscriptionItem) => {
    setViewingItem(item);
    setViewOpen(true);
  };

  return (
    <div className="relative flex flex-col gap-4 p-4 sm:p-6 lg:p-8">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Cost */}
        <div className="rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-indigo-100/40 p-3.5 dark:border-indigo-800/40 dark:from-indigo-950/40 dark:to-indigo-900/20">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-700 dark:text-indigo-400">
              <Sparkles className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600/80 dark:text-indigo-400/80">
              Monthly Cost
            </span>
          </div>
          <p className="font-mono text-xl font-extrabold text-indigo-900 dark:text-indigo-300">
            ₹{totalMonthlySpend.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            <span className="text-xs font-normal text-indigo-600/70 dark:text-indigo-400/70">/mo</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Normalized across all active plans
          </p>
        </div>

        {/* Yearly Projection */}
        <div className="rounded-xl border border-sky-200/60 bg-gradient-to-br from-sky-50 to-sky-100/40 p-3.5 dark:border-sky-800/40 dark:from-sky-950/40 dark:to-sky-900/20">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-sky-600/10 text-sky-700 dark:text-sky-400">
              <TrendingUp className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600/80 dark:text-sky-400/80">
              Yearly Projection
            </span>
          </div>
          <p className="font-mono text-xl font-extrabold text-sky-900 dark:text-sky-300">
            ₹{totalYearlySpend.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            <span className="text-xs font-normal text-sky-600/70 dark:text-sky-400/70">/yr</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Annual recurring commitment
          </p>
        </div>

        {/* Active Subscriptions */}
        <div className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-3.5 dark:border-emerald-800/40 dark:from-emerald-950/40 dark:to-emerald-900/20">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
              <CreditCard className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">
              Active Plans
            </span>
          </div>
          <p className="font-mono text-xl font-extrabold text-emerald-900 dark:text-emerald-300">
            {activeSubs.length}
            <span className="text-xs font-normal text-emerald-600/70 dark:text-emerald-400/70">
              {" "}
              / {subscriptions.length} total
            </span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {subscriptions.length - activeSubs.length} paused or cancelled
          </p>
        </div>

        {/* Upcoming Renewals */}
        <div className="rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-100/40 p-3.5 dark:border-amber-800/40 dark:from-amber-950/40 dark:to-amber-900/20">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-600/10 text-amber-700 dark:text-amber-400">
              <Clock className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600/80 dark:text-amber-400/80">
              Upcoming (7 Days)
            </span>
          </div>
          <p className="font-mono text-xl font-extrabold text-amber-900 dark:text-amber-300">
            {upcomingRenewalsCount}
            <span className="text-xs font-normal text-amber-600/70 dark:text-amber-400/70"> renewals</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Due in next 7 calendar days
          </p>
        </div>
      </div>

      {/* Search, Status & Category Filter Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subscription, category, payment method..."
              className="h-9.5 rounded-xl border-slate-200 bg-white pl-9 pr-8 text-xs shadow-2xs placeholder:text-slate-400 focus-visible:border-indigo-500 dark:border-slate-800 dark:bg-slate-900"
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

          {/* Right Toolbar: Status Pills + View Switcher + Select All + Add Button */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pills */}
            <div className="flex items-center rounded-xl border border-slate-200/80 bg-white p-1 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              {[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "paused", label: "Paused" },
                { value: "cancelled", label: "Cancelled" },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSelectedStatus(s.value)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                    selectedStatus === s.value
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  {s.label}
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
            {filteredSubscriptions.length > 0 && (
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
                <Checkbox
                  checked={allFilteredSelected}
                  onCheckedChange={handleToggleSelectAll}
                  className="size-4 rounded border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <span className="hidden sm:inline">Select all</span>
              </label>
            )}

            {/* Add Subscription Button */}
            <Button
              onClick={handleOpenAdd}
              className="h-9 gap-1.5 rounded-xl bg-indigo-600 px-3.5 text-xs font-bold text-white shadow-sm shadow-indigo-600/25 transition-all hover:bg-indigo-500 active:scale-[0.98]"
            >
              <Plus className="size-4" />
              <span>Add Subscription</span>
            </Button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {["All", ...SUBSCRIPTION_CATEGORIES].map((cat) => {
            const active = selectedCategory === cat;
            const count =
              cat === "All"
                ? subscriptions.length
                : subscriptions.filter((s) => s.category === cat).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all",
                  active
                    ? "border-indigo-500 bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                    : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                <span>{cat}</span>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.2 font-mono text-[10px]",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Render */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <CalendarSync className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
            {searchQuery || selectedCategory !== "All" || selectedStatus !== "all"
              ? "No matching subscriptions found"
              : "No subscriptions tracked yet"}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            {searchQuery || selectedCategory !== "All" || selectedStatus !== "all"
              ? "Try clearing your filters or searching with a different keyword."
              : "Add your Netflix, Spotify, cloud tools, gym memberships and recurring bills."}
          </p>
          {!(searchQuery || selectedCategory !== "All" || selectedStatus !== "all") && (
            <Button
              onClick={handleOpenAdd}
              className="mt-5 h-9.5 gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500"
            >
              <Plus className="size-4" />
              <span>Add Your First Subscription</span>
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubscriptions.map((item) => (
            <SubscriptionCard
              key={item.id}
              item={item}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
            />
          ))}
        </div>
      ) : (
        <SubscriptionTableView
          items={filteredSubscriptions}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
        />
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-2.5 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
            <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {selectedIds.length === 1 ? "1 item" : `${selectedIds.length} items`} selected
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
                selectedIds.length === 1 ? "Subscription" : "Subscriptions"
              }`}
              description="Are you sure you want to delete the selected subscriptions? This action cannot be undone."
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
      <AddEditSubscriptionDialog
        open={addOpen}
        setOpen={setAddOpen}
        subscriptionToEdit={editingItem}
      />

      {/* View Dialog */}
      <ViewSubscriptionDialog
        open={viewOpen}
        setOpen={setViewOpen}
        subscription={viewingItem}
        onEdit={handleOpenEdit}
      />
    </div>
  );
}
