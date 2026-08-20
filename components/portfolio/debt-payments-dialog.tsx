"use client";

import React, { useState } from "react";
import { usePortfolioStore, Debt, DebtPayment } from "@/hooks/use-portfolio-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, Trash2, Calendar, IndianRupee } from "lucide-react";
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
    } catch (error) {
      toast.error("Failed to delete payment log");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[480px]">
          <DialogHeader className="space-y-1 border-b border-border/40 px-5 py-4">
            <DialogTitle className="text-lg">{debt.name}</DialogTitle>
            <DialogDescription>Payment history</DialogDescription>
          </DialogHeader>

          <div className="mt-0 flex flex-1 flex-col overflow-hidden px-5 py-4">
            <ScrollArea className="h-[400px] pr-3">
              {(!debt.payments || debt.payments.length === 0) ? (
                <div className="rounded-2xl border border-dashed border-border/60 py-12 text-center text-muted-foreground">
                  <IndianRupee className="mx-auto mb-2 size-7 opacity-20" />
                  <p className="text-sm font-medium">No payments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {debt.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/40 px-3 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">
                            {format(parseISO(p.date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          {p.principalAmount > 0 && (
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">Principal</span>
                              <span className="font-semibold text-foreground">₹{p.principalAmount.toLocaleString()}</span>
                            </div>
                          )}
                          {p.interestAmount > 0 && (
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">Interest</span>
                              <span className="font-semibold text-emerald-600">₹{p.interestAmount.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        {p.note && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 italic">
                            &ldquo;{p.note}&rdquo;
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 sm:self-center self-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full text-muted-foreground"
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
                              className="size-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
            </ScrollArea>
          </div>

          <div className="mt-auto flex justify-between border-t border-border/40 px-5 py-4">
            <Button
              variant="outline"
              className="h-10 rounded-full"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
            <Button
              className="h-10 rounded-full px-5"
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
