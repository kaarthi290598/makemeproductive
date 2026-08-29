"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CreditDueItem,
  calculateRemainingDue,
  calculateUtilization,
  calculateAvailableCredit,
  getUtilizationHealth,
} from "@/types/credit-due";
import { RealisticCreditCard } from "./realistic-credit-card";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  Pencil as PencilIcon,
  FileText as FileTextIcon,
  Clock as ClockIcon,
  CheckCircle2 as CheckCircle2Icon,
  AlertCircle as AlertCircleIcon,
  Sparkles as SparklesIcon,
} from "lucide-react";
import { format, parseISO, differenceInCalendarDays } from "date-fns";

interface ViewCreditDueDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  account: CreditDueItem | null;
  onEdit: (item: CreditDueItem) => void;
}

export function ViewCreditDueDialog({
  open,
  setOpen,
  account,
  onEdit,
}: ViewCreditDueDialogProps) {
  const [payOpen, setPayOpen] = useState(false);

  if (!account) return null;

  const remainingDue = calculateRemainingDue(account);
  const utilization = calculateUtilization(account);
  const availableCredit = calculateAvailableCredit(account);
  const health = getUtilizationHealth(utilization);

  const daysLeft = account.due_date
    ? differenceInCalendarDays(parseISO(account.due_date), new Date())
    : null;

  const getDueBadge = () => {
    if (remainingDue === 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
          <CheckCircle2Icon className="size-3" />
          <span>Fully Settled</span>
        </span>
      );
    }
    if (!account.due_date || daysLeft === null) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <span>Active</span>
        </span>
      );
    }
    if (daysLeft < 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300">
          <AlertCircleIcon className="size-3" />
          <span>Overdue by {Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? "day" : "days"}</span>
        </span>
      );
    }
    if (daysLeft === 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300">
          <ClockIcon className="size-3" />
          <span>Due Today</span>
        </span>
      );
    }
    if (daysLeft <= 7) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300">
          <ClockIcon className="size-3" />
          <span>Due in {daysLeft} {daysLeft === 1 ? "day" : "days"}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <CalendarIcon className="size-3" />
        <span>Due in {daysLeft} days</span>
      </span>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-full sm:w-[min(calc(100vw-1.5rem),46rem)] sm:max-w-2xl max-h-[92dvh] overflow-y-auto rounded-t-3xl rounded-b-none sm:rounded-3xl border-slate-200/90 p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          {/* Header */}
          <div className="relative border-b border-slate-100 bg-slate-50/60 px-5 py-3.5 dark:border-slate-800/80 dark:bg-slate-900/40 sm:px-6">
            <DialogHeader className="space-y-0.5 text-left">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <DialogTitle className="truncate text-base font-black tracking-tight text-slate-900 dark:text-white sm:text-lg">
                    {account.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Card statement, utilization & settlement status
                  </DialogDescription>
                </div>
                <div className="shrink-0">{getDueBadge()}</div>
              </div>
            </DialogHeader>
          </div>

          {/* 2-Column Body (Zero Scroll Layout) */}
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:items-start">
              {/* Left Column: Physical Card + Utilization Box */}
              <div className="space-y-3.5">
                <RealisticCreditCard account={account} className="max-w-none" />

                {/* Credit Utilization Bar */}
                {account.credit_limit > 0 && (
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <SparklesIcon className="size-3.5 text-indigo-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Credit Utilization
                        </span>
                      </div>
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold",
                          health.bg,
                          health.color,
                        )}
                      >
                        {utilization.toFixed(1)}% · {health.label}
                      </span>
                    </div>

                    <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          health.barColor,
                        )}
                        style={{ width: `${Math.min(100, utilization)}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5 text-xs dark:border-slate-800/60">
                      <div>
                        <span className="text-slate-400">Limit: </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          ₹{account.credit_limit.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Avail: </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{availableCredit.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Statement Matrix + Due Date + Notes */}
              <div className="space-y-3.5">
                {/* 2x2 Financial Matrix Card */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="grid grid-cols-2 divide-x divide-slate-200/60 border-b border-slate-200/60 p-3.5 dark:divide-slate-800/60 dark:border-slate-800/60">
                    <div className="pr-3">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Statement
                      </span>
                      <p className="mt-1 font-mono text-sm font-black text-slate-900 dark:text-white">
                        ₹{(account.statement_amount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="pl-3">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Outstanding
                      </span>
                      <p className="mt-1 font-mono text-sm font-black text-slate-900 dark:text-white">
                        ₹{account.total_outstanding.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-slate-200/60 p-3.5 dark:divide-slate-800/60">
                    <div className="pr-3">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Minimum Due
                      </span>
                      <p className="mt-1 font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                        ₹{(account.minimum_due || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="pl-3">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Amount Paid
                      </span>
                      <p className="mt-1 font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                        ₹{(account.amount_paid || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Due Date Row */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2 font-medium text-slate-500">
                    <CalendarIcon className="size-4 text-slate-400" />
                    <span>Payment Due Date:</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {account.due_date
                      ? format(parseISO(account.due_date), "MMMM d, yyyy")
                      : "Not set"}
                  </span>
                </div>

                {/* Notes & Cycle Info (if present) */}
                {account.notes && (
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <FileTextIcon className="size-3" />
                      <span>Notes & Bill Cycle</span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {account.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:justify-between sm:px-6">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-xl px-3.5 text-xs font-bold"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 gap-1.5 rounded-xl px-3.5 text-xs font-bold"
                onClick={() => {
                  setOpen(false);
                  onEdit(account);
                }}
              >
                <PencilIcon className="size-3.5" />
                <span>Edit</span>
              </Button>
            </div>

            <Button
              type="button"
              className="h-9 gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:bg-emerald-500 active:scale-[0.98]"
              onClick={() => setPayOpen(true)}
            >
              <CheckCircle2Icon className="size-3.5" />
              <span>Record Payment</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <RecordPaymentDialog
        open={payOpen}
        setOpen={setPayOpen}
        account={account}
      />
    </>
  );
}
