"use client";

import React from "react";
import {
  SubscriptionItem,
  calculateMonthlyEquivalent,
} from "@/types/subscription";
import { useSubscriptionsStore } from "@/hooks/use-subscriptions-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import {
  Pencil,
  Trash2,
  Calendar,
  CreditCard,
  Sparkles,
  Clock,
  CheckCircle2,
  PauseCircle,
  XCircle,
} from "lucide-react";
import { format, parseISO, differenceInCalendarDays } from "date-fns";

interface SubscriptionCardProps {
  item: SubscriptionItem;
  onView: (item: SubscriptionItem) => void;
  onEdit: (item: SubscriptionItem) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
  "Work & Software": "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
  Utilities: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  "Health & Fitness": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  Education: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  "Finance & Insurance": "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800",
  "Shopping & Delivery": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
  Personal: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800",
  Other: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800",
};

export function SubscriptionCard({
  item,
  onView,
  onEdit,
}: SubscriptionCardProps) {
  const { selectedIds, toggleSelectId, removeSubscription } =
    useSubscriptionsStore();
  const isSelected = selectedIds.includes(item.id);

  const monthlyCost = calculateMonthlyEquivalent(
    item.amount,
    item.billing_frequency,
  );
  const daysLeft = differenceInCalendarDays(
    parseISO(item.next_payment_date),
    new Date(),
  );

  const catStyle =
    CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;

  return (
    <div
      onClick={() => onView(item)}
      className={cn(
        "group relative flex cursor-pointer flex-col justify-between rounded-2xl border bg-white p-4 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-md dark:bg-slate-900/90 dark:hover:border-slate-700",
        isSelected
          ? "border-indigo-500 bg-indigo-50/20 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/20"
          : "border-slate-200/80 dark:border-slate-800",
        item.status === "cancelled" && "opacity-60",
      )}
    >
      <div>
        {/* Top Row: Checkbox + Name + Status + Category */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleSelectId(item.id)}
                className="size-4.5 rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
              />
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-indigo-600/10 text-sm font-black text-indigo-700 shadow-2xs dark:from-indigo-500/25 dark:to-indigo-600/20 dark:text-indigo-300">
              {item.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors dark:text-white dark:group-hover:text-indigo-400">
                {item.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    "rounded-md border px-1.5 py-0.2 text-[9px] font-bold uppercase",
                    catStyle,
                  )}
                >
                  {item.category || "General"}
                </span>
                {item.status !== "active" && (
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.2 text-[9px] font-bold uppercase",
                      item.status === "paused"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
                    )}
                  >
                    {item.status}
                  </span>
                )}
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
              title="Edit Subscription"
            >
              <Pencil className="size-3.5" />
            </Button>

            <div onClick={(e) => e.stopPropagation()}>
              <ConfirmDialog
                title={`Delete ${item.name}`}
                description="Are you sure you want to delete this subscription? This action cannot be undone."
                onConfirm={async () => {
                  await removeSubscription(item.id);
                }}
                variant="destructive"
                confirmText="Delete"
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 transition-opacity"
                    title="Delete Subscription"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                }
              />
            </div>
          </div>
        </div>

        {/* Pricing Card Section */}
        <div className="mt-3 flex items-baseline justify-between rounded-xl bg-slate-50/70 p-2.5 dark:bg-slate-950/50">
          <div>
            <span className="block text-[10px] font-bold uppercase text-slate-400">
              Billed Amount
            </span>
            <span className="font-mono text-base font-black text-slate-900 dark:text-white">
              ₹{item.amount.toLocaleString("en-IN")}
              <span className="text-xs font-medium text-slate-400">
                /{item.billing_frequency === "monthly" ? "mo" : item.billing_frequency === "yearly" ? "yr" : item.billing_frequency === "quarterly" ? "qtr" : "wk"}
              </span>
            </span>
          </div>

          <div className="text-right">
            <span className="block text-[10px] font-bold uppercase text-slate-400">
              Monthly Equiv.
            </span>
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              ₹{monthlyCost.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
              <span className="text-[10px] font-normal text-slate-400">/mo</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Renewal Countdown + Payment Method */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs dark:border-slate-800/60">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold">
          <Calendar className="size-3 text-slate-400" />
          <span className="text-slate-500">
            {format(parseISO(item.next_payment_date), "MMM d")}
          </span>
          {item.status === "active" && (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.2 font-mono text-[10px] font-bold",
                daysLeft < 0
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                  : daysLeft === 0
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    : daysLeft <= 7
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
              )}
            >
              {daysLeft < 0
                ? "Overdue"
                : daysLeft === 0
                  ? "Today"
                  : `${daysLeft}d left`}
            </span>
          )}
        </div>

        {item.payment_method && (
          <span className="truncate max-w-[120px] text-[11px] text-slate-400">
            {item.payment_method}
          </span>
        )}
      </div>
    </div>
  );
}
