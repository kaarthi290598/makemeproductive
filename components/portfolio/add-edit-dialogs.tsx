"use client";

import React, { useState, useEffect } from "react";
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
import { usePortfolioStore, Investment, Debt, InvestmentContribution } from "@/hooks/use-portfolio-store";
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
      setInterestRate(debtToEdit.interestRate.toString());
      setMonthlyPayment(debtToEdit.monthlyPayment.toString());
      setDueDate(debtToEdit.dueDate || "");
      setNote(debtToEdit.note || "");
    } else {
      setName("");
      setCategory("Home Loan");
      setTotalAmount("");
      setRemainingAmount("");
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
    const rateVal = parseFloat(interestRate);
    const emiVal = parseFloat(monthlyPayment);

    if (isNaN(totalVal) || totalVal <= 0) {
      toast.error("Please enter a valid loan amount");
      return;
    }

    if (isNaN(remainingVal) || remainingVal < 0 || remainingVal > totalVal) {
      toast.error("Remaining amount must be between 0 and total loan amount");
      return;
    }

    if (isNaN(rateVal) || rateVal < 0) {
      toast.error("Interest rate cannot be negative");
      return;
    }

    if (isNaN(emiVal) || emiVal <= 0) {
      toast.error("Please enter a valid monthly payment (EMI)");
      return;
    }

    const payload = {
      name,
      category,
      totalAmount: totalVal,
      remainingAmount: remainingVal,
      interestRate: rateVal,
      monthlyPayment: emiVal,
      dueDate: dueDate.trim() || undefined,
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="debt-category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as Debt["category"])}
              >
                <SelectTrigger id="debt-category" className="h-9 rounded-lg">
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
              <Label htmlFor="debt-rate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interest Rate (% p.a.)</Label>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="debt-emi" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Payment / EMI (₹)</Label>
              <Input
                id="debt-emi"
                type="number"
                placeholder="12000"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                className="rounded-lg h-9"
              />
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
          </div>
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

interface PayDebtDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  debt: Debt | null;
}

export function PayDebtDialog({ open, setOpen, debt }: PayDebtDialogProps) {
  const { payDebt } = usePortfolioStore();
  const [amount, setAmount] = useState("");

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debt) return;

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (val > debt.remainingAmount) {
      toast.error(`Payment cannot exceed remaining debt amount (₹${debt.remainingAmount})`);
      return;
    }

    payDebt(debt.id, val);
    toast.success(`Logged payment of ₹${val.toLocaleString()} to ${debt.name}`);
    setOpen(false);
    setAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px] rounded-xl">
        <DialogHeader>
          <DialogTitle>Log Payment - {debt?.name}</DialogTitle>
          <DialogDescription>
            Reduce the outstanding principal on this liability.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePay} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="pay-amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Amount (₹)</Label>
            <Input
              id="pay-amount"
              type="number"
              placeholder={`Max: ${debt?.remainingAmount}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-lg h-9"
            />
            <p className="text-[10px] text-muted-foreground">Remaining balance: ₹{debt?.remainingAmount.toLocaleString()}</p>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-lg h-9 text-xs font-semibold">
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
              Log Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
