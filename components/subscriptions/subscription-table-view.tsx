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
} from "lucide-react";
import { format, parseISO, differenceInCalendarDays } from "date-fns";

interface SubscriptionTableViewProps {
  items: SubscriptionItem[];
  onView: (item: SubscriptionItem) => void;
  onEdit: (item: SubscriptionItem) => void;
}

export function SubscriptionTableView({
  items,
  onView,
  onEdit,
}: SubscriptionTableViewProps) {
  const { selectedIds, toggleSelectId, removeSubscription } =
    useSubscriptionsStore();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
            <tr>
              <th className="w-10 px-3 py-3 text-center">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-3 py-3">Subscription</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Billed Cost</th>
              <th className="px-3 py-3">Monthly Equiv.</th>
              <th className="px-3 py-3">Next Renewal</th>
              <th className="px-3 py-3">Payment Method</th>
              <th className="w-24 px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const monthlyCost = calculateMonthlyEquivalent(
                item.amount,
                item.billing_frequency,
              );
              const daysLeft = differenceInCalendarDays(
                parseISO(item.next_payment_date),
                new Date(),
              );

              return (
                <tr
                  key={item.id}
                  onClick={() => onView(item)}
                  className={cn(
                    "group cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
                    isSelected && "bg-indigo-50/30 dark:bg-indigo-950/20",
                    item.status === "cancelled" && "opacity-60",
                  )}
                >
                  {/* Select Checkbox */}
                  <td
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-3 text-center"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectId(item.id)}
                      className="size-4 rounded border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                  </td>

                  {/* Name */}
                  <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate font-bold max-w-[140px] sm:max-w-[180px]">
                        {item.name}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-3 py-3">
                    <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                      {item.category || "General"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
                        item.status === "active"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : item.status === "paused"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
                      )}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Billed Cost */}
                  <td className="px-3 py-3 font-mono font-bold text-slate-900 dark:text-white">
                    ₹{item.amount.toLocaleString("en-IN")}
                    <span className="text-[10px] font-normal text-slate-500">
                      /{item.billing_frequency}
                    </span>
                  </td>

                  {/* Monthly Equivalent */}
                  <td className="px-3 py-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    ₹{monthlyCost.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                    <span className="text-[10px] font-normal text-slate-400">
                      /mo
                    </span>
                  </td>

                  {/* Next Renewal */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span>
                        {format(parseISO(item.next_payment_date), "MMM d, yyyy")}
                      </span>
                      {item.status === "active" && (
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.2 text-[10px] font-bold",
                            daysLeft < 0
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                              : daysLeft <= 7
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                          )}
                        >
                          {daysLeft < 0
                            ? "Overdue"
                            : daysLeft === 0
                              ? "Today"
                              : `${daysLeft}d`}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Payment Method */}
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
                    {item.payment_method || "—"}
                  </td>

                  {/* Actions */}
                  <td
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-3 text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        onClick={() => onEdit(item)}
                        title="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <ConfirmDialog
                        title={`Delete ${item.name}`}
                        description="Are you sure you want to delete this subscription?"
                        onConfirm={async () => {
                          await removeSubscription(item.id);
                        }}
                        variant="destructive"
                        confirmText="Delete"
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        }
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
