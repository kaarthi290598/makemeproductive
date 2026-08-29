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
import { useSubscriptionsStore } from "@/hooks/use-subscriptions-store";
import {
  SubscriptionItem,
  BillingFrequency,
  SubscriptionStatus,
  SUBSCRIPTION_CATEGORIES,
  BILLING_FREQUENCIES,
  PAYMENT_METHODS,
  calculateMonthlyEquivalent,
  calculateYearlyEquivalent,
} from "@/types/subscription";
import { toast } from "sonner";
import { CustomDatePicker } from "@/components/customDatePicker";
import { cn, formatDateToLocalISO, parseLocalISODate } from "@/lib/utils";
import {
  CalendarSync,
  CreditCard,
  Calendar,
  Check,
  Send,
  Sparkles,
  FileText,
  IndianRupee,
} from "lucide-react";
import { addMonths } from "date-fns";

interface AddEditSubscriptionDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  subscriptionToEdit?: SubscriptionItem | null;
}

const dialogShellClass =
  "w-full max-w-full sm:w-[min(calc(100vw-1.5rem),34rem)] sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl rounded-b-none sm:rounded-3xl border-slate-200/90 p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-950";

const inputClass =
  "h-10 sm:h-9 rounded-xl border-slate-200 bg-slate-50/70 text-sm sm:text-xs shadow-2xs placeholder:text-slate-400 focus-visible:bg-white dark:border-slate-800 dark:bg-slate-900 dark:focus-visible:bg-slate-950";

