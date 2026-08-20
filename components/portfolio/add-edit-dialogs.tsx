"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { usePortfolioStore, Investment, Debt, InvestmentContribution, DebtPayment } from "@/hooks/use-portfolio-store";
import { toast } from "sonner";

interface InvestmentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  investmentToEdit?: Investment | null;
}

export function AddEditInvestmentDialog({
  open,
  setOpen,
  investmentToEdit,
}: InvestmentDialogProps) {
  const { addInvestment, updateInvestmentName } = usePortfolioStore();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Investment["category"]>("Stocks");
  const [investedAmount, setInvestedAmount] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  useEffect(() => {
    if (investmentToEdit) {
      setName(investmentToEdit.name);
      setCategory(investmentToEdit.category);
      setNote(investmentToEdit.note || "");
    } else {
      setName("");
      setCategory("Stocks");
      setInvestedAmount("");
      setCurrentValue("");
      setDate(new Date().toISOString().slice(0, 10));
      setNote("");
    }
  }, [investmentToEdit, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    if (investmentToEdit) {
      updateInvestmentName(investmentToEdit.id, name, category, note.trim() || undefined);
      toast.success("Asset details updated successfully!");
      setOpen(false);
    } else {
      const investedVal = parseFloat(investedAmount);
      const currentVal = parseFloat(currentValue);

      if (isNaN(investedVal) || investedVal <= 0) {
        toast.error("Please enter a valid initial invested amount");
        return;
      }

      if (isNaN(currentVal) || currentVal < 0) {
        toast.error("Please enter a valid initial current value");
        return;
      }

      addInvestment(
        { name, category, note: note.trim() || undefined },
        investedVal,
        currentVal,
        date,
        "Initial Purchase"
      );
      toast.success("Investment added successfully!");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[420px]">
        <DialogHeader className="space-y-1 border-b border-border/40 px-5 py-4">
          <DialogTitle className="text-lg">
            {investmentToEdit ? "Edit asset" : "Add asset"}
          </DialogTitle>
          <DialogDescription>
            {investmentToEdit
              ? "Update name, category, and notes."
              : "Name it and log the first purchase."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-5 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="inv-name">Name</Label>
              <Input
                id="inv-name"
                placeholder="e.g. Nifty 50 ETF"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-xl"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inv-category">Category</Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as Investment["category"])}
              >
                <SelectTrigger id="inv-category" className="h-10 rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Stocks">Stocks</SelectItem>
                  <SelectItem value="Mutual Funds">Mutual Funds</SelectItem>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                  <SelectItem value="Real Estate">Real Estate</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!investmentToEdit && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-invested">Invested (₹)</Label>
                  <Input
                    id="inv-invested"
                    type="number"
                    placeholder="0"
                    value={investedAmount}
                    onChange={(e) => {
                      const next = e.target.value;
                      setInvestedAmount(next);
                      if (!currentValue || currentValue === investedAmount) {
                        setCurrentValue(next);
                      }
                    }}
                    className="h-11 rounded-xl text-lg font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-current">Current value (₹)</Label>
                  <Input
                    id="inv-current"
                    type="number"
                    placeholder="Same as invested if new"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-date">Date</Label>
                  <Input
                    id="inv-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="inv-note">Note</Label>
              <Input
                id="inv-note"
                placeholder="Optional"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-border/40 px-5 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-10 rounded-full"
            >
              Cancel
            </Button>
            <Button type="submit" className="h-10 rounded-full px-5">
              {investmentToEdit ? "Save" : "Add asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AddContributionDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  investment: Investment | null;
  contributionToEdit?: InvestmentContribution | null;
}

export function AddEditContributionDialog({
  open,
  setOpen,
  investment,
  contributionToEdit,
}: AddContributionDialogProps) {
  const { addContribution, updateContribution } = usePortfolioStore();
  const [amount, setAmount] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  useEffect(() => {
    if (contributionToEdit) {
      setAmount(contributionToEdit.amount.toString());
      setCurrentValue(contributionToEdit.currentValue.toString());
      setDate(contributionToEdit.date);
      setNote(contributionToEdit.note || "");
    } else {
      setAmount("");
      setCurrentValue("");
      setDate(new Date().toISOString().slice(0, 10));
      setNote("");
    }
  }, [contributionToEdit, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!investment) return;

    const amtVal = parseFloat(amount);
    const currVal = parseFloat(currentValue);

    if (isNaN(amtVal) || amtVal <= 0) {
      toast.error("Please enter a valid invested amount");
      return;
    }

    if (isNaN(currVal) || currVal < 0) {
      toast.error("Please enter a valid current value");
      return;
    }

    const payload = {
      amount: amtVal,
      currentValue: currVal,
      date,
      note: note.trim() || undefined,
    };

    if (contributionToEdit) {
      updateContribution(investment.id, contributionToEdit.id, payload);
      toast.success("Transaction log updated successfully!");
    } else {
      addContribution(investment.id, payload);
      toast.success("New contribution logged successfully!");
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[400px]">
        <DialogHeader className="space-y-1 border-b border-border/40 px-5 py-4">
          <DialogTitle className="text-lg">
            {contributionToEdit ? "Edit contribution" : "Log purchase"}
          </DialogTitle>
          <DialogDescription>
            {contributionToEdit
              ? "Update this batch."
              : `Add a purchase or SIP to ${investment?.name}.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-5 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="c-amount">Invested (₹)</Label>
              <Input
                id="c-amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  const next = e.target.value;
                  setAmount(next);
                  if (!currentValue || currentValue === amount) {
                    setCurrentValue(next);
                  }
                }}
                className="h-11 rounded-xl text-lg font-semibold"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-current">Current value (₹)</Label>
              <Input
                id="c-current"
                type="number"
                placeholder="Same as invested if new"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-date">Date</Label>
              <Input
                id="c-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-note">Note</Label>
              <Input
                id="c-note"
                placeholder="Optional"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-border/40 px-5 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-10 rounded-full"
            >
              Cancel
            </Button>
            <Button type="submit" className="h-10 rounded-full px-5">
              {contributionToEdit ? "Save" : "Log"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DebtDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  debtToEdit?: Debt | null;
}

export function AddEditDebtDialog({
  open,
  setOpen,
  debtToEdit,
}: DebtDialogProps) {
  const { addDebt, updateDebt } = usePortfolioStore();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Debt["category"]>("Home Loan");
  const [totalAmount, setTotalAmount] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [hasInterestAndEmi, setHasInterestAndEmi] = useState(false);
  const [interestRate, setInterestRate] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (debtToEdit) {
      setName(debtToEdit.name);
      setCategory(debtToEdit.category);
      setTotalAmount(debtToEdit.totalAmount.toString());
      setRemainingAmount(debtToEdit.remainingAmount.toString());
      setHasInterestAndEmi(
        debtToEdit.interestRate !== undefined && debtToEdit.interestRate !== null
      );
      setInterestRate(debtToEdit.interestRate?.toString() || "");
      setMonthlyPayment(debtToEdit.monthlyPayment?.toString() || "");
      setDueDate(debtToEdit.dueDate || "");
      setNote(debtToEdit.note || "");
    } else {
      setName("");
      setCategory("Home Loan");
      setTotalAmount("");
      setRemainingAmount("");
      setHasInterestAndEmi(false);
      setInterestRate("");
      setMonthlyPayment("");
      setDueDate("");
      setNote("");
    }
  }, [debtToEdit, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a loan name");
      return;
    }

    const totalVal = parseFloat(totalAmount);
    const remainingVal = parseFloat(remainingAmount);
    const rateVal = hasInterestAndEmi && interestRate.trim() ? parseFloat(interestRate) : 0;
    const emiVal = hasInterestAndEmi && monthlyPayment.trim() ? parseFloat(monthlyPayment) : null;
    const dueVal = hasInterestAndEmi && dueDate.trim() ? dueDate.trim() : null;

    if (isNaN(totalVal) || totalVal <= 0) {
      toast.error("Please enter a valid loan amount");
      return;
    }

    if (isNaN(remainingVal) || remainingVal < 0 || remainingVal > totalVal) {
      toast.error("Remaining amount must be between 0 and total loan amount");
      return;
    }

    if (hasInterestAndEmi) {
      if (interestRate.trim() && (isNaN(rateVal) || rateVal < 0)) {
        toast.error("Interest rate cannot be negative");
        return;
      }

      if (monthlyPayment.trim() && emiVal !== null && (isNaN(emiVal) || emiVal <= 0)) {
        toast.error("Please enter a valid monthly payment (EMI) greater than 0");
        return;
      }
    }

    const payload = {
      name,
      category,
      totalAmount: totalVal,
      remainingAmount: remainingVal,
      interestRate: rateVal,
      monthlyPayment: emiVal,
      dueDate: dueVal,
      note: note.trim() || undefined,
    };

    if (debtToEdit) {
      updateDebt(debtToEdit.id, payload);
      toast.success("Liability updated successfully!");
    } else {
      addDebt(payload);
      toast.success("Liability added successfully!");
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[420px]">
        <DialogHeader className="space-y-1 border-b border-border/40 px-5 py-4">
          <DialogTitle className="text-lg">
            {debtToEdit ? "Edit debt" : "Add debt"}
          </DialogTitle>
          <DialogDescription>
            {debtToEdit
              ? "Update loan details."
              : "Track a loan or credit line."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-5 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="debt-name">Name</Label>
              <Input
                id="debt-name"
                placeholder="e.g. SBI Home Loan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-xl"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="debt-category">Category</Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as Debt["category"])}
              >
                <SelectTrigger id="debt-category" className="h-10 w-full rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home Loan">Home Loan</SelectItem>
                  <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Car Loan">Car Loan</SelectItem>
                  <SelectItem value="Student Loan">Student Loan</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="debt-total">Principal (₹)</Label>
              <Input
                id="debt-total"
                type="number"
                placeholder="0"
                value={totalAmount}
                onChange={(e) => {
                  const next = e.target.value;
                  setTotalAmount(next);
                  if (!remainingAmount || remainingAmount === totalAmount) {
                    setRemainingAmount(next);
                  }
                }}
                className="h-11 rounded-xl text-lg font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="debt-remaining">Remaining (₹)</Label>
              <Input
                id="debt-remaining"
                type="number"
                placeholder="Same as principal if new"
                value={remainingAmount}
                onChange={(e) => setRemainingAmount(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border/50 px-3 py-2.5">
              <Checkbox
                id="has-interest-emi"
                checked={hasInterestAndEmi}
                onCheckedChange={(checked) => setHasInterestAndEmi(!!checked)}
              />
              <span className="text-sm">Track interest, EMI & due date</span>
            </label>
            {hasInterestAndEmi && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="debt-rate">Rate (% p.a.)</Label>
                    <Input
                      id="debt-rate"
                      type="number"
                      step="0.01"
                      placeholder="8.50"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="debt-emi">EMI (₹)</Label>
                    <Input
                      id="debt-emi"
                      type="number"
                      placeholder="Optional"
                      value={monthlyPayment}
                      onChange={(e) => setMonthlyPayment(e.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="debt-due">Due date</Label>
                  <Input
                    id="debt-due"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="debt-note">Note</Label>
              <Input
                id="debt-note"
                placeholder="Optional"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-border/40 px-5 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-10 rounded-full"
            >
              Cancel
            </Button>
            <Button type="submit" className="h-10 rounded-full px-5">
              {debtToEdit ? "Save" : "Add debt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AddEditDebtPaymentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  debt: Debt | null;
  paymentToEdit?: DebtPayment | null;
}

export function AddEditDebtPaymentDialog({ open, setOpen, debt, paymentToEdit }: AddEditDebtPaymentDialogProps) {
  const { addDebtPayment, updateDebtPayment } = usePortfolioStore();
  const [splitPayment, setSplitPayment] = useState(false);
  const [amount, setAmount] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestAmount, setInterestAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  
  // Calculate automatic split if applicable
  const autoInterest = useMemo(() => {
    if (splitPayment || !debt || !debt.interestRate || debt.interestRate <= 0) return 0;
    const val = parseFloat(amount) || 0;
    if (val <= 0) return 0;
    
    // Standard EMI interest calculation: (Principal * Annual Rate) / 12
    const monthlyInterest = debt.remainingAmount * (debt.interestRate / 100 / 12);
    return Math.min(val, monthlyInterest); // Caps interest at payment amount
  }, [amount, debt, splitPayment]);

  const autoPrincipal = useMemo(() => {
    const val = parseFloat(amount) || 0;
    return val - autoInterest;
  }, [amount, autoInterest]);

  useEffect(() => {
    if (paymentToEdit) {
      setSplitPayment(paymentToEdit.interestAmount > 0);
      setPrincipalAmount(paymentToEdit.principalAmount.toString());
      setInterestAmount(paymentToEdit.interestAmount.toString());
      if (paymentToEdit.interestAmount === 0) {
        setAmount(paymentToEdit.principalAmount.toString());
      }
      setDate(paymentToEdit.date);
      setNote(paymentToEdit.note || "");
    } else if (!open) {
      setSplitPayment(false);
      setAmount("");
      setPrincipalAmount("");
      setInterestAmount("");
      setDate(new Date().toISOString().slice(0, 10));
      setNote("");
    }
  }, [paymentToEdit, open]);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debt) return;

    if (!splitPayment) {
      const val = parseFloat(amount);
      if (isNaN(val) || val <= 0) {
        toast.error("Please enter a valid payment amount");
        return;
      }
      
      const princVal = debt.interestRate && debt.interestRate > 0 ? autoPrincipal : val;
      const intVal = debt.interestRate && debt.interestRate > 0 ? autoInterest : 0;
      
      if (princVal > debt.remainingAmount && (!paymentToEdit || princVal - paymentToEdit.principalAmount > debt.remainingAmount)) {
        toast.error(`Principal payment cannot exceed remaining principal (₹${debt.remainingAmount})`);
        return;
      }
      
      const payload = {
        principalAmount: princVal,
        interestAmount: intVal,
        date,
        note: note.trim() || undefined,
      };

      if (paymentToEdit) {
        updateDebtPayment(debt.id, paymentToEdit.id, payload);
        toast.success(`Updated payment of ₹${val.toLocaleString()}`);
      } else {
        addDebtPayment(debt.id, payload);
        toast.success(`Logged payment of ₹${val.toLocaleString()} to ${debt.name}`);
      }
    } else {
      const princVal = parseFloat(principalAmount) || 0;
      const intVal = parseFloat(interestAmount) || 0;
      
      if (princVal <= 0 && intVal <= 0) {
        toast.error("Please enter a valid payment amount greater than 0");
        return;
      }

      if (princVal > debt.remainingAmount && (!paymentToEdit || princVal - paymentToEdit.principalAmount > debt.remainingAmount)) {
        toast.error(`Principal payment cannot exceed remaining principal (₹${debt.remainingAmount})`);
        return;
      }
      
      const payload = {
        principalAmount: princVal,
        interestAmount: intVal,
        date,
        note: note.trim() || undefined,
      };

      if (paymentToEdit) {
        updateDebtPayment(debt.id, paymentToEdit.id, payload);
        toast.success(`Updated payment of ₹${(princVal + intVal).toLocaleString()}`);
      } else {
        addDebtPayment(debt.id, payload);
        toast.success(`Logged payment of ₹${(princVal + intVal).toLocaleString()} to ${debt.name}`);
      }
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[400px]">
        <DialogHeader className="space-y-1 border-b border-border/40 px-5 py-4">
          <DialogTitle className="text-lg">
            {paymentToEdit ? "Edit payment" : `Pay ${debt?.name ?? ""}`}
          </DialogTitle>
          <DialogDescription>
            {paymentToEdit
              ? "Update this payment."
              : "Reduce principal or record interest."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePay}>
          <div className="space-y-4 px-5 py-4">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border/50 px-3 py-2.5">
              <Checkbox
                id="split-payment"
                checked={splitPayment}
                onCheckedChange={(checked) => setSplitPayment(!!checked)}
              />
              <span className="text-sm">Split interest separately</span>
            </label>

            {!splitPayment ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pay-amount">Amount (₹)</Label>
                  <Input
                    id="pay-amount"
                    type="number"
                    placeholder={`Remaining ${debt?.remainingAmount ?? 0}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-11 rounded-xl text-lg font-semibold"
                    autoFocus
                  />
                  {!debt?.interestRate && (
                    <p className="text-xs text-muted-foreground">
                      Remaining: ₹{debt?.remainingAmount.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>

                {debt?.interestRate ? (
                  <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/40 bg-muted/30 p-3 text-sm">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Principal</p>
                      <p className="font-semibold tabular-nums">
                        ₹
                        {autoPrincipal.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Interest</p>
                      <p className="font-semibold tabular-nums text-emerald-600">
                        ₹
                        {autoInterest.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pay-principal">Principal (₹)</Label>
                  <Input
                    id="pay-principal"
                    type="number"
                    placeholder={`Max ${debt?.remainingAmount ?? 0}`}
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pay-interest">Interest (₹)</Label>
                  <Input
                    id="pay-interest"
                    type="number"
                    placeholder="0"
                    value={interestAmount}
                    onChange={(e) => setInterestAmount(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="pay-date">Date</Label>
              <Input
                id="pay-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-note">Note</Label>
              <Input
                id="pay-note"
                placeholder="Optional"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-border/40 px-5 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-10 rounded-full"
            >
              Cancel
            </Button>
            <Button type="submit" className="h-10 rounded-full px-5">
              {paymentToEdit ? "Save" : "Log payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
