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
} from "lucide-react";
import { cn, formatDateToLocalISO, parseLocalISODate } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomDatePicker } from "../customDatePicker";

import { toast } from "sonner";
import { Transaction } from "@/types/expense";
import { useInvalidateExpense } from "@/hooks/use-expense-queries";
import {
  consoleDialogBodyClass,
  consoleDialogClass,
  consoleDialogFormClass,
} from "@/components/finance/page-header";
import { ChipScroll } from "@/components/ui/chip-scroll";

interface AddTransactionDialogProps {
  defaultType?: "income" | "expense";
  trigger?: React.ReactNode;
  transactionToEdit?: Transaction;
  onOpenChange?: (open: boolean) => void;
}

const fieldLabelClass =
  "block text-xs font-semibold text-slate-700 dark:text-slate-300";

const choiceIdleClass =
  "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400";

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
      <DialogContent className={consoleDialogClass}>
        <form onSubmit={handleSubmit} className={consoleDialogFormClass}>
          <DialogHeader className="shrink-0 space-y-0.5 border-b border-slate-100 px-4 py-2.5 pr-12 dark:border-slate-800 sm:px-5">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-white",
                  isCredit ? "bg-emerald-600" : "bg-rose-600",
                )}
              >
                {isCredit ? (
                  <ArrowUpRight className="size-4" />
                ) : (
                  <ArrowDownRight className="size-4" />
                )}
              </span>
              <div className="min-w-0 text-left">
                <DialogTitle className="text-base font-semibold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                  {isEditMode ? "Edit" : "Add"} {isCredit ? "credit" : "debit"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  {isEditMode
                    ? "Update this entry and save changes."
                    : "Log cash in or cash out in a few seconds."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className={consoleDialogBodyClass}>
            <div className="w-full self-start space-y-3">
              {!isEditMode && (
                <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all",
                    isCredit
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200"
                      : choiceIdleClass,
                  )}
                >
                  <ArrowUpRight className="size-3.5" />
                  Credit
                </button>
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all",
                    !isCredit
                      ? "border-rose-300 bg-rose-50 text-rose-900 shadow-sm dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-200"
                      : choiceIdleClass,
                  )}
                >
                  <ArrowDownRight className="size-3.5" />
                  Debit
                </button>
              </div>
            )}

            <div
              className={cn(
                "rounded-xl border p-3.5",
                isCredit
                  ? "border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/40"
                  : "border-rose-200/80 bg-rose-50/70 dark:border-rose-800/60 dark:bg-rose-950/40",
              )}
            >
              <Label htmlFor="amount" className={fieldLabelClass}>
                Amount *
              </Label>
                <div className="relative mt-1">
                <IndianRupee
                  className={cn(
                      "pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2",
                    isCredit
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400",
                  )}
                />
                <Input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  autoFocus
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/-/g, ""))}
                  className={cn(
                    "h-10 border-0 bg-transparent pl-6 text-xl font-black tracking-tight shadow-none focus-visible:ring-0",
                    "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                    isCredit
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-rose-700 dark:text-rose-300",
                  )}
                  placeholder="0"
                />
                </div>
              </div>
            </div>

            <div className="min-w-0 space-y-2.5 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  1
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Details
                </p>
              </div>

              {type === "expense" && (
                <div className="space-y-1.5">
                  <span className={fieldLabelClass}>Category *</span>
                  {categories.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Add categories in Settings first.
                    </p>
                  ) : (
                    <ChipScroll>
                      {categories.map((cat) => {
                        const active = categoryId === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategoryId(cat.id)}
                            className={cn(
                              "inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all",
                              active
                                ? "border-rose-300 bg-rose-50 text-rose-900 shadow-sm dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-200"
                                : choiceIdleClass,
                            )}
                          >
                            <span
                              className="size-2 shrink-0 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                          </button>
                        );
                      })}
                    </ChipScroll>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <span className={fieldLabelClass}>Paid by *</span>
                {persons.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Add people in Settings first.
                  </p>
                ) : (
                  <div
                    className={cn(
                      "grid gap-1.5",
                      persons.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3",
                    )}
                  >
                    {persons.map((person) => {
                      const active = paidBy === person.name;
                      return (
                        <button
                          key={person.id}
                          type="button"
                          onClick={() => setPaidBy(person.name)}
                          className={cn(
                            "inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-bold transition-all",
                            active
                              ? isCredit
                                ? "border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200"
                                : "border-rose-300 bg-rose-50 text-rose-900 shadow-sm dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-200"
                              : choiceIdleClass,
                          )}
                        >
                          <User className="size-3" />
                          {person.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="min-w-0 space-y-1">
                  <span className={fieldLabelClass}>Date *</span>
                  <CustomDatePicker
                    value={date}
                    onChange={setDate}
                    className="h-9 min-w-0 rounded-lg border-slate-200 bg-white font-mono text-xs font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900 [&_svg]:text-emerald-600 dark:[&_svg]:text-emerald-400"
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <Label htmlFor="note" className={fieldLabelClass}>
                    Note
                  </Label>
                  <Input
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="h-9 rounded-lg border-slate-200 bg-white text-sm shadow-sm focus-visible:border-emerald-500 focus-visible:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {type === "expense" && (
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-900/50">
                  <Checkbox
                    id="settlement"
                    checked={needsSettlement}
                    onCheckedChange={(c) => setNeedsSettlement(!!c)}
                  />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">
                    Needs settlement
                  </span>
                </label>
              )}
            </div>
          </div>

          <DialogFooter className="shrink-0 flex-col-reverse gap-2 border-t border-slate-100 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 sm:px-5">
            {!isEditMode ? (
              <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
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
              disabled={isSubmitting}
              className={cn(
                "h-10 w-full rounded-xl px-5 text-sm font-bold text-white shadow-lg sm:w-auto sm:min-w-[148px]",
                isCredit
                  ? "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-500"
                  : "bg-rose-600 shadow-rose-600/20 hover:bg-rose-500",
              )}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {isEditMode ? "Update entry" : isCredit ? "Save credit" : "Save debit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
