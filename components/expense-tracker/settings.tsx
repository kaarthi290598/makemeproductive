"use client";

import { useMemo, useState } from "react";
import { useExpenseStore } from "@/hooks/use-expense-store";
import { Category } from "@/types/expense";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, UserPlus, Edit2 } from "lucide-react";
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

export function Settings() {
  const {
    categories,
    transactions,
    addCategory,
    updateCategory,
    deleteCategory,
    persons,
    addPerson,
    deletePerson,
  } = useExpenseStore();

  const currentMonth = formatDateToLocalISO(new Date()).slice(0, 7); // YYYY-MM

  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((t) => {
      if (t.type !== "expense" || !t.date.startsWith(currentMonth)) return;
      if (t.category_id) {
        const current = map.get(t.category_id) || 0;
        map.set(t.category_id, current + t.amount);
      }
    });
    return map;
  }, [transactions, currentMonth]);

  // Category State
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryBudget, setNewCategoryBudget] = useState("");
  const [defaultPayer, setDefaultPayer] = useState("");

  // Person State
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
        color: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random color
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
    <Tabs defaultValue="categories" className="space-y-4">
      <TabsList>
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="persons">Persons</TabsTrigger>
      </TabsList>

      <TabsContent value="categories" className="space-y-4">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingCategoryId ? "Edit Category" : "Add New Category"}
              </CardTitle>
              <CardDescription>
                {editingCategoryId
                  ? "Update category details."
                  : "Create a new budget category."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="c-name">Name</Label>
                <Input
                  id="c-name"
                  placeholder="e.g. Groceries"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-budget">Monthly Budget (₹)</Label>
                <Input
                  id="c-budget"
                  type="number"
                  placeholder="500"
                  value={newCategoryBudget}
                  onChange={(e) => setNewCategoryBudget(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-payer">Default Payer (Optional)</Label>
                <Select value={defaultPayer} onValueChange={setDefaultPayer}>
                  <SelectTrigger id="c-payer">
                    <SelectValue placeholder="Select Default Payer" />
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
                <Button onClick={handleAddOrUpdateCategory} className="flex-1">
                  {editingCategoryId ? (
                    "Update Category"
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> Add Category
                    </>
                  )}
                </Button>
                {editingCategoryId && (
                  <Button variant="outline" onClick={handleCancelEditCategory}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="custom-scrollbar max-h-[560px] space-y-4 overflow-y-auto pr-2">
            {categories.map((category) => {
              const spent = spentByCategory.get(category.id) || 0;
              const percentage =
                category.monthly_budget > 0
                  ? (spent / category.monthly_budget) * 100
                  : 0;
              const isOver = percentage > 100;

              return (
                <Card
                  key={category.id}
                  className={cn(
                    "group transition-all duration-200 hover:border-primary/50 hover:shadow-md",
                    editingCategoryId === category.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "",
                  )}
                >
                  <CardHeader className="px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-tight">
                        <div
                          className="h-2.5 w-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
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
                              className="h-7 w-7 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 py-2.5 pt-0">
                    <div className="mb-2 flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="mb-0.5 text-[9px] font-bold uppercase leading-none tracking-wider text-muted-foreground">
                          Spent
                        </span>
                        <span className="text-xs font-bold tabular-nums">
                          ₹
                          {spent.toLocaleString("en-IN", {
                            minimumFractionDigits: 1,
                          })}
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="mb-0.5 text-[9px] font-bold uppercase leading-none tracking-wider text-muted-foreground">
                          Budget
                        </span>
                        <span className="text-xs font-medium tabular-nums text-muted-foreground">
                          ₹
                          {category.monthly_budget.toLocaleString("en-IN", {
                            minimumFractionDigits: 1,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-bold leading-none">
                        <div className="flex items-center gap-1">
                          <span
                            className={cn(
                              "rounded-sm px-1 py-0.5",
                              isOver
                                ? "bg-red-100 text-red-700"
                                : "bg-primary/10 text-primary",
                            )}
                          >
                            {isOver ? "EXCEEDED" : "USAGE"}
                          </span>
                          <span
                            className={
                              isOver
                                ? "font-bold text-red-600"
                                : "text-muted-foreground"
                            }
                          >
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <span
                          className={
                            isOver ? "text-red-600" : "font-bold text-green-600"
                          }
                        >
                          {isOver ? "OVER" : "OK"}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className="h-1.5"
                        indicatorClassName={cn(
                          "transition-all duration-500",
                          isOver
                            ? "bg-red-500"
                            : percentage > 80
                              ? "bg-yellow-500"
                              : "bg-green-500",
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="persons" className="space-y-4">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add New Person</CardTitle>
              <CardDescription>
                Add people who can pay for expenses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="p-name">Name</Label>
                <Input
                  id="p-name"
                  placeholder="e.g. John"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                />
              </div>
              <Button onClick={handleAddPerson} className="w-full">
                <UserPlus className="mr-2 h-4 w-4" /> Add Person
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {persons.map((person) => (
              <Card key={person.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    {person.name}
                  </CardTitle>
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
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                      </Button>
                    }
                  />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
