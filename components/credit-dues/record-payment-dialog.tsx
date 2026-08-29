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
import { CreditDueItem, calculateRemainingDue } from "@/types/credit-due";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CheckCircle2, IndianRupee, Send, Sparkles } from "lucide-react";

interface RecordPaymentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  account: CreditDueItem | null;
}

export function RecordPaymentDialog({
  open,
  setOpen,
  account,
}: RecordPaymentDialogProps) {
  const { payCreditDue } = useCreditDuesStore();
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (account) {
      const remaining = calculateRemainingDue(account);
      setAmount(remaining > 0 ? String(remaining) : "0");
    } else {
      setAmount("");
    }
  }, [account, open]);

  if (!account) return null;

  const remainingDue = calculateRemainingDue(account);
  const minDue = account.minimum_due || 0;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await payCreditDue(account.id, num);
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setPreset = (val: number) => {
    setAmount(String(val));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-full sm:w-[min(calc(100vw-1.5rem),28rem)] sm:max-w-md max-h-[92dvh] overflow-y-auto rounded-t-3xl rounded-b-none sm:rounded-3xl border-slate-200/90 p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <form onSubmit={handlePay} className="flex flex-col">
          {/* Header */}
          <div className="border-b border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-transparent px-5 py-3.5 dark:border-emerald-950/60 dark:from-emerald-950/30 sm:px-6">
            <DialogHeader className="space-y-0.5 text-left">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
                  <CheckCircle2 className="size-4.5" />
                </span>
                <div>
                  <DialogTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                    Record Payment
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {account.name}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Form Body */}
          <div className="space-y-3 px-5 py-4 sm:px-6">
            {/* Quick Presets */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Payment Shortcut Presets
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {remainingDue > 0 && (
                  <button
                    type="button"
                    onClick={() => setPreset(account.statement_amount || account.total_outstanding)}
                    className="rounded-xl border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  >
                    Full Statement (₹{(account.statement_amount || account.total_outstanding).toLocaleString("en-IN")})
                  </button>
                )}
                {minDue > 0 && (
                  <button
                    type="button"
                    onClick={() => setPreset(minDue)}
                    className="rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  >
                    Min Due (₹{minDue.toLocaleString("en-IN")})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreset(0)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                >
                  Reset to ₹0
                </button>
              </div>
            </div>

            {/* Amount Paid Input */}
            <div className="space-y-1">
              <Label
                htmlFor="pay-amount"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Total Amount Paid (₹) <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans text-sm font-bold text-slate-400">
                  ₹
                </span>
                <Input
                  id="pay-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 bg-slate-50/70 pl-8 font-mono text-base font-bold shadow-2xs placeholder:text-slate-400 focus-visible:bg-white dark:border-slate-800 dark:bg-slate-900 dark:focus-visible:bg-slate-950"
                  autoFocus
                />
              </div>
            </div>

            {/* Current Summary Preview */}
            <div className="rounded-xl bg-slate-50/80 p-3 text-xs dark:bg-slate-900/60">
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Statement Amount:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ₹{(account.statement_amount || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Total Outstanding:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ₹{account.total_outstanding.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-1 text-emerald-700 dark:border-slate-800 dark:text-emerald-300">
                <span className="font-bold">New Remaining Due:</span>
                <span className="font-mono font-black">
                  ₹{Math.max(
                    0,
                    (account.statement_amount || account.total_outstanding) -
                      (parseFloat(amount) || 0),
                  ).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:justify-end sm:px-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9.5 w-full gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 sm:w-auto"
            >
              <Send className="size-3.5" />
              <span>{isSubmitting ? "Saving..." : "Save Payment"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
