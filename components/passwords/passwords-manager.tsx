"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePasswordsStore } from "@/hooks/use-passwords-store";
import { PasswordItem, PASSWORD_CATEGORIES } from "@/types/password";
import { PasswordCard } from "./password-card";
import { PasswordTableView } from "./password-table-view";
import { PasswordQuickCopyView } from "./password-quick-copy-view";
import { AddEditPasswordDialog } from "./add-edit-password-dialog";
import { ViewPasswordDialog } from "./view-password-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import {
  KeyRound,
  Plus,
  Search,
  X,
  Trash2,
  Lock,
  LayoutGrid,
  List,
  Copy,
  Landmark,
  Globe,
  ShieldCheck,
  FolderLock,
} from "lucide-react";

type ViewMode = "grid" | "list" | "quick-copy";

export function PasswordsManager() {
  const {
    passwords,
    loading,
    searchQuery,
    selectedCategory,
    selectedIds,
    setSearchQuery,
    setSelectedCategory,
    selectAll,
    clearSelection,
    loadPasswords,
    removeMultiplePasswords,
  } = usePasswordsStore();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PasswordItem | null>(null);
  const [viewingItem, setViewingItem] = useState<PasswordItem | null>(null);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);

  useEffect(() => {
    loadPasswords();
  }, [loadPasswords]);

  // Counts for KPI
  const bankAccountsCount = useMemo(
    () => passwords.filter((p) => p.category === "Bank").length,
    [passwords],
  );
  const webLoginsCount = useMemo(
    () =>
      passwords.filter(
        (p) =>
          p.category === "Social" ||
          p.category === "Work" ||
          p.category === "Entertainment",
      ).length,
    [passwords],
  );
  const otherCount = useMemo(
    () =>
      passwords.filter(
        (p) => p.category === "Personal" || p.category === "Other",
      ).length,
    [passwords],
  );

  // Filter passwords
  const filteredPasswords = useMemo(() => {
    return passwords.filter((item) => {
      const matchCat =
        selectedCategory === "All" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.username && item.username.toLowerCase().includes(q)) ||
        (item.website_url && item.website_url.toLowerCase().includes(q)) ||
        (item.account_number && item.account_number.toLowerCase().includes(q)) ||
        (item.ifsc_code && item.ifsc_code.toLowerCase().includes(q)) ||
        (item.customer_id && item.customer_id.toLowerCase().includes(q)) ||
        (item.account_holder_name &&
          item.account_holder_name.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [passwords, selectedCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: passwords.length };
    PASSWORD_CATEGORIES.forEach((cat) => {
      counts[cat] = passwords.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [passwords]);

  const allFilteredSelected =
    filteredPasswords.length > 0 &&
    filteredPasswords.every((p) => selectedIds.includes(p.id));

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
      await removeMultiplePasswords(selectedIds);
    } finally {
      setIsDeletingMultiple(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setAddOpen(true);
  };

  const handleOpenEdit = (item: PasswordItem) => {
    setEditingItem(item);
    setAddOpen(true);
  };

  const handleOpenView = (item: PasswordItem) => {
    setViewingItem(item);
    setViewOpen(true);
  };

  return (
    <div className="relative flex flex-col gap-4 p-4 sm:p-6 lg:p-8">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Saved Credentials */}
        <div className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-3.5 dark:border-emerald-800/40 dark:from-emerald-950/40 dark:to-emerald-900/20">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
              <KeyRound className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">
              Total Vault Items
            </span>
          </div>
          <p className="font-mono text-xl font-extrabold text-emerald-900 dark:text-emerald-300">
            {passwords.length}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Stored encrypted entries
          </p>
        </div>

        {/* Bank & Financial Accounts */}
        <div className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50 to-blue-100/40 p-3.5 dark:border-blue-800/40 dark:from-blue-950/40 dark:to-blue-900/20">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600/10 text-blue-700 dark:text-blue-400">
              <Landmark className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600/80 dark:text-blue-400/80">
              Bank Accounts
            </span>
          </div>
          <p className="font-mono text-xl font-extrabold text-blue-900 dark:text-blue-300">
            {bankAccountsCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            IFSC, ATM & Net Banking
          </p>
        </div>

        {/* Web & Apps */}
        <div className="rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-indigo-100/40 p-3.5 dark:border-indigo-800/40 dark:from-indigo-950/40 dark:to-indigo-900/20">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-700 dark:text-indigo-400">
              <Globe className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600/80 dark:text-indigo-400/80">
              Web & App Logins
            </span>
          </div>
          <p className="font-mono text-xl font-extrabold text-indigo-900 dark:text-indigo-300">
            {webLoginsCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Work, Social & Media accounts
          </p>
        </div>

        {/* Personal & Other */}
        <div className="rounded-xl border border-purple-200/60 bg-gradient-to-br from-purple-50 to-purple-100/40 p-3.5 dark:border-purple-800/40 dark:from-purple-950/40 dark:to-purple-900/20">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-purple-600/10 text-purple-700 dark:text-purple-400">
              <FolderLock className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600/80 dark:text-purple-400/80">
              Personal & Other
            </span>
          </div>
          <p className="font-mono text-xl font-extrabold text-purple-900 dark:text-purple-300">
            {otherCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Personal & miscellaneous items
          </p>
        </div>
      </div>

      {/* Search & Category Filter & View Mode Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by app, username, account, IFSC, URL..."
              className="h-9.5 rounded-xl border-slate-200 bg-white pl-9 pr-8 text-xs shadow-2xs placeholder:text-slate-400 focus-visible:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"
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

          {/* Right Toolbar: View Switchers + Select All + Add Button */}
          <div className="flex items-center gap-2">
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
                title="Card View"
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
                title="Table View"
              >
                <List className="size-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("quick-copy")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                  viewMode === "quick-copy"
                    ? "bg-slate-100 text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white",
                )}
                title="Quick Copy Sheet"
              >
                <Copy className="size-3.5" />
                <span className="hidden sm:inline">Quick Copy</span>
              </button>
            </div>

            {/* Select All Checkbox */}
            {viewMode !== "quick-copy" && filteredPasswords.length > 0 && (
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
                <Checkbox
                  checked={allFilteredSelected}
                  onCheckedChange={handleToggleSelectAll}
                  className="size-4 rounded border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <span className="hidden sm:inline">Select all</span>
              </label>
            )}

            {/* Add Password Button */}
            <Button
              onClick={handleOpenAdd}
              className="h-9 gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/25 transition-all hover:bg-emerald-500 active:scale-[0.98]"
            >
              <Plus className="size-4" />
              <span>Add Password</span>
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {["All", ...PASSWORD_CATEGORIES].map((cat) => {
            const active = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all",
                  active
                    ? "border-emerald-500 bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
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
      ) : filteredPasswords.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Lock className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
            {searchQuery || selectedCategory !== "All"
              ? "No matching credentials found"
              : "No passwords saved yet"}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            {searchQuery || selectedCategory !== "All"
              ? "Try adjusting your search query or switching to a different category filter."
              : "Store your website logins, app credentials, and accounts in your personal vault."}
          </p>
          {!(searchQuery || selectedCategory !== "All") && (
            <Button
              onClick={handleOpenAdd}
              className="mt-5 h-9.5 gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500"
            >
              <Plus className="size-4" />
              <span>Add Your First Password</span>
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPasswords.map((item) => (
            <PasswordCard
              key={item.id}
              item={item}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
            />
          ))}
        </div>
      ) : viewMode === "list" ? (
        <PasswordTableView
          items={filteredPasswords}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
        />
      ) : (
        <PasswordQuickCopyView items={filteredPasswords} />
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && viewMode !== "quick-copy" && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-2.5 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
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
                selectedIds.length === 1 ? "Password" : "Passwords"
              }`}
              description="Are you sure you want to delete these selected password entries? This action cannot be undone."
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
      <AddEditPasswordDialog
        open={addOpen}
        setOpen={setAddOpen}
        passwordToEdit={editingItem}
      />

      {/* View Dialog */}
      <ViewPasswordDialog
        open={viewOpen}
        setOpen={setViewOpen}
        password={viewingItem}
        onEdit={handleOpenEdit}
      />
    </div>
  );
}
