"use client";

import React, { useState } from "react";
import {
  CreditDueItem,
  calculateRemainingDue,
  calculateUtilization,
  calculateAvailableCredit,
  getUtilizationHealth,
} from "@/types/credit-due";
import { useCreditDuesStore } from "@/hooks/use-credit-dues-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Calendar,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  IndianRupee,
} from "lucide-react";
import { format, parseISO, differenceInCalendarDays } from "date-fns";

interface CreditDueCardProps {
  item: CreditDueItem;
  onView: (item: CreditDueItem) => void;
  onEdit: (item: CreditDueItem) => void;
}

export function CreditDueCard({ item, onView, onEdit }: CreditDueCardProps) {
  const { selectedIds, toggleSelectId, removeCreditDue } = useCreditDuesStore();
  const [payOpen, setPayOpen] = useState(false);
  const isSelected = selectedIds.includes(item.id);

  const remainingDue = calculateRemainingDue(item);
  const utilization = calculateUtilization(item);
  const availableCredit = calculateAvailableCredit(item);
  const health = getUtilizationHealth(utilization);

  const daysLeft = item.due_date
    ? differenceInCalendarDays(parseISO(item.due_date), new Date())
    : null;

  return (
    <>
      <div
        onClick={() => onView(item)}
        className={cn(
          "group relative flex cursor-pointer flex-col justify-between rounded-2xl border bg-white p-5 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-md dark:bg-slate-900/90 dark:hover:border-slate-700",
          isSelected
            ? "border-rose-500 bg-rose-50/20 ring-2 ring-rose-500/20 dark:border-rose-500 dark:bg-rose-950/20"
            : "border-slate-200/80 dark:border-slate-800",
        )}
      >
        <div>
          {/* Top Row: Checkbox + Card Name + Due Date Badge + Actions */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center"
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleSelectId(item.id)}
                  className="size-4.5 rounded-md border-slate-300 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                />
              </div>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/15 to-rose-600/10 text-sm font-black text-rose-700 shadow-2xs dark:from-rose-500/25 dark:to-rose-600/20 dark:text-rose-300">
                <CreditCard className="size-4.5" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors dark:text-white dark:group-hover:text-rose-400">
                  {item.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[10px] text-slate-400">
                  <span>Limit: ₹{item.credit_limit.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-700 dark:hover:text-white transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                title="Edit Account"
              >
                <Pencil className="size-3.5" />
              </Button>

              <div onClick={(e) => e.stopPropagation()}>
                <ConfirmDialog
                  title={`Delete ${item.name}`}
                  description="Are you sure you want to delete this credit account? This action cannot be undone."
                  onConfirm={async () => {
                    await removeCreditDue(item.id);
                  }}
                  variant="destructive"
                  confirmText="Delete"
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 transition-opacity"
                      title="Delete Account"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  }
                />
              </div>
            </div>
          </div>

          {/* Dues & Balance Box */}
          <div className="mt-3 rounded-xl bg-slate-50/70 p-2.5 dark:bg-slate-950/50">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-400">
                  Remaining Due
                </span>
                <span className="font-mono text-lg font-black text-rose-600 dark:text-rose-400">
                  ₹{remainingDue.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="text-right">
                <span className="block text-[10px] font-bold uppercase text-slate-400">
                  Total Outstanding
                </span>
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  ₹{item.total_outstanding.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Utilization Bar */}
            {item.credit_limit > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-medium">
                  <span className="text-slate-400">
                    Avail: ₹{availableCredit.toLocaleString("en-IN")}
                  </span>
                  <span className={cn("font-bold", health.color)}>
                    {utilization.toFixed(0)}% Utilized
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={cn("h-full rounded-full transition-all", health.barColor)}
                    style={{ width: `${Math.min(100, utilization)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Due Date Urgency + Quick Pay Button */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
            <Calendar className="size-3 text-slate-400" />
            <span className="text-slate-500">
              {item.due_date ? format(parseISO(item.due_date), "MMM d") : "No due date"}
            </span>
            {item.due_date && daysLeft !== null && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.2 font-mono text-[10px] font-bold",
                  remainingDue === 0
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : daysLeft < 0
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      : daysLeft === 0
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        : daysLeft <= 7
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                )}
              >
                {remainingDue === 0
                  ? "Paid"
                  : daysLeft < 0
                    ? "Overdue"
                    : daysLeft === 0
                      ? "Today"
                      : `${daysLeft}d left`}
              </span>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 rounded-lg px-2 text-[11px] font-bold hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50"
            onClick={(e) => {
              e.stopPropagation();
              setPayOpen(true);
            }}
          >
            <CheckCircle2 className="size-3 text-emerald-600" />
            <span>Pay / Settle</span>
          </Button>
        </div>
      </div>

      <RecordPaymentDialog
        open={payOpen}
        setOpen={setPayOpen}
        account={item}
      />
    </>
  );
}
