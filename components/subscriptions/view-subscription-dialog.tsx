"use client";

import React from "react";
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
  SubscriptionItem,
  calculateMonthlyEquivalent,
  calculateYearlyEquivalent,
} from "@/types/subscription";
import { useSubscriptionsStore } from "@/hooks/use-subscriptions-store";
import { cn } from "@/lib/utils";
import {
  CalendarSync,
  Calendar,
  CreditCard,
  Pencil,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  PauseCircle,
  XCircle,
} from "lucide-react";
import { format, parseISO, differenceInCalendarDays } from "date-fns";

interface ViewSubscriptionDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  subscription: SubscriptionItem | null;
  onEdit: (item: SubscriptionItem) => void;
}

export function ViewSubscriptionDialog({
  open,
  setOpen,
  subscription,
  onEdit,
}: ViewSubscriptionDialogProps) {
  const { changeStatus } = useSubscriptionsStore();

  if (!subscription) return null;

  const monthlyCost = calculateMonthlyEquivalent(
    subscription.amount,
    subscription.billing_frequency,
  );
  const yearlyCost = calculateYearlyEquivalent(
    subscription.amount,
    subscription.billing_frequency,
  );

  const daysLeft = differenceInCalendarDays(
    parseISO(subscription.next_payment_date),
    new Date(),
  );

  const getRenewalBadge = () => {
    if (subscription.status !== "active") {
      return (
        <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-bold capitalize text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          {subscription.status}
        </span>
      );
    }
    if (daysLeft < 0) {
      return (
        <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300">
          Overdue by {Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? "day" : "days"}
        </span>
      );
    }
    if (daysLeft === 0) {
      return (
        <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300">
          Due Today
        </span>
      );
    }
    if (daysLeft <= 7) {
      return (
        <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300">
          Renews in {daysLeft} {daysLeft === 1 ? "day" : "days"}
        </span>
      );
    }
    return (
      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
        Renews in {daysLeft} days
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[min(94dvh,46rem)] w-[min(calc(100vw-1.5rem),34rem)] max-w-lg overflow-y-auto rounded-2xl border-slate-200/90 p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:rounded-3xl">
        {/* Header */}
        <div className="relative border-b border-indigo-100 bg-gradient-to-b from-indigo-50/80 to-transparent px-5 py-3.5 dark:border-indigo-950/60 dark:from-indigo-950/30 sm:px-6">
          <DialogHeader className="space-y-0.5 text-left">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-base font-black text-white shadow-md shadow-indigo-600/25 ring-4 ring-indigo-100 dark:ring-indigo-950/50">
                {subscription.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                    {subscription.name}
                  </DialogTitle>
                  <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                    {subscription.category || "General"}
                  </span>
                </div>
                <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Subscription & recurring payment details
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="space-y-3 px-5 py-3.5 sm:px-6">
          {/* Main Cost Card */}
          <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/50 to-white p-4 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Billed Amount ({subscription.billing_frequency})
                </span>
                <p className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                  ₹{subscription.amount.toLocaleString("en-IN")}
                  <span className="text-xs font-semibold text-slate-400">
                    /{subscription.billing_frequency}
                  </span>
                </p>
              </div>
              <div>{getRenewalBadge()}</div>
            </div>

            {/* Equivalent Cost Breakdown */}
            <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-indigo-100/80 pt-3 dark:border-indigo-900/40">
              <div className="rounded-xl bg-white/80 p-2.5 dark:bg-slate-900/80">
                <span className="block text-[10px] font-bold uppercase text-slate-400">
                  Monthly Cost
                </span>
                <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                  ₹{monthlyCost.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                  <span className="text-[10px] font-normal text-slate-400">/mo</span>
                </span>
              </div>
              <div className="rounded-xl bg-white/80 p-2.5 dark:bg-slate-900/80">
                <span className="block text-[10px] font-bold uppercase text-slate-400">
                  Yearly Projection
                </span>
                <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                  ₹{yearlyCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  <span className="text-[10px] font-normal text-slate-400">/yr</span>
                </span>
              </div>
            </div>
          </div>

          {/* Details Rows */}
          <div className="space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
            {/* Next Payment Date */}
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-500">
                <Calendar className="size-3.5 text-slate-400" />
                Next Payment Date
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {format(parseISO(subscription.next_payment_date), "MMMM d, yyyy")}
              </span>
            </div>

            {/* Payment Method */}
            {subscription.payment_method && (
              <div className="flex items-center justify-between border-t border-slate-200/50 pt-2 text-xs dark:border-slate-800/60">
                <span className="flex items-center gap-1.5 font-medium text-slate-500">
                  <CreditCard className="size-3.5 text-slate-400" />
                  Payment Method
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {subscription.payment_method}
                </span>
              </div>
            )}

            {/* Category */}
            <div className="flex items-center justify-between border-t border-slate-200/50 pt-2 text-xs dark:border-slate-800/60">
              <span className="flex items-center gap-1.5 font-medium text-slate-500">
                <Sparkles className="size-3.5 text-slate-400" />
                Category
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {subscription.category || "General"}
              </span>
            </div>
          </div>

          {/* Notes */}
          {subscription.notes && (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <FileText className="size-3" />
                <span>Notes & Plan Details</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300">
                {subscription.notes}
              </p>
            </div>
          )}

          {/* Status Quick Switcher */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quick Status Switch
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => changeStatus(subscription.id, "active")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl border py-1.5 text-xs font-bold transition-all",
                  subscription.status === "active"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
                )}
              >
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Active</span>
              </button>

              <button
                type="button"
                onClick={() => changeStatus(subscription.id, "paused")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl border py-1.5 text-xs font-bold transition-all",
                  subscription.status === "paused"
                    ? "border-amber-500 bg-amber-50 text-amber-800 shadow-2xs dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
                )}
              >
                <PauseCircle className="size-3.5 text-amber-600" />
                <span>Pause</span>
              </button>

              <button
                type="button"
                onClick={() => changeStatus(subscription.id, "cancelled")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl border py-1.5 text-xs font-bold transition-all",
                  subscription.status === "cancelled"
                    ? "border-rose-500 bg-rose-50 text-rose-800 shadow-2xs dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
                )}
              >
                <XCircle className="size-3.5 text-rose-600" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:justify-between sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-xl text-xs font-bold"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            className="h-9 gap-1.5 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500"
            onClick={() => {
              setOpen(false);
              onEdit(subscription);
            }}
          >
            <Pencil className="size-3.5" />
            <span>Edit Subscription</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
