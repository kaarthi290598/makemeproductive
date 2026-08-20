"use client";

import { useState, useEffect } from "react";
import { useExpenseStore } from "@/hooks/use-expense-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2 } from "lucide-react";
import { cn, formatDateToLocalISO, parseLocalISODate } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomDatePicker } from "../customDatePicker";

import { toast } from "sonner";
import { Transaction } from "@/types/expense";
import { useInvalidateExpense } from "@/hooks/use-expense-queries";

interface AddTransactionDialogProps {
  defaultType?: "income" | "expense";
  trigger?: React.ReactNode;
  transactionToEdit?: Transaction;
  onOpenChange?: (open: boolean) => void;
}

export function AddTransactionDialog({
  defaultType = "expense",
  trigger,
  transactionToEdit,
  onOpenChange,
}: AddTransactionDialogProps) {
  const categories = useExpenseStore((s) => s.categories);
  const persons = useExpenseStore((s) => s.persons);
  const addTransaction = useExpenseStore((s) => s.addTransaction);
  const updateTransaction = useExpenseStore((s) => s.updateTransaction);
  const invalidateExpense = useInvalidateExpense();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">(defaultType);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [note, setNote] = useState("");
  const [needsSettlement, setNeedsSettlement] = useState(false);
  const [paidBy, setPaidBy] = useState<string>(""); // Default empty, effect will set it
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addAnother, setAddAnother] = useState(false);

  const isEditMode = !!transactionToEdit;

  useEffect(() => {
    if (open) {
      if (transactionToEdit) {
        // Edit Mode: Pre-fill
        setType(transactionToEdit.type);
        setAmount(transactionToEdit.amount.toString());
        setCategoryId(transactionToEdit.category_id || "");
        setDate(parseLocalISODate(transactionToEdit.date));
        setNote(transactionToEdit.note || "");
        setNeedsSettlement(transactionToEdit.needs_settlement || false);
        setPaidBy(
          transactionToEdit.paid_by ||
            (persons.length > 0 ? persons[0].name : ""),
        );
      } else {
        // Add Mode: Reset to defaults
        setType(defaultType);
        setAmount("");
        setCategoryId("");
        setDate(new Date());
        setNote("");
        setNeedsSettlement(false);
        setPaidBy(persons.length > 0 ? persons[0].name : "");
      }
    }
  }, [open, defaultType, transactionToEdit, persons]);

  // Handle default payer change when category changes
  useEffect(() => {
    if (type === "expense" && categoryId) {
      const category = categories.find((c) => c.id === categoryId);
      if (category && category.default_payer) {
        setPaidBy(category.default_payer);
      }
    }
  }, [categoryId, type, categories]);

  const handleSubmit = async () => {
    if (!amount || !date) {
      toast.error("Please fill in Amount and Date");
      return;
    }
    if (type === "expense" && !categoryId) {
      toast.error("Please select a Category for expenses");
      return;
    }
    if (!paidBy) {
      toast.error("Please select who paid");
      return;
    }

    setIsSubmitting(true);
    try {
      const transactionData = {
        amount: parseFloat(amount),
        type,
        category_id: type === "expense" ? categoryId : undefined,
        date: formatDateToLocalISO(date),
        note,
        needs_settlement: type === "expense" ? needsSettlement : undefined,
        paid_by: paidBy,
      };

      if (isEditMode && transactionToEdit) {
        await updateTransaction(transactionToEdit.id, transactionData);
        toast.success("Transaction updated successfully!");
      } else {
        await addTransaction(transactionData);
        toast.success("Transaction added successfully!");
      }
      await invalidateExpense();

      if (!isEditMode && addAnother) {
        resetForm();
      } else {
        setOpen(false);
        if (onOpenChange) onOpenChange(false);
        resetForm();
      }
    } catch (err) {
      // Error handled by store, just stop loading
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    if (!isEditMode) {
      setAmount("");
      setCategoryId("");
      setDate(new Date());
      setNote("");
      setType(defaultType);
      setNeedsSettlement(false);
      setPaidBy(persons.length > 0 ? persons[0].name : "");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[420px]">
        <DialogHeader className="space-y-1 border-b border-border/40 px-5 py-4">
          <DialogTitle className="text-lg">
            {isEditMode ? "Edit" : "Add"}{" "}
            {type === "income" ? "credit" : "debit"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update this entry." : "Takes a few seconds."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-5 py-4">
          <div className="inline-flex w-full rounded-full bg-muted/80 p-1">
            <button
              type="button"
              onClick={() => setType("income")}
              className={cn(
                "flex-1 rounded-full py-2 text-xs font-semibold transition-all",
                type === "income"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Credit
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={cn(
                "flex-1 rounded-full py-2 text-xs font-semibold transition-all",
                type === "expense"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Debit
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-11 rounded-xl pl-7 text-lg font-semibold"
                placeholder="0"
              />
            </div>
          </div>

          {type === "expense" && (
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="paidBy">Paid by</Label>
              <Select value={paidBy} onValueChange={setPaidBy}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Who paid" />
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
            <div className="space-y-1.5">
              <Label>Date</Label>
              <CustomDatePicker value={date} onChange={setDate} />
            </div>
          </div>

          {type === "expense" && (
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border/50 px-3 py-2.5">
              <Checkbox
                id="settlement"
                checked={needsSettlement}
                onCheckedChange={(c) => setNeedsSettlement(!!c)}
              />
              <span className="text-sm">Needs settlement</span>
            </label>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-10 rounded-xl"
              placeholder="Optional"
            />
          </div>
        </div>
        <DialogFooter className="border-t border-border/40 px-5 py-4 sm:justify-between">
          {!isEditMode ? (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                id="addAnother"
                checked={addAnother}
                onCheckedChange={(c) => setAddAnother(!!c)}
              />
              Add another
            </label>
          ) : (
            <span />
          )}
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-10 rounded-full px-5"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
