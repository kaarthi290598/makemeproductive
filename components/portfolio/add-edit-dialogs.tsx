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
      <DialogContent className="sm:max-w-[425px] rounded-xl">
        <DialogHeader>
          <DialogTitle>{investmentToEdit ? "Edit Asset Name & Category" : "Add Investment"}</DialogTitle>
          <DialogDescription>
            {investmentToEdit
              ? "Modify the branding and category of this asset portfolio."
              : "Log a new asset along with its first transaction batch."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="inv-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Asset Name</Label>
            <Input
              id="inv-name"
              placeholder="e.g. Nifty 50 ETF, Gold, BTC"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg h-9"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="inv-category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
            <Select
              value={category}
              onValueChange={(val) => setCategory(val as Investment["category"])}
            >
              <SelectTrigger id="inv-category" className="h-9 rounded-lg">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="inv-invested" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invested Amount (₹)</Label>
                  <Input
                    id="inv-invested"
                    type="number"
                    placeholder="10000"
                    value={investedAmount}
                    onChange={(e) => setInvestedAmount(e.target.value)}
                    className="rounded-lg h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-current" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Value (₹)</Label>
                  <Input
                    id="inv-current"
                    type="number"
                    placeholder="12000"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="rounded-lg h-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date Invested</Label>
                <Input
                  id="inv-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-lg h-9"
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="inv-note" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description / Notes</Label>
            <Input
              id="inv-note"
              placeholder="Add details, target goals, etc."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-lg h-9"
            />
          </div>
          
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-lg h-9 text-xs font-semibold">
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg h-9 text-xs font-semibold">
              {investmentToEdit ? "Save Changes" : "Add Asset"}
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
      <DialogContent className="sm:max-w-[400px] rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {contributionToEdit ? "Edit Contribution" : "Log Another Transaction"}
          </DialogTitle>
          <DialogDescription>
            {contributionToEdit
              ? "Update transaction details for this batch."
              : `Add a new purchase batch or SIP contribution to ${investment?.name}.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="c-amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invested Amount (₹)</Label>
              <Input
                id="c-amount"
                type="number"
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-lg h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-current" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Value (₹)</Label>
              <Input
                id="c-current"
                type="number"
                placeholder="12000"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="rounded-lg h-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transaction Date</Label>
            <Input
              id="c-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-note" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note (Optional)</Label>
            <Input
              id="c-note"
              placeholder="e.g. Monthly SIP purchase, Bonus top-up"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-lg h-9"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-lg h-9 text-xs font-semibold">
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
              {contributionToEdit ? "Save Changes" : "Log Contribution"}
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
      <DialogContent className="sm:max-w-[425px] rounded-xl">
        <DialogHeader>
          <DialogTitle>{debtToEdit ? "Edit Liability" : "Add Liability"}</DialogTitle>
          <DialogDescription>
            {debtToEdit
              ? "Update your loan parameters below."
              : "Log a new debt or credit line to track payoff progress."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="debt-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Loan / Creditor Name</Label>
            <Input
              id="debt-name"
              placeholder="e.g. SBI Home Loan, Personal Credit Card"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="debt-category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
            <Select
              value={category}
              onValueChange={(val) => setCategory(val as Debt["category"])}
            >
              <SelectTrigger id="debt-category" className="h-9 rounded-lg w-full">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="debt-total" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Principal Loan (₹)</Label>
              <Input
                id="debt-total"
                type="number"
                placeholder="100000"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="rounded-lg h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="debt-remaining" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Remaining Owed (₹)</Label>
              <Input
                id="debt-remaining"
                type="number"
                placeholder="90000"
                value={remainingAmount}
                onChange={(e) => setRemainingAmount(e.target.value)}
                className="rounded-lg h-9"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 py-1 bg-muted/30 p-2 rounded-lg border border-dashed">
            <Checkbox
              id="has-interest-emi"
              checked={hasInterestAndEmi}
              onCheckedChange={(checked) => setHasInterestAndEmi(!!checked)}
            />
            <Label htmlFor="has-interest-emi" className="text-xs font-medium cursor-pointer text-foreground">
              Track Interest Rate, EMI & Due Date
            </Label>
          </div>
          {hasInterestAndEmi && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="debt-rate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interest Rate (% p.a.) (Optional)</Label>
                  <Input
                    id="debt-rate"
                    type="number"
                    step="0.01"
                    placeholder="8.50"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="rounded-lg h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="debt-emi" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Payment / EMI (₹) (Optional)</Label>
                  <Input
                    id="debt-emi"
                    type="number"
                    placeholder="12000"
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(e.target.value)}
                    className="rounded-lg h-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="debt-due" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due Date (Optional)</Label>
                <Input
                  id="debt-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-lg h-9"
                />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="debt-note" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes (Optional)</Label>
            <Input
              id="debt-note"
              placeholder="e.g. Avalanche goal, monthly autopay"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-lg h-9"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-lg h-9 text-xs font-semibold">
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg h-9 text-xs font-semibold">
              {debtToEdit ? "Save Changes" : "Add Loan"}
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
      <DialogContent className="sm:max-w-[400px] rounded-xl">
        <DialogHeader>
          <DialogTitle>{paymentToEdit ? "Edit Payment" : `Log Payment - ${debt?.name}`}</DialogTitle>
          <DialogDescription>
            {paymentToEdit ? "Modify the details of this payment log." : "Reduce the outstanding principal on this liability or record interest."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePay} className="space-y-4 py-2">
          <div className="flex items-center space-x-2 py-1 bg-muted/30 p-2 rounded-lg border border-dashed mb-2">
            <Checkbox
              id="split-payment"
              checked={splitPayment}
              onCheckedChange={(checked) => setSplitPayment(!!checked)}
            />
            <Label htmlFor="split-payment" className="text-xs font-medium cursor-pointer text-foreground">
              Log Interest Payment Separately
            </Label>
          </div>

          {!splitPayment ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="pay-amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Amount (₹)</Label>
                <Input
                  id="pay-amount"
                  type="number"
                  placeholder={`Remaining: ${debt?.remainingAmount}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded-lg h-9"
                />
                {!debt?.interestRate && (
                  <p className="text-[10px] text-muted-foreground">Reduces principal balance. Remaining: ₹{debt?.remainingAmount.toLocaleString()}</p>
                )}
              </div>
              
              {debt?.interestRate ? (
                <div className="flex gap-4 p-2 bg-muted/20 rounded-lg border text-xs">
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">To Principal</span>
                    <span className="font-semibold text-foreground">₹{autoPrincipal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex-1 border-l pl-4">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">To Interest</span>
                    <span className="font-semibold text-emerald-600">₹{autoInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pay-principal" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Principal Payment (₹)</Label>
                <Input
                  id="pay-principal"
                  type="number"
                  placeholder={`Max: ${debt?.remainingAmount}`}
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(e.target.value)}
                  className="rounded-lg h-9"
                />
                <p className="text-[10px] text-muted-foreground">Reduces principal balance.</p>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="pay-interest" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interest Payment (₹)</Label>
                <Input
                  id="pay-interest"
                  type="number"
                  placeholder="e.g. 2000"
                  value={interestAmount}
                  onChange={(e) => setInterestAmount(e.target.value)}
                  className="rounded-lg h-9"
                />
                <p className="text-[10px] text-muted-foreground">Accumulated separately, does not reduce principal.</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pay-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Date</Label>
              <Input
                id="pay-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-note" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note (Optional)</Label>
              <Input
                id="pay-note"
                placeholder="e.g. Extra principal"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="rounded-lg h-9"
              />
            </div>
          </div>
          
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-lg h-9 text-xs font-semibold">
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
              {paymentToEdit ? "Save Changes" : "Log Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
