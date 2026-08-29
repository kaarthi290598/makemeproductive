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
  PlusCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Send,
  User,
  Calendar,
  FileText,
  AlertCircle,
  Check,
} from "lucide-react";
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
  const [paidBy, setPaidBy] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addAnother, setAddAnother] = useState(false);

  const isEditMode = !!transactionToEdit;
  const isCredit = type === "income";

  useEffect(() => {
    if (open) {
      if (transactionToEdit) {
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

  useEffect(() => {
    if (type === "expense" && categoryId) {
      const category = categories.find((c) => c.id === categoryId);
      if (category && category.default_payer) {
        setPaidBy(category.default_payer);
      }
    }
  }, [categoryId, type, categories]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || !date) {
      toast.error("Please enter a valid amount and date");
      return;
    }
    if (type === "expense" && !categoryId) {
      toast.error("Please select a category for expense");
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
        note: note.trim() || undefined,
        needs_settlement: type === "expense" ? needsSettlement : undefined,
        paid_by: paidBy,
      };

      if (isEditMode && transactionToEdit) {
        await updateTransaction(transactionToEdit.id, transactionData);
        toast.success("Transaction updated successfully!");
      } else {
        await addTransaction(transactionData);
        toast.success(
          isCredit
            ? "Credit added successfully!"
            : "Debit added successfully!",
        );
      }
      invalidateExpense();

      if (!isEditMode && addAnother) {
        resetForm();
      } else {
        setOpen(false);
        if (onOpenChange) onOpenChange(false);
        resetForm();
      }
    } catch {
      // Error handled by store
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
      <DialogContent className="w-full max-w-full sm:w-[min(calc(100vw-1.5rem),32rem)] sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl rounded-b-none sm:rounded-3xl border-slate-200/90 p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <form onSubmit={handleSubmit} className="flex flex-col">

          {/* Desktop Only Full Header */}
          <div
            className={cn(
              "hidden border-b px-6 py-3.5 transition-colors duration-200 sm:block",
              isCredit
                ? "border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-transparent dark:border-emerald-950/60 dark:from-emerald-950/30"
                : "border-rose-100 bg-gradient-to-b from-rose-50/80 to-transparent dark:border-rose-950/60 dark:from-rose-950/30",
            )}
          >
            <DialogHeader className="space-y-0.5 text-left">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-all duration-300",
                    isCredit
                      ? "bg-emerald-600 shadow-emerald-600/25 ring-4 ring-emerald-100 dark:ring-emerald-950/50"
                      : "bg-rose-600 shadow-rose-600/25 ring-4 ring-rose-100 dark:ring-rose-950/50",
                  )}
                >
                  {isCredit ? (
                    <ArrowUpRight className="size-4.5" />
                  ) : (
                    <ArrowDownRight className="size-4.5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                    {isEditMode
                      ? "Edit Entry"
                      : isCredit
                        ? "Add Credit"
                        : "Add Debit"}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {isCredit
                      ? "Log cash in, income, or money received"
                      : "Log cash out, purchases, or expenses"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <DialogTitle className="sr-only sm:hidden">
            {isEditMode
              ? "Edit Entry"
              : isCredit
                ? "Add Credit"
                : "Add Debit"}
          </DialogTitle>

          {/* Dialog Main Form Body */}
          <div className="space-y-3 px-5 py-3.5 sm:px-6">
            {/* Segmented Type Toggle (when not editing) */}
            {!isEditMode && (
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200/80 bg-slate-100/90 p-1 dark:border-slate-800 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-bold transition-all duration-200",
                    isCredit
                      ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-400"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                  )}
                >
                  <ArrowUpRight className="size-3.5" />
                  Credit (Cash In)
                </button>
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-bold transition-all duration-200",
                    !isCredit
                      ? "bg-white text-rose-700 shadow-sm dark:bg-slate-800 dark:text-rose-400"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                  )}
                >
                  <ArrowDownRight className="size-3.5" />
                  Debit (Cash Out)
                </button>
              </div>
            )}
            {/* Amount Field */}
            <div
              className={cn(
                "group relative rounded-xl border p-3 transition-all duration-200",
                isCredit
                  ? "border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 dark:border-emerald-900/50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-emerald-950/10"
                  : "border-rose-200/80 bg-gradient-to-br from-rose-50/50 via-white to-rose-50/30 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/10 dark:border-rose-900/50 dark:from-rose-950/20 dark:via-slate-900 dark:to-rose-950/10",
              )}
            >
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="amount"
                  className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Amount *
                </Label>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    isCredit
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400",
                  )}
                >
                  INR (₹)
                </span>
              </div>

              <div className="relative mt-1 flex items-center">
                <IndianRupee
                  className={cn(
                    "pointer-events-none absolute left-0 size-5.5 shrink-0 transition-colors sm:size-6",
                    isCredit
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400",
                  )}
                />
                <Input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/-/g, ""))}
                  placeholder="0.00"
                  className={cn(
                    "h-10 border-0 bg-transparent pl-7 font-mono text-xl font-black tracking-tight shadow-none focus-visible:ring-0 sm:pl-8 sm:text-2xl",
                    "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                    isCredit
                      ? "text-emerald-950 placeholder:text-emerald-300 dark:text-emerald-200 dark:placeholder:text-emerald-800"
                      : "text-rose-950 placeholder:text-rose-300 dark:text-rose-200 dark:placeholder:text-rose-800",
                  )}
                />
              </div>
            </div>

            {/* Category Selector (for Expenses) */}
            {type === "expense" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Category <span className="text-rose-500">*</span>
                  </Label>
                  <span className="text-[10px] text-slate-400">
                    {categories.length} available
                  </span>
                </div>

                {categories.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 p-2.5 text-center text-xs text-slate-500 dark:border-slate-800">
                    No categories found. Add categories in Settings.
                  </p>
                ) : (
                  <div className="max-h-20 overflow-y-auto pr-1">
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map((cat) => {
                        const active = categoryId === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategoryId(cat.id)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all",
                              active
                                ? "border-rose-400 bg-rose-50 text-rose-900 shadow-sm ring-1 ring-rose-400 dark:border-rose-600 dark:bg-rose-950/60 dark:text-rose-200"
                                : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                            )}
                          >
                            <span
                              className="size-2 shrink-0 rounded-full shadow-xs"
                              style={{ backgroundColor: cat.color || "#f43f5e" }}
                            />
                            <span>{cat.name}</span>
                            {active && <Check className="size-3 shrink-0 text-rose-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Paid By Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Paid by <span className="text-rose-500">*</span>
                </Label>
                <span className="text-[10px] text-slate-400">
                  {persons.length} people
                </span>
              </div>

              {persons.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 p-2.5 text-center text-xs text-slate-500 dark:border-slate-800">
                  No people found. Add people in Settings.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {persons.map((person) => {
                    const active = paidBy === person.name;
                    return (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => setPaidBy(person.name)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-bold transition-all",
                          active
                            ? isCredit
                              ? "border-emerald-400 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-400 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-200"
                              : "border-rose-400 bg-rose-50 text-rose-900 shadow-sm ring-1 ring-rose-400 dark:border-rose-600 dark:bg-rose-950/60 dark:text-rose-200"
                            : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                        )}
                      >
                        <User className="size-3 text-slate-400" />
                        <span>{person.name}</span>
                        {active && (
                          <Check
                            className={cn(
                              "size-3",
                              isCredit ? "text-emerald-600" : "text-rose-600",
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Date and Note Row */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Calendar className="size-3.5 text-slate-400" />
                  Date <span className="text-rose-500">*</span>
                </Label>
                <CustomDatePicker
                  value={date}
                  onChange={setDate}
                  className="h-9 w-full rounded-xl border-slate-200 bg-slate-50/70 font-mono text-xs font-semibold shadow-2xs hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="note"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <FileText className="size-3.5 text-slate-400" />
                  Note
                </Label>
                <Input
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Lunch with team"
                  className="h-9 rounded-xl border-slate-200 bg-slate-50/70 text-xs shadow-2xs placeholder:text-slate-400 focus-visible:bg-white dark:border-slate-800 dark:bg-slate-900 dark:focus-visible:bg-slate-950"
                />
              </div>
            </div>

            {/* Needs Settlement Card (Expenses only) */}
            {type === "expense" && (
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-amber-200/70 bg-amber-50/60 p-2.5 transition-colors hover:bg-amber-50/90 dark:border-amber-900/50 dark:bg-amber-950/30 dark:hover:bg-amber-950/40">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                    <AlertCircle className="size-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950 dark:text-amber-200">
                      Needs settlement
                    </p>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400">
                      Flag this entry for splitting or reimbursement
                    </p>
                  </div>
                </div>
                <Checkbox
                  id="settlement"
                  checked={needsSettlement}
                  onCheckedChange={(c) => setNeedsSettlement(!!c)}
                  className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                />
              </label>
            )}
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 pt-3 pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))] dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-4">
            {!isEditMode ? (
              <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <Checkbox
                  id="addAnother"
                  checked={addAnother}
                  onCheckedChange={(c) => setAddAnother(!!c)}
                  className={cn(
                    isCredit
                      ? "data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      : "data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600",
                  )}
                />
                <span>Add another entry</span>
              </label>
            ) : (
              <div />
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "h-10 w-full gap-2 rounded-xl px-5 text-xs font-bold text-white shadow-lg active:scale-[0.98] sm:h-9.5 sm:w-auto sm:min-w-[140px]",
                isCredit
                  ? "bg-emerald-600 shadow-emerald-600/25 hover:bg-emerald-500"
                  : "bg-rose-600 shadow-rose-600/25 hover:bg-rose-500",
              )}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              <span>
                {isEditMode
                  ? "Save changes"
                  : isCredit
                    ? "Add Credit"
                    : "Add Debit"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



