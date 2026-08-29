"use client";

import React, { useState } from "react";
import {
  CreditDueItem,
  calculateRemainingDue,
  calculateUtilization,
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
} from "lucide-react";
import { format, parseISO, differenceInCalendarDays } from "date-fns";

interface CreditDuesTableViewProps {
  items: CreditDueItem[];
  onView: (item: CreditDueItem) => void;
  onEdit: (item: CreditDueItem) => void;
}

export function CreditDuesTableView({
  items,
  onView,
  onEdit,
}: CreditDuesTableViewProps) {
  const { selectedIds, toggleSelectId, removeCreditDue } = useCreditDuesStore();
  const [selectedPayAccount, setSelectedPayAccount] = useState<CreditDueItem | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
              <tr>
                <th className="w-10 px-3 py-3 text-center">
                  <span className="sr-only">Select</span>
                </th>
                <th className="px-3 py-3">Card / Account</th>
                <th className="px-3 py-3">Credit Limit</th>
                <th className="px-3 py-3">Outstanding</th>
                <th className="px-3 py-3">Remaining Due</th>
                <th className="px-3 py-3">Utilization</th>
                <th className="px-3 py-3">Payment Due Date</th>
                <th className="w-32 px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {items.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const remainingDue = calculateRemainingDue(item);
                const utilization = calculateUtilization(item);
                const health = getUtilizationHealth(utilization);
                const daysLeft = item.due_date
                  ? differenceInCalendarDays(parseISO(item.due_date), new Date())
                  : null;

                return (
                  <tr
                    key={item.id}
                    onClick={() => onView(item)}
                    className={cn(
                      "group cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
                      isSelected && "bg-rose-50/30 dark:bg-rose-950/20",
                    )}
                  >
                    {/* Checkbox */}
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-3 text-center"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectId(item.id)}
                        className="size-4 rounded border-slate-300 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                      />
                    </td>

                    {/* Name */}
                    <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-xs font-black text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          <CreditCard className="size-3.5" />
                        </div>
                        <span className="truncate font-bold max-w-[140px] sm:max-w-[180px]">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    {/* Credit Limit */}
                    <td className="px-3 py-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                      ₹{item.credit_limit.toLocaleString("en-IN")}
                    </td>

                    {/* Total Outstanding */}
                    <td className="px-3 py-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                      ₹{item.total_outstanding.toLocaleString("en-IN")}
                    </td>

                    {/* Remaining Due */}
                    <td className="px-3 py-3 font-mono font-bold text-rose-600 dark:text-rose-400">
                      ₹{remainingDue.toLocaleString("en-IN")}
                    </td>

                    {/* Utilization */}
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold",
                          health.bg,
                          health.color,
                        )}
                      >
                        {utilization.toFixed(0)}%
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="px-3 py-3">
                      {item.due_date ? (
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span>{format(parseISO(item.due_date), "MMM d, yyyy")}</span>
                          {daysLeft !== null && (
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.2 text-[10px] font-bold",
                                remainingDue === 0
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : daysLeft < 0
                                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                    : daysLeft <= 7
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                              )}
                            >
                              {remainingDue === 0
                                ? "Paid"
                                : daysLeft < 0
                                  ? "Overdue"
                                  : daysLeft === 0
                                    ? "Today"
                                    : `${daysLeft}d`}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-3 text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 gap-1 rounded-lg px-2 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                          onClick={() => setSelectedPayAccount(item)}
                        >
                          <CheckCircle2 className="size-3" />
                          <span>Pay</span>
                        </Button>

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
                          description="Are you sure you want to delete this credit account?"
                          onConfirm={async () => {
                            await removeCreditDue(item.id);
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

      <RecordPaymentDialog
        open={!!selectedPayAccount}
        setOpen={(o) => {
          if (!o) setSelectedPayAccount(null);
        }}
        account={selectedPayAccount}
      />
    </>
  );
}
