"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useExpenseStore } from "@/hooks/use-expense-store";
import { useExpenseStats } from "@/hooks/use-expense-queries";
import { Category, Person } from "@/types/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { cn, formatDateToLocalISO } from "@/lib/utils";
import { useReportTabReadyAfterFirstLoad } from "./tab-ready";
import { fetchExpenseTransactionsPage } from "@/lib/actions/expenseData";
import {
  Plus,
  Trash2,
  UserPlus,
  Pencil,
  Users,
  Search,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Wallet,
  Download,
  RotateCcw,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

const PRESET_COLORS = [
  { hex: "#10b981", label: "Emerald" },
  { hex: "#3b82f6", label: "Sky Blue" },
  { hex: "#8b5cf6", label: "Purple" },
  { hex: "#ec4899", label: "Pink" },
  { hex: "#f43f5e", label: "Rose" },
  { hex: "#f59e0b", label: "Amber" },
  { hex: "#06b6d4", label: "Cyan" },
  { hex: "#6366f1", label: "Indigo" },
  { hex: "#14b8a6", label: "Teal" },
  { hex: "#64748b", label: "Slate" },
];

export function Settings() {
  const categories = useExpenseStore((s) => s.categories);
  const persons = useExpenseStore((s) => s.persons);
  const addCategory = useExpenseStore((s) => s.addCategory);
  const updateCategory = useExpenseStore((s) => s.updateCategory);
  const deleteCategory = useExpenseStore((s) => s.deleteCategory);
  const addPerson = useExpenseStore((s) => s.addPerson);
  const updatePerson = useExpenseStore((s) => s.updatePerson);
  const deletePerson = useExpenseStore((s) => s.deletePerson);
  const reconcileBudget = useExpenseStore((s) => s.reconcileBudget);

  const currentMonth = formatDateToLocalISO(new Date()).slice(0, 7);
  const { data: stats, isLoading: statsLoading } = useExpenseStats("month", [currentMonth], "all");
  useReportTabReadyAfterFirstLoad(statsLoading);

  const spentByCategory = useMemo(
    () => stats?.spentByCategory || {},
    [stats?.spentByCategory],
  );

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Category Form State
  const [formName, setFormName] = useState("");
  const [formBudget, setFormBudget] = useState("");
  const [formColor, setFormColor] = useState(PRESET_COLORS[0].hex);
  const [formPayer, setFormPayer] = useState("");

  // Person State
  const [newPersonName, setNewPersonName] = useState("");
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editPersonName, setEditPersonName] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.default_payer && c.default_payer.toLowerCase().includes(q)),
    );
  }, [categories, searchQuery]);

  // Handle Category Dialog Open
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setFormName("");
    setFormBudget("");
    setFormColor(PRESET_COLORS[categories.length % PRESET_COLORS.length].hex);
    setFormPayer("");
    setIsCategoryDialogOpen(true);
  };

  const handleOpenEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormBudget(category.monthly_budget.toString());
    setFormColor(category.color || PRESET_COLORS[0].hex);
    setFormPayer(category.default_payer || "none");
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!formName.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    const budgetNum = parseFloat(formBudget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      toast.error("Please enter a valid monthly budget");
      return;
    }

    const payerValue = formPayer && formPayer !== "none" ? formPayer : undefined;

    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        name: formName.trim(),
        monthly_budget: budgetNum,
        color: formColor,
        default_payer: payerValue,
      });
      toast.success(`Category "${formName.trim()}" updated`);
    } else {
      await addCategory({
        name: formName.trim(),
        monthly_budget: budgetNum,
        color: formColor,
        default_payer: payerValue,
      });
      toast.success(`Category "${formName.trim()}" created`);
    }

    setIsCategoryDialogOpen(false);
  };

  // Handle Person Add / Edit
  const handleAddPerson = async () => {
    if (!newPersonName.trim()) {
      toast.error("Please enter a person name");
      return;
    }
    await addPerson(newPersonName.trim());
    setNewPersonName("");
    toast.success("Person added successfully");
  };

  const handleSaveEditPerson = async () => {
    if (!editingPerson || !editPersonName.trim()) return;
    await updatePerson(editingPerson.id, editPersonName.trim());
    toast.success("Person name updated");
    setEditingPerson(null);
  };

  // Handle CSV Export
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const res = await fetchExpenseTransactionsPage(
        { dateFilterType: "all", selectedDates: [], personFilter: "all" },
        1,
        1000,
      );

      if (!res.items || res.items.length === 0) {
        toast.info("No transactions found to export");
        return;
      }

      const headers = ["ID", "Date", "Note", "Type", "Amount", "Category", "Paid By", "Status"];
      const rows = res.items.map((t) => [
        t.id,
        t.date,
        `"${(t.note || "").replace(/"/g, '""')}"`,
        t.type,
        t.amount,
        `"${(t.expense_categories?.name || "").replace(/"/g, '""')}"`,
        `"${(t.paid_by || "").replace(/"/g, '""')}"`,
        t.needs_settlement ? "Unsettled" : "Settled",
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `toolcity-expenses-${formatDateToLocalISO(new Date())}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${res.items.length} transactions to CSV`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to export transactions");
    } finally {
      setIsExporting(false);
    }
  };

  const handleReconcile = async () => {
    await reconcileBudget(currentMonth);
    toast.success("Monthly budgets successfully synced");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner pointing to Centralized Settings */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-3.5 sm:p-4 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-700 dark:text-emerald-400">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">
              Global Workspace & Clerk Settings
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Configure startup default module, Clerk profile, and appearance in the centralized Settings hub.
            </p>
          </div>
        </div>
        <Link
          href="/app/settings"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-emerald-600 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-emerald-500 transition-colors"
        >
          <span>Common Settings</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="categories" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList className="inline-flex h-auto w-full sm:w-auto justify-start gap-1 rounded-xl border border-slate-200/70 bg-slate-100/80 p-1 dark:border-slate-800/70 dark:bg-slate-900/80">
            <TabsTrigger
              value="categories"
              className="h-8 gap-1.5 rounded-lg px-3.5 text-xs font-bold text-slate-600 dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white"
            >
              <Wallet className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Categories & Budgets</span>
              <span className="ml-1 rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 text-[10px]">
                {categories.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="persons"
              className="h-8 gap-1.5 rounded-lg px-3.5 text-xs font-bold text-slate-600 dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white"
            >
              <Users className="size-3.5 text-blue-600 dark:text-blue-400" />
              <span>People & Payers</span>
              <span className="ml-1 rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 text-[10px]">
                {persons.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="h-8 gap-1.5 rounded-lg px-3.5 text-xs font-bold text-slate-600 dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white"
            >
              <Download className="size-3.5 text-violet-600 dark:text-violet-400" />
              <span>Data & Export</span>
            </TabsTrigger>
          </TabsList>

          {/* Action on right of tabs */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenAddCategory}
              className="h-8.5 gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-xs shadow-emerald-600/20 hover:bg-emerald-500"
            >
              <Plus className="size-4" />
              <span>New Category</span>
            </Button>
          </div>
        </div>

        {/* ─── TAB 1: CATEGORIES & BUDGETS ────────────────────────────── */}
        <TabsContent value="categories" className="space-y-4">
          {/* Search Bar & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search categories or default payers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 rounded-xl pl-9 text-xs border-slate-200 dark:border-slate-800"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredCategories.length} of {categories.length} categories
            </p>
          </div>

          {/* Category Cards Grid */}
          {filteredCategories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Wallet className="size-6" />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                {searchQuery ? "No matching categories found" : "No expense categories yet"}
              </p>
              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? `Clear your search query "${searchQuery}" to view all categories.`
                  : "Create categories like Groceries, Dining, or Rent with monthly budget limits to start tracking."}
              </p>
              <Button
                onClick={handleOpenAddCategory}
                className="mt-4 h-9 gap-1.5 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>Create First Category</span>
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCategories.map((category) => {
                const spent = spentByCategory[category.id] || 0;
                const budget = category.monthly_budget || 0;
                const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                const isOver = percentage > 100;
                const remaining = budget - spent;

                return (
                  <Card
                    key={category.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-slate-200/80 bg-white/70 p-4 shadow-xs transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/60"
                  >
                    <div>
                      {/* Card Header: Color dot, Name, Badges, and Quick Actions */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="size-3.5 shrink-0 rounded-full ring-2 ring-white dark:ring-slate-900"
                            style={{ backgroundColor: category.color || "#10b981" }}
                          />
                          <h4 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {category.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditCategory(category)}
                            className="size-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                            title="Edit Category"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <ConfirmDialog
                            title={`Delete Category "${category.name}"`}
                            description="Are you sure you want to delete this category? Associated transactions will remain safely in history without an assigned category."
                            onConfirm={() => {
                              deleteCategory(category.id);
                              toast.success(`Category "${category.name}" deleted`);
                            }}
                            variant="destructive"
                            confirmText="Delete"
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                                title="Delete Category"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            }
                          />
                        </div>
                      </div>

                      {/* Default Payer Tag */}
                      {category.default_payer && (
                        <div className="mt-1.5">
                          <Badge variant="outline" className="h-5 gap-1 text-[10px] font-bold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                            <Users className="size-2.5" />
                            <span>Payer: {category.default_payer}</span>
                          </Badge>
                        </div>
                      )}

                      {/* Amounts Display */}
                      <div className="mt-4 flex items-baseline justify-between font-mono">
                        <div>
                          <span className="text-xs text-slate-400">Spent: </span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            ₹{spent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400">Budget: </span>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            ₹{budget.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2 space-y-1">
                        <Progress
                          value={Math.min(percentage, 100)}
                          className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"
                          indicatorClassName={cn(
                            "rounded-full transition-all",
                            isOver
                              ? "bg-rose-500"
                              : percentage > 80
                              ? "bg-amber-500"
                              : "bg-emerald-500",
                          )}
                        />
                      </div>
                    </div>

                    {/* Bottom Status / Remaining */}
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] font-bold dark:border-slate-800/60">
                      <span className={cn(isOver ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-slate-400")}>
                        {percentage.toFixed(0)}% used
                      </span>
                      <span className={cn(isOver ? "text-rose-600 font-mono" : "text-emerald-600 dark:text-emerald-400 font-mono")}>
                        {isOver
                          ? `+₹${Math.abs(remaining).toLocaleString("en-IN")} over`
                          : `₹${remaining.toLocaleString("en-IN")} left`}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── TAB 2: PEOPLE & PAYERS ─────────────────────────────────── */}
        <TabsContent value="persons" className="space-y-4">
          <div className="grid gap-5 md:grid-cols-3">
            {/* Left: Add Person Card */}
            <Card className="h-fit rounded-2xl border-slate-200/80 bg-white/70 shadow-xs backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-900/60 p-5">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <UserPlus className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Add Split Member</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Track who paid for expenses or assign default payers to categories.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="person-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Member Name
                  </Label>
                  <Input
                    id="person-name"
                    placeholder="e.g. Alex, Roommate, Mom"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddPerson();
                    }}
                    className="h-9 rounded-xl border-slate-200 text-xs dark:border-slate-800"
                  />
                </div>
                <Button
                  onClick={handleAddPerson}
                  className="h-9 w-full gap-1.5 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-500"
                >
                  <Plus className="size-3.5" />
                  <span>Add Member</span>
                </Button>
              </CardContent>
            </Card>

            {/* Right: People List */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Members ({persons.length})
                </h3>
              </div>

              {persons.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
                  <Users className="mx-auto size-8 text-slate-300 dark:text-slate-600" />
                  <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                    No members added yet
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Add people using the form on the left to attribute spending.
                  </p>
                </div>
              ) : (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {persons.map((person) => {
                    const assignedCategories = categories.filter(
                      (c) => c.default_payer === person.name,
                    );

                    return (
                      <Card
                        key={person.id}
                        className="flex items-center justify-between rounded-xl border-slate-200/80 bg-white/70 p-3.5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/60"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700 font-bold text-xs dark:bg-emerald-500/20 dark:text-emerald-300">
                            {person.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                              {person.name}
                            </p>
                            <p className="truncate text-[11px] text-slate-400">
                              {assignedCategories.length > 0
                                ? `Default for ${assignedCategories.length} category`
                                : "No default categories"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingPerson(person);
                              setEditPersonName(person.name);
                            }}
                            className="size-7 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            title="Rename Person"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <ConfirmDialog
                            title={`Delete Member "${person.name}"`}
                            description="Are you sure you want to remove this person? Historical transactions mentioning them will be preserved."
                            onConfirm={() => {
                              deletePerson(person.id);
                              toast.success(`Removed ${person.name}`);
                            }}
                            variant="destructive"
                            confirmText="Delete"
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            }
                          />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ─── TAB 3: DATA & EXPORT ───────────────────────────────────── */}
        <TabsContent value="data" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Export Card */}
            <Card className="rounded-2xl border-slate-200/80 bg-white/70 shadow-xs backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-900/60 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
                  <Download className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Export Transactions
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Download your complete expense history as a `.csv` spreadsheet file.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  className="h-9 gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-emerald-500"
                >
                  <Download className="size-3.5" />
                  <span>{isExporting ? "Exporting..." : "Download CSV"}</span>
                </Button>
              </div>
            </Card>

            {/* Reconcile Budgets Card */}
            <Card className="rounded-2xl border-slate-200/80 bg-white/70 shadow-xs backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-900/60 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                  <RotateCcw className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Recalculate Monthly Budgets
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sync category spent figures with the current month&apos;s ledger.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={handleReconcile}
                  className="h-9 gap-1.5 rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Recalculate</span>
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── ADD / EDIT CATEGORY DIALOG ───────────────────────────────── */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
              {editingCategory ? "Edit Category" : "New Category"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              {editingCategory
                ? "Update category name, monthly spending target, or badge color."
                : "Add a category with a monthly budget limit to monitor your spending."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Category Name
              </Label>
              <Input
                id="cat-name"
                placeholder="e.g. Groceries, Coffee, Utilities"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="h-10 rounded-xl border-slate-200 text-sm dark:border-slate-800"
              />
            </div>

            {/* Monthly Budget */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-budget" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Monthly Target Budget (₹)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  ₹
                </span>
                <Input
                  id="cat-budget"
                  type="number"
                  placeholder="5000"
                  value={formBudget}
                  onChange={(e) => setFormBudget(e.target.value)}
                  className="h-10 rounded-xl pl-7 font-mono text-sm border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>

            {/* Curated Color Swatches */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Category Color Badge
              </Label>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {PRESET_COLORS.map((color) => {
                  const isSelected = formColor.toLowerCase() === color.hex.toLowerCase();
                  return (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setFormColor(color.hex)}
                      title={color.label}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full transition-all active:scale-90",
                        isSelected
                          ? "ring-2 ring-slate-900 ring-offset-2 dark:ring-white scale-110"
                          : "hover:scale-105 opacity-80 hover:opacity-100",
                      )}
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && <Check className="size-3.5 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Default Payer */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-payer" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Default Payer (Optional)
              </Label>
              <Select value={formPayer} onValueChange={setFormPayer}>
                <SelectTrigger id="cat-payer" className="h-10 rounded-xl border-slate-200 text-xs dark:border-slate-800">
                  <SelectValue placeholder="None (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Optional)</SelectItem>
                  {persons.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCategoryDialogOpen(false)}
              className="h-9 rounded-xl border-slate-200 text-xs dark:border-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              className="h-9 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-500"
            >
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── EDIT PERSON DIALOG ───────────────────────────────────────── */}
      <Dialog open={!!editingPerson} onOpenChange={(open) => !open && setEditingPerson(null)}>
        <DialogContent className="sm:max-w-sm rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
              Rename Member
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-1.5">
            <Label className="text-xs font-semibold">Name</Label>
            <Input
              value={editPersonName}
              onChange={(e) => setEditPersonName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEditPerson();
              }}
              className="h-9 rounded-xl text-xs"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditingPerson(null)}
              className="h-9 rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditPerson}
              className="h-9 rounded-xl bg-emerald-600 text-xs font-bold text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
