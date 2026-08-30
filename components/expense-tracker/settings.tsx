"use client";

import { useState } from "react";
import { useExpenseStore } from "@/hooks/use-expense-store";
import { useExpenseStats } from "@/hooks/use-expense-queries";
import { Category } from "@/types/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  UserPlus,
  Pencil,
  Users,
  ShieldCheck,
  Settings as SettingsIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn, formatDateToLocalISO } from "@/lib/utils";
import { useReportTabReadyAfterFirstLoad } from "./tab-ready";
import { useUser, useClerk, UserButton } from "@clerk/nextjs";

export function Settings() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const categories = useExpenseStore((s) => s.categories);
  const persons = useExpenseStore((s) => s.persons);
  const addCategory = useExpenseStore((s) => s.addCategory);
  const updateCategory = useExpenseStore((s) => s.updateCategory);
  const deleteCategory = useExpenseStore((s) => s.deleteCategory);
  const addPerson = useExpenseStore((s) => s.addPerson);
  const deletePerson = useExpenseStore((s) => s.deletePerson);

  const currentMonth = formatDateToLocalISO(new Date()).slice(0, 7);
  const { data: stats, isLoading: statsLoading } = useExpenseStats("month", [currentMonth], "all");
  useReportTabReadyAfterFirstLoad(statsLoading);

  const spentByCategory = stats?.spentByCategory || {};

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryBudget, setNewCategoryBudget] = useState("");
  const [defaultPayer, setDefaultPayer] = useState("");
  const [newPersonName, setNewPersonName] = useState("");

  const handleAddOrUpdateCategory = () => {
    if (!newCategoryName || !newCategoryBudget) {
      toast.error("Please enter a name and budget.");
      return;
    }

    if (editingCategoryId) {
      updateCategory(editingCategoryId, {
        name: newCategoryName,
        monthly_budget: parseFloat(newCategoryBudget),
        default_payer: defaultPayer || undefined,
      });
      toast.success("Category updated successfully!");
      setEditingCategoryId(null);
    } else {
      addCategory({
        name: newCategoryName,
        monthly_budget: parseFloat(newCategoryBudget),
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
        default_payer: defaultPayer || undefined,
      });
      toast.success("Category added successfully!");
    }

    setNewCategoryName("");
    setNewCategoryBudget("");
    setDefaultPayer("");
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setNewCategoryName(category.name);
    setNewCategoryBudget(category.monthly_budget.toString());
    setDefaultPayer(category.default_payer || "");
  };

  const handleCancelEditCategory = () => {
    setEditingCategoryId(null);
    setNewCategoryName("");
    setNewCategoryBudget("");
    setDefaultPayer("");
  };

  const handleAddPerson = () => {
    if (!newPersonName) {
      toast.error("Please enter a name.");
      return;
    }
    addPerson(newPersonName);
    setNewPersonName("");
    toast.success("Person added successfully!");
  };

  return (
    <Tabs defaultValue="categories" className="space-y-5">
      <TabsList className="h-auto w-full justify-start gap-1.5 rounded-xl border border-slate-200/60 bg-slate-100 p-1 dark:border-slate-700/60 dark:bg-slate-800 sm:w-auto">
        <TabsTrigger
          value="categories"
          className="h-auto flex-1 gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-slate-600 shadow-none sm:flex-none dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white"
        >
          Categories
        </TabsTrigger>
        <TabsTrigger
          value="persons"
          className="h-auto flex-1 gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-slate-600 shadow-none sm:flex-none dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white"
        >
          People
        </TabsTrigger>
        <TabsTrigger
          value="account"
          className="h-auto flex-1 gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-slate-600 shadow-none sm:flex-none dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white"
        >
          Account & Security
        </TabsTrigger>
      </TabsList>

      <TabsContent value="categories" className="space-y-4">
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="h-fit rounded-xl border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="px-5 pb-3 pt-5">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  1
                </span>
                <CardTitle className="text-base font-semibold">
                  {editingCategoryId ? "Edit category" : "New category"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div className="space-y-1.5">
                <Label htmlFor="c-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Name
                </Label>
                <Input
                  id="c-name"
                  placeholder="e.g. Groceries"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="h-10 rounded-lg border-slate-200 shadow-sm dark:border-slate-700"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-budget" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Monthly budget (₹)
                </Label>
                <Input
                  id="c-budget"
                  type="number"
                  placeholder="5000"
                  value={newCategoryBudget}
                  onChange={(e) => setNewCategoryBudget(e.target.value)}
                  className="h-10 rounded-lg border-slate-200 font-mono shadow-sm dark:border-slate-700"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-payer" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Default payer
                </Label>
                <Select value={defaultPayer} onValueChange={setDefaultPayer}>
                  <SelectTrigger id="c-payer" className="h-10 rounded-lg border-slate-200 shadow-sm dark:border-slate-700">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {persons.map((p) => (
                      <SelectItem key={p.id} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddOrUpdateCategory}
                  className="h-10 flex-1 rounded-xl bg-emerald-600 font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-500"
                >
                  {editingCategoryId ? (
                    "Save"
                  ) : (
                    <>
                      <Plus className="mr-1.5 size-4" /> Add
                    </>
                  )}
                </Button>
                {editingCategoryId && (
                  <Button
                    variant="outline"
                    onClick={handleCancelEditCategory}
                    className="h-10 rounded-xl border-slate-200 dark:border-slate-700"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="custom-scrollbar max-h-[560px] space-y-3 overflow-y-auto pr-1">
            {categories.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500 dark:border-slate-800">
                Add a category to start budgeting.
              </p>
            ) : (
              categories.map((category) => {
                const spent = spentByCategory[category.id] || 0;
                const percentage =
                  category.monthly_budget > 0
                    ? (spent / category.monthly_budget) * 100
                    : 0;
                const isOver = percentage > 100;

                return (
                  <Card
                    key={category.id}
                    className={cn(
                      "rounded-xl border-slate-200 shadow-sm dark:border-slate-800",
                      editingCategoryId === category.id &&
                        "border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30",
                    )}
                  >
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {category.name}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <ConfirmDialog
                          title="Delete Category"
                          description="Are you sure you want to delete this category? All associated transactions will still exist but without a category."
                          onConfirm={() => {
                            deleteCategory(category.id);
                            toast.success("Category deleted");
                          }}
                          variant="destructive"
                          confirmText="Delete"
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          }
                        />
                      </div>
                      <div className="flex items-end justify-between font-mono text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          ₹
                          {spent.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </span>
                        <span className="text-slate-400">
                          ₹
                          {category.monthly_budget.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className="h-1.5 rounded-full"
                        indicatorClassName={cn(
                          "rounded-full",
                          isOver
                            ? "bg-rose-500"
                            : percentage > 80
                              ? "bg-amber-500"
                              : "bg-emerald-500",
                        )}
                      />
                      <p
                        className={cn(
                          "text-[11px] font-bold",
                          isOver ? "text-rose-600" : "text-slate-500 dark:text-slate-400",
                        )}
                      >
                        {percentage.toFixed(0)}% used
                        {isOver ? " · over budget" : ""}
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="persons" className="space-y-4">
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="h-fit rounded-xl border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="px-5 pb-3 pt-5">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  1
                </span>
                <CardTitle className="text-base font-semibold">Add person</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div className="space-y-1.5">
                <Label htmlFor="p-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Name
                </Label>
                <Input
                  id="p-name"
                  placeholder="e.g. John"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className="h-10 rounded-lg border-slate-200 shadow-sm dark:border-slate-700"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddPerson();
                  }}
                />
              </div>
              <Button
                onClick={handleAddPerson}
                className="h-10 w-full rounded-xl bg-emerald-600 font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-500"
              >
                <UserPlus className="mr-1.5 size-4" /> Add
              </Button>
            </CardContent>
          </Card>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            {persons.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Users className="mx-auto mb-2 size-8 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  No people yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {persons.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 px-4 py-3.5"
                  >
                    <div className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {person.name}
                    </p>
                    <ConfirmDialog
                      title="Delete Person"
                      description="Are you sure you want to delete this person?"
                      onConfirm={() => {
                        deletePerson(person.id);
                        toast.success("Person deleted");
                      }}
                      variant="destructive"
                      confirmText="Delete"
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="account" className="space-y-4">
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="rounded-xl border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="px-5 pb-3 pt-5">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                <span>Clerk Account & Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Manage your user profile, linked email addresses, password security, and active sessions.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <UserButton
                    afterSignOutUrl="/"
                    userProfileMode="modal"
                    appearance={{
                      elements: {
                        avatarBox: "size-10",
                      },
                    }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {user?.fullName || user?.username || "Authenticated User"}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user?.primaryEmailAddress?.emailAddress || "Clerk Secure Session"}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => openUserProfile()}
                  className="h-9 gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-500"
                >
                  <SettingsIcon className="size-3.5" />
                  <span>Open Clerk Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="px-5 pb-3 pt-5">
              <CardTitle className="text-base font-semibold">Security & Session Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Authentication Provider</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Clerk Auth (256-bit)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Database Access</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Row Level Security (RLS)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Clerk User ID</span>
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                  {user?.id ? `${user.id.slice(0, 14)}...` : "Loading..."}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
