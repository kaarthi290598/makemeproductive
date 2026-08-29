"use client";

import React, { useState } from "react";
import { usePortfolioStore, Debt, DebtPayment } from "@/hooks/use-portfolio-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Calendar, IndianRupee, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { AddEditDebtPaymentDialog } from "./add-edit-dialogs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

interface DebtPaymentsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  debt: Debt | null;
}

export function DebtPaymentsDialog({ open, setOpen, debt }: DebtPaymentsDialogProps) {
  const deleteDebtPayment = usePortfolioStore((s) => s.deleteDebtPayment);
  const loadDebtPayments = usePortfolioStore((s) => s.loadDebtPayments);
  const [editPayment, setEditPayment] = useState<DebtPayment | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  React.useEffect(() => {
    if (open && debt?.id) {
      void loadDebtPayments(debt.id);
    }
  }, [open, debt?.id, loadDebtPayments]);

  if (!debt) return null;

  const handleDelete = async (paymentId: string) => {
    setDeletingId(paymentId);
    try {
      await deleteDebtPayment(debt.id, paymentId);
      toast.success("Payment log deleted successfully");
    } catch {
      toast.error("Failed to delete payment log");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-full sm:w-[min(calc(100vw-1.5rem),34rem)] sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl rounded-b-none sm:rounded-3xl border-slate-200/90 p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <div className="relative border-b border-rose-100 bg-gradient-to-b from-rose-50/80 to-transparent px-5 py-3.5 dark:border-rose-950/60 dark:from-rose-950/30 sm:px-6">
            <DialogHeader className="space-y-0.5 text-left">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/25 ring-4 ring-rose-100 dark:ring-rose-950/50">
                  <IndianRupee className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                    {debt.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Payment history & transaction logs
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="space-y-3 px-5 py-3.5 sm:px-6">
            {!debt.payments || debt.payments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-500 dark:border-slate-800">
                <IndianRupee className="mx-auto mb-2 size-7 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No payments yet
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Log your first EMI or principal payment below.
                </p>
              </div>
            ) : (
              <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
                {debt.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900/70"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {format(parseISO(p.date), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {p.principalAmount > 0 && (
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Principal
                            </span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              ₹{p.principalAmount.toLocaleString("en-IN")}
                            </span>
                          </div>
                        )}
                        {p.interestAmount > 0 && (
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Interest
                            </span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{p.interestAmount.toLocaleString("en-IN")}
                            </span>
                          </div>
                        )}
                      </div>
                      {p.note && (
                        <p className="mt-1 line-clamp-1 text-xs italic text-slate-500 dark:text-slate-400">
                          &ldquo;{p.note}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        onClick={() => {
                          setEditPayment(p);
                          setEditOpen(true);
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <ConfirmDialog
                        title="Delete Payment Log"
                        description="Are you sure you want to delete this payment? This will revert the principal and interest balances on your loan."
                        onConfirm={() => handleDelete(p.id)}
                        loading={deletingId === p.id}
                        variant="destructive"
                        confirmText="Delete"
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                            disabled={deletingId === p.id}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:flex sm:justify-end sm:px-6">
            <Button
              className="h-9.5 w-full gap-1.5 rounded-xl bg-rose-600 px-5 text-xs font-bold text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500 sm:w-auto"
              onClick={() => {
                setEditPayment(null);
                setEditOpen(true);
              }}
            >
              <Plus className="size-3.5" />
              Log payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddEditDebtPaymentDialog
        open={editOpen}
        setOpen={setEditOpen}
        debt={debt}
        paymentToEdit={editPayment}
      />
    </>
  );
}

