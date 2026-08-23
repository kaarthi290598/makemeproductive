"use client";

import React, { useState } from "react";
import { usePortfolioStore, Debt, DebtPayment } from "@/hooks/use-portfolio-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Calendar, IndianRupee } from "lucide-react";
import { format, parseISO } from "date-fns";
import { AddEditDebtPaymentDialog } from "./add-edit-dialogs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { consoleDialogClass } from "@/components/finance/page-header";

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
    } catch (error) {
      toast.error("Failed to delete payment log");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={consoleDialogClass}>
          <DialogHeader className="space-y-1 border-b border-slate-100 px-5 py-4 pr-12 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white">
                <IndianRupee className="size-4" />
              </span>
              <div className="min-w-0 text-left">
                <DialogTitle className="text-base font-semibold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                  {debt.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Payment history
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-2 px-4 py-3 sm:px-5 sm:py-3.5">
            {(!debt.payments || debt.payments.length === 0) ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-slate-500 dark:border-slate-800">
                  <IndianRupee className="mx-auto mb-2 size-7 text-slate-300" />
                  <p className="text-sm font-semibold">No payments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {debt.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-800">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="size-3.5 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            {format(parseISO(p.date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          {p.principalAmount > 0 && (
                            <div>
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Principal</span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">₹{p.principalAmount.toLocaleString()}</span>
                            </div>
                          )}
                          {p.interestAmount > 0 && (
                            <div>
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Interest</span>
                              <span className="font-mono font-bold text-emerald-600">₹{p.interestAmount.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        {p.note && (
                          <p className="mt-1.5 line-clamp-1 text-xs italic text-slate-500">
                            &ldquo;{p.note}&rdquo;
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 sm:self-center self-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-slate-400 hover:text-slate-700"
                          onClick={() => {
                            setEditPayment(p);
                            setEditOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
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
                              className="size-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              disabled={deletingId === p.id}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          <div className="mt-auto flex justify-end border-t border-slate-100 px-5 py-4 dark:border-slate-800">
            <Button
              className="h-11 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500"
              onClick={() => {
                setEditPayment(null);
                setEditOpen(true);
              }}
            >
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
