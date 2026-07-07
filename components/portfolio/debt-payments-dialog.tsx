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
  const { deleteDebtPayment } = usePortfolioStore();
  const [editPayment, setEditPayment] = useState<DebtPayment | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        <DialogContent className="sm:max-w-[500px] rounded-xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Payment History - {debt.name}</DialogTitle>
            <DialogDescription>
              View and manage all logged payments for this liability.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col mt-2">
            <ScrollArea className="h-[400px] pr-4">
              {(!debt.payments || debt.payments.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed rounded-lg">
                  <IndianRupee className="size-8 mb-2 opacity-20" />
                  <p className="text-sm font-medium">No payments logged yet.</p>
                  <p className="text-xs mt-1">Payments you log will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {debt.payments.map((p) => (
                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-card shadow-sm gap-3">
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
                          className="size-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
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
                              className="size-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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

          <div className="pt-4 border-t mt-auto flex justify-between">
            <Button
              variant="outline"
              className="text-xs font-semibold rounded-lg"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
            <Button
              className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              onClick={() => {
                setEditPayment(null);
                setEditOpen(true);
              }}
            >
              Log New Payment
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
