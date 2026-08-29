"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreditDuesStore } from "@/hooks/use-credit-dues-store";
import {
  CreditDueItem,
  calculateRemainingDue,
  calculateUtilization,
  getUtilizationHealth,
} from "@/types/credit-due";
import { CustomDatePicker } from "@/components/customDatePicker";
import { cn, formatDateToLocalISO, parseLocalISODate } from "@/lib/utils";
import { toast } from "sonner";
import {
  CreditCard,
  Send,
  Calendar,
  FileText,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

interface AddEditCreditDueDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  accountToEdit?: CreditDueItem | null;
}

const dialogShellClass =
  "w-full max-w-full sm:w-[min(calc(100vw-1.5rem),34rem)] sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl rounded-b-none sm:rounded-3xl border-slate-200/90 p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-950";

const inputClass =
  "h-10 sm:h-9 rounded-xl border-slate-200 bg-slate-50/70 text-sm sm:text-xs shadow-2xs placeholder:text-slate-400 focus-visible:bg-white dark:border-slate-800 dark:bg-slate-900 dark:focus-visible:bg-slate-950";

export function AddEditCreditDueDialog({
  open,
  setOpen,
  accountToEdit,
}: AddEditCreditDueDialogProps) {
  const { addCreditDue, editCreditDue } = useCreditDuesStore();

  const [name, setName] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [statementAmount, setStatementAmount] = useState("");
  const [totalOutstanding, setTotalOutstanding] = useState("");
  const [minimumDue, setMinimumDue] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name || "");
      setCreditLimit(
        accountToEdit.credit_limit != null ? String(accountToEdit.credit_limit) : "",
      );
      setStatementAmount(
        accountToEdit.statement_amount != null
          ? String(accountToEdit.statement_amount)
          : "",
      );
      setTotalOutstanding(
        accountToEdit.total_outstanding != null
          ? String(accountToEdit.total_outstanding)
          : "",
      );
      setMinimumDue(
        accountToEdit.minimum_due != null ? String(accountToEdit.minimum_due) : "",
      );
      setAmountPaid(
        accountToEdit.amount_paid != null ? String(accountToEdit.amount_paid) : "0",
      );
      setDueDate(
        accountToEdit.due_date
          ? parseLocalISODate(accountToEdit.due_date)
          : undefined,
      );
      setNotes(accountToEdit.notes || "");
    } else {
      setName("");
      setCreditLimit("");
      setStatementAmount("");
      setTotalOutstanding("");
      setMinimumDue("");
      setAmountPaid("0");
      setDueDate(undefined);
      setNotes("");
    }
  }, [accountToEdit, open]);

  const numLimit = parseFloat(creditLimit) || 0;
  const numStatement = parseFloat(statementAmount) || 0;
  const numOutstanding = parseFloat(totalOutstanding) || 0;
  const numPaid = parseFloat(amountPaid) || 0;

  const currentUtilization =
    numLimit > 0 ? Math.min(100, (numOutstanding / numLimit) * 100) : 0;
  const health = getUtilizationHealth(currentUtilization);
  const remainingDue = Math.max(0, (numStatement > 0 ? numStatement : numOutstanding) - numPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Card Name, Credit Limit, and Total Outstanding are mandatory
    if (!name.trim()) {
      toast.error("Please enter a Card / Account name");
      return;
    }
    if (!creditLimit || numLimit <= 0) {
      toast.error("Please enter a valid Credit Limit (e.g. 100000)");
      return;
    }
    if (totalOutstanding.trim() === "" || isNaN(numOutstanding) || numOutstanding < 0) {
      toast.error("Please enter the Total Outstanding balance (enter 0 if none)");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        credit_limit: numLimit,
        total_outstanding: numOutstanding,
        statement_amount: statementAmount.trim() !== "" ? numStatement : 0,
        minimum_due: minimumDue.trim() !== "" ? parseFloat(minimumDue) : null,
        amount_paid: numPaid,
        due_date: dueDate ? formatDateToLocalISO(dueDate) : null,
        notes: notes.trim() || null,
      };

      if (accountToEdit) {
        await editCreditDue(accountToEdit.id, payload);
      } else {
        await addCreditDue(payload);
      }
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={dialogShellClass}>
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Desktop Only Header */}
          <div className="hidden border-b border-rose-100 bg-gradient-to-b from-rose-50/80 to-transparent px-6 py-3.5 dark:border-rose-950/60 dark:from-rose-950/30 sm:block">
            <DialogHeader className="space-y-0.5 text-left">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/25 ring-4 ring-rose-100 dark:ring-rose-950/50">
                  <CreditCard className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                    {accountToEdit
                      ? "Edit Credit Card / Due Account"
                      : "Add Credit Card / Due Account"}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Card Name, Credit Limit, and Outstanding are required. Other details are optional.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <DialogTitle className="sr-only sm:hidden">
            {accountToEdit
              ? "Edit Credit Card / Due Account"
              : "Add Credit Card / Due Account"}
          </DialogTitle>

          {/* Form Body */}
          <div className="space-y-3 px-5 py-3.5 sm:px-6">
            {/* Account / Card Name (Mandatory) */}
            <div className="space-y-1">
              <Label
                htmlFor="cd-name"
                className="text-xs font-bold text-slate-900 dark:text-slate-100"
              >
                Card / Account Name <span className="font-black text-rose-500">*</span>
              </Label>
              <Input
                id="cd-name"
                placeholder="e.g. HDFC Regalia, ICICI Amazon Pay, SBI SimplyCLICK, Slice"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Credit Limit & Total Outstanding (ONLY THESE TWO ARE MANDATORY) */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="space-y-1">
                <Label
                  htmlFor="cd-limit"
                  className="text-xs font-bold text-slate-900 dark:text-slate-100"
                >
                  Credit Limit (₹) <span className="font-black text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <Input
                    id="cd-limit"
                    type="number"
                    min="0"
                    placeholder="e.g. 150000"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className={cn(inputClass, "pl-7 font-mono font-bold")}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="cd-outstanding"
                  className="text-xs font-bold text-slate-900 dark:text-slate-100"
                >
                  Total Outstanding (₹) <span className="font-black text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <Input
                    id="cd-outstanding"
                    type="number"
                    min="0"
                    placeholder="e.g. 34500"
                    value={totalOutstanding}
                    onChange={(e) => setTotalOutstanding(e.target.value)}
                    className={cn(inputClass, "pl-7 font-mono font-bold")}
                  />
                </div>
              </div>
            </div>

            {/* Live Utilization Meter Preview */}
            {numLimit > 0 && (
              <div className="space-y-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Credit Utilization:</span>
                  <span className={cn("rounded px-1.5 py-0.2 font-mono", health.bg, health.color)}>
                    {currentUtilization.toFixed(1)}% · {health.label}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={cn("h-full rounded-full transition-all duration-300", health.barColor)}
                    style={{ width: `${Math.min(100, currentUtilization)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Statement Amount & Minimum Due (Optional) */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="space-y-1">
                <Label
                  htmlFor="cd-stmt"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Statement Amount (₹, optional)
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <Input
                    id="cd-stmt"
                    type="number"
                    min="0"
                    placeholder="e.g. 28400"
                    value={statementAmount}
                    onChange={(e) => setStatementAmount(e.target.value)}
                    className={cn(inputClass, "pl-7 font-mono")}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="cd-min"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Minimum Amount Due (₹, optional)
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <Input
                    id="cd-min"
                    type="number"
                    min="0"
                    placeholder="e.g. 1500"
                    value={minimumDue}
                    onChange={(e) => setMinimumDue(e.target.value)}
                    className={cn(inputClass, "pl-7 font-mono")}
                  />
                </div>
              </div>
            </div>

            {/* Amount Paid & Due Date (Optional) */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="space-y-1">
                <Label
                  htmlFor="cd-paid"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Amount Already Paid (₹, optional)
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <Input
                    id="cd-paid"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className={cn(inputClass, "pl-7 font-mono")}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <Calendar className="size-3.5 text-slate-400" />
                  Payment Due Date (Optional)
                </Label>
                <CustomDatePicker
                  value={dueDate}
                  onChange={setDueDate}
                  className="h-9 w-full rounded-xl border-slate-200 bg-slate-50/70 font-mono text-xs font-semibold shadow-2xs hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                />
              </div>
            </div>

            {/* Remaining Due Preview */}
            {(numStatement > 0 || numOutstanding > 0) && (
              <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2 text-xs dark:border-rose-950/50 dark:bg-rose-950/20">
                <span className="font-bold text-rose-900 dark:text-rose-200">
                  Remaining Due:
                </span>
                <span className="font-mono font-black text-rose-700 dark:text-rose-300">
                  ₹{remainingDue.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {/* Notes (Optional) */}
            <div className="space-y-1">
              <Label
                htmlFor="cd-notes"
                className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                <FileText className="size-3.5 text-slate-400" />
                Notes & Bill Cycle (Optional)
              </Label>
              <Input
                id="cd-notes"
                placeholder="e.g. Statement generated on 15th, auto-debit enabled"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-5 pt-3 pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))] dark:border-slate-800 dark:bg-slate-900/50 sm:justify-end sm:px-6 sm:pb-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 w-full gap-2 rounded-xl bg-rose-600 px-5 text-xs font-bold text-white shadow-lg shadow-rose-600/25 active:scale-[0.98] hover:bg-rose-500 sm:h-9.5 sm:w-auto sm:min-w-[140px]"
            >
              <Send className="size-3.5" />
              <span>
                {isSubmitting
                  ? "Saving..."
                  : accountToEdit
                    ? "Update Credit Account"
                    : "Save Credit Account"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
