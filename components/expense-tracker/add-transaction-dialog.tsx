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
import { PlusCircle, Plus, Minus, Loader2 } from "lucide-react";
import { cn, formatDateToLocalISO, parseLocalISODate } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomDatePicker } from "../customDatePicker";

import { toast } from "sonner";
import { Transaction } from "@/types/expense";

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
  const { categories, addTransaction, updateTransaction, persons } =
    useExpenseStore();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">(defaultType);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [note, setNote] = useState("");
  const [needsSettlement, setNeedsSettlement] = useState(false);
  const [paidBy, setPaidBy] = useState<string>(""); // Default empty, effect will set it
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      setOpen(false);
      if (onOpenChange) onOpenChange(false);
      resetForm();
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit" : "Add"}{" "}
            {type === "income" ? "Credit" : "Debit"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update details." : `Record a new ${type}.`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            {/* Hidden Type Select or readonly if we want to enforce buttons */}
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select
              value={type}
              onValueChange={(val: "income" | "expense") => setType(val)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income (Credit)</SelectItem>
                <SelectItem value="expense">Expense (Debit)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder="0.00"
            />
          </div>
          {type === "expense" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="col-span-3">
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
            </>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paidBy" className="text-right">
              Paid By
            </Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Paid By" />
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

          {type === "expense" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="settlement" className="text-right">
                Settlement
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="settlement"
                  checked={needsSettlement}
                  onCheckedChange={(c) => setNeedsSettlement(!!c)}
                />
                <label
                  htmlFor="settlement"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Need to Settle
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Date</Label>
            <div className="col-span-3">
              <CustomDatePicker value={date} onChange={setDate} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note" className="text-right">
              Note
            </Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="col-span-3"
              placeholder="Optional note"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Update" : "Save"}{" "}
            {type === "income" ? "Credit" : "Debit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