export function AddEditSubscriptionDialog({
  open,
  setOpen,
  subscriptionToEdit,
}: AddEditSubscriptionDialogProps) {
  const { addSubscription, editSubscription } = useSubscriptionsStore();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<BillingFrequency>("monthly");
  const [date, setDate] = useState<Date | undefined>(addMonths(new Date(), 1));
  const [category, setCategory] = useState<string>("Entertainment");
  const [paymentMethod, setPaymentMethod] = useState<string>("Credit Card");
  const [status, setStatus] = useState<SubscriptionStatus>("active");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subscriptionToEdit) {
      setName(subscriptionToEdit.name);
      setAmount(String(subscriptionToEdit.amount));
      setFrequency(subscriptionToEdit.billing_frequency);
      setDate(
        subscriptionToEdit.next_payment_date
          ? parseLocalISODate(subscriptionToEdit.next_payment_date)
          : addMonths(new Date(), 1),
      );
      setCategory(subscriptionToEdit.category || "Entertainment");
      setPaymentMethod(subscriptionToEdit.payment_method || "Credit Card");
      setStatus(subscriptionToEdit.status || "active");
      setNotes(subscriptionToEdit.notes || "");
    } else {
      setName("");
      setAmount("");
      setFrequency("monthly");
      setDate(addMonths(new Date(), 1));
      setCategory("Entertainment");
      setPaymentMethod("Credit Card");
      setStatus("active");
      setNotes("");
    }
  }, [subscriptionToEdit, open]);

  const numAmount = parseFloat(amount) || 0;
  const monthlyCost = calculateMonthlyEquivalent(numAmount, frequency);
  const yearlyCost = calculateYearlyEquivalent(numAmount, frequency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a subscription name");
      return;
    }
    if (!numAmount || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!date) {
      toast.error("Please select the next payment date");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        amount: numAmount,
        billing_frequency: frequency,
        next_payment_date: formatDateToLocalISO(date),
        category,
        payment_method: paymentMethod || null,
        status,
        notes: notes.trim() || null,
      };

      if (subscriptionToEdit) {
        await editSubscription(subscriptionToEdit.id, payload);
      } else {
        await addSubscription(payload);
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
          {/* Header */}
          <div className="relative border-b border-indigo-100 bg-gradient-to-b from-indigo-50/80 to-transparent px-5 py-3.5 dark:border-indigo-950/60 dark:from-indigo-950/30 sm:px-6">
            <DialogHeader className="space-y-0.5 text-left">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-4 ring-indigo-100 dark:ring-indigo-950/50">
                  <CalendarSync className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                    {subscriptionToEdit
                      ? "Edit Subscription"
                      : "Add New Subscription"}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Track recurring services, renewal dates & equivalent costs.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Form Body */}
          <div className="space-y-3 px-5 py-3.5 sm:px-6">
            {/* Name */}
            <div className="space-y-1">
              <Label
                htmlFor="sub-name"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Subscription Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="sub-name"
                placeholder="e.g. Netflix, Spotify, ChatGPT Plus, Notion, Gym"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                autoFocus
              />
            </div>

            {/* Amount & Frequency */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="space-y-1">
                <Label
                  htmlFor="sub-amount"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Amount (₹) <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <Input
                    id="sub-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 649"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={cn(inputClass, "pl-7 font-mono font-bold")}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Billing Cycle
                </Label>
                <div className="grid grid-cols-4 gap-1">
                  {BILLING_FREQUENCIES.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFrequency(f.value)}
                      className={cn(
                        "rounded-xl border py-1.5 text-center text-[11px] font-bold transition-all",
                        frequency === f.value
                          ? "border-indigo-500 bg-indigo-50 text-indigo-900 shadow-2xs ring-1 ring-indigo-500 dark:border-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-200"
                          : "border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Equivalent Cost Calculator Preview */}
            {numAmount > 0 && (
              <div className="flex items-center justify-between rounded-xl border border-indigo-100/80 bg-indigo-50/40 px-3 py-2 text-xs dark:border-indigo-950/50 dark:bg-indigo-950/20">
                <span className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-300">
                  <Sparkles className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                  Equivalent Cost:
                </span>
                <div className="flex items-center gap-3 font-mono font-bold text-slate-900 dark:text-white">
                  <span>
                    ₹{monthlyCost.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                    <span className="text-[10px] font-normal text-slate-500">
                      /mo
                    </span>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span>
                    ₹{yearlyCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    <span className="text-[10px] font-normal text-slate-500">
                      /yr
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Next Payment Date & Payment Method */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Calendar className="size-3.5 text-slate-400" />
                  Next Payment Date <span className="text-rose-500">*</span>
                </Label>
                <CustomDatePicker
                  value={date}
                  onChange={setDate}
                  className="h-9 w-full rounded-xl border-slate-200 bg-slate-50/70 font-mono text-xs font-semibold shadow-2xs hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="sub-payment-method"
                  className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <CreditCard className="size-3 text-slate-400" />
                  Payment Method
                </Label>
                <select
                  id="sub-payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={cn(
                    inputClass,
                    "w-full px-2.5 font-medium text-xs bg-white dark:bg-slate-900",
                  )}
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Category
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {SUBSCRIPTION_CATEGORIES.map((cat) => {
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-bold transition-all",
                        active
                          ? "border-indigo-400 bg-indigo-50 text-indigo-900 shadow-sm ring-1 ring-indigo-400 dark:border-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-200"
                          : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                      )}
                    >
                      <span>{cat}</span>
                      {active && <Check className="size-3 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Selector */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Subscription Status
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "active", label: "Active", color: "text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300" },
                  { value: "paused", label: "Paused", color: "text-amber-700 border-amber-300 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300" },
                  { value: "cancelled", label: "Cancelled", color: "text-rose-700 border-rose-300 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300" },
                ].map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(s.value as SubscriptionStatus)}
                    className={cn(
                      "rounded-xl border py-1.5 text-center text-xs font-bold transition-all",
                      status === s.value
                        ? cn(s.color, "shadow-2xs ring-1 ring-current")
                        : "border-slate-200 bg-slate-50/70 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label
                htmlFor="sub-notes"
                className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <FileText className="size-3.5 text-slate-400" />
                Notes & Plan Details
              </Label>
              <Input
                id="sub-notes"
                placeholder="Optional login email, plan name (e.g. 4K Family), or billing reminders"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:justify-end sm:px-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9.5 w-full gap-2 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 sm:w-auto sm:min-w-[140px]"
            >
              <Send className="size-3.5" />
              <span>
                {isSubmitting
                  ? "Saving..."
                  : subscriptionToEdit
                    ? "Update Subscription"
                    : "Save Subscription"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
