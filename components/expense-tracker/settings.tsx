"use client";

import { useState } from "react";
import { useExpenseStore } from "@/hooks/use-expense-store";
import { useExpenseStats } from "@/hooks/use-expense-queries";
import { Category } from "@/types/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, UserPlus, Pencil } from "lucide-react";
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
import {
  tabListClassName,
  tabTriggerClassName,
} from "@/components/finance/page-header";

export function Settings() {
  const categories = useExpenseStore((s) => s.categories);
  const persons = useExpenseStore((s) => s.persons);
  const addCategory = useExpenseStore((s) => s.addCategory);
  const updateCategory = useExpenseStore((s) => s.updateCategory);
  const deleteCategory = useExpenseStore((s) => s.deleteCategory);
  const addPerson = useExpenseStore((s) => s.addPerson);
  const deletePerson = useExpenseStore((s) => s.deletePerson);

  const currentMonth = formatDateToLocalISO(new Date()).slice(0, 7);
  const { data: stats } = useExpenseStats("month", [currentMonth], "all");

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
      <TabsList className={tabListClassName()}>
        <TabsTrigger value="categories" className={tabTriggerClassName()}>
          Categories
        </TabsTrigger>
        <TabsTrigger value="persons" className={tabTriggerClassName()}>
          People
        </TabsTrigger>
      </TabsList>

      <TabsContent value="categories" className="space-y-4">
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="h-fit rounded-2xl border-border/40 shadow-none">
            <CardHeader className="px-5 pb-3 pt-5">
              <CardTitle className="text-base">
                {editingCategoryId ? "Edit category" : "New category"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div className="space-y-1.5">
                <Label htmlFor="c-name">Name</Label>
                <Input
                  id="c-name"
                  placeholder="e.g. Groceries"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-budget">Monthly budget (₹)</Label>
                <Input
                  id="c-budget"
                  type="number"
                  placeholder="5000"
                  value={newCategoryBudget}
                  onChange={(e) => setNewCategoryBudget(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-payer">Default payer</Label>
                <Select value={defaultPayer} onValueChange={setDefaultPayer}>
                  <SelectTrigger id="c-payer" className="h-10 rounded-xl">
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
                  className="h-10 flex-1 rounded-full"
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
                    className="h-10 rounded-full"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="custom-scrollbar max-h-[560px] space-y-3 overflow-y-auto pr-1">
            {categories.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border/60 px-4 py-12 text-center text-sm text-muted-foreground">
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
                      "rounded-2xl border-border/40 shadow-none",
                      editingCategoryId === category.id &&
                        "border-primary/40 bg-primary/5",
                    )}
                  >
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                          {category.name}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full text-muted-foreground"
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
                              className="size-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          }
                        />
                      </div>
                      <div className="flex items-end justify-between text-xs">
                        <span className="font-semibold tabular-nums">
                          ₹
                          {spent.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </span>
                        <span className="text-muted-foreground">
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
                          "text-[11px] font-semibold",
                          isOver ? "text-rose-600" : "text-muted-foreground",
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
          <Card className="h-fit rounded-2xl border-border/40 shadow-none">
            <CardHeader className="px-5 pb-3 pt-5">
              <CardTitle className="text-base">Add person</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div className="space-y-1.5">
                <Label htmlFor="p-name">Name</Label>
                <Input
                  id="p-name"
                  placeholder="e.g. John"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className="h-10 rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddPerson();
                  }}
                />
              </div>
              <Button onClick={handleAddPerson} className="h-10 w-full rounded-full">
                <UserPlus className="mr-1.5 size-4" /> Add
              </Button>
            </CardContent>
          </Card>

          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
            {persons.length === 0 ? (
              <p className="px-4 py-12 text-center text-sm text-muted-foreground">
                No people yet.
              </p>
            ) : (
              <div className="divide-y divide-border/40">
                {persons.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 px-4 py-3.5"
                  >
                    <p className="min-w-0 flex-1 truncate text-sm font-medium">
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
                          className="size-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
    </Tabs>
  );
}
