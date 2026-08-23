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
import { Checkbox } from "@/components/ui/checkbox";
import {
  usePortfolioStore,
  Investment,
  Debt,
  InvestmentContribution,
  DebtPayment,
} from "@/hooks/use-portfolio-store";
import { toast } from "sonner";
import { cn, formatDateToLocalISO, parseLocalISODate } from "@/lib/utils";
import { CustomDatePicker } from "@/components/customDatePicker";
import {
  consoleDialogBodyClass,
  consoleDialogClass,
  consoleDialogFormClass,
} from "@/components/finance/page-header";
import { ChipScroll } from "@/components/ui/chip-scroll";
import {
  Coins,
  CreditCard,
  IndianRupee,
  Plus,
  Send,
} from "lucide-react";

const fieldLabelClass =
  "block text-xs font-semibold text-slate-700 dark:text-slate-300";

const choiceIdleClass =
  "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400";

const dialogShellClass = consoleDialogClass;

const datePickerClass =
  "h-9 min-w-0 rounded-lg border-slate-200 bg-white font-mono text-xs font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900 [&_svg]:text-emerald-600 dark:[&_svg]:text-emerald-400";

const noteInputClass =
  "h-9 rounded-lg border-slate-200 bg-white text-sm shadow-sm focus-visible:border-emerald-500 focus-visible:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900";

const INVESTMENT_CATEGORIES: Investment["category"][] = [
  "Stocks",
  "Mutual Funds",
  "Crypto",
  "Real Estate",
  "Gold",
  "Other",
];

const DEBT_CATEGORIES: Debt["category"][] = [
  "Home Loan",
  "Personal Loan",
  "Credit Card",
  "Car Loan",
  "Student Loan",
  "Other",
];

function DialogIconHeader({
  icon: Icon,
  tone,
  title,
  description,
}: {
  icon: React.ElementType;
  tone: "emerald" | "rose";
  title: string;
  description: string;
}) {
  return (
    <DialogHeader className="shrink-0 space-y-0.5 border-b border-slate-100 px-4 py-2.5 pr-12 dark:border-slate-800 sm:px-5">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-white",
            tone === "emerald" ? "bg-emerald-600" : "bg-rose-600",
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight text-slate-900 dark:text-white sm:text-lg">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </DialogDescription>
        </div>
      </div>
    </DialogHeader>
  );
}

function AmountCard({
  id,
  label,
  value,
  onChange,
  tone,
  placeholder = "0",
  autoFocus,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  tone: "emerald" | "rose";
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const isEmerald = tone === "emerald";
  return (
    <div
      className={cn(
        "h-fit w-full self-start rounded-xl border p-3",
        isEmerald
          ? "border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/40"
          : "border-rose-200/80 bg-rose-50/70 dark:border-rose-800/60 dark:bg-rose-950/40",
      )}
    >
      <Label htmlFor={id} className={fieldLabelClass}>
        {label}
      </Label>
      <div className="relative mt-1">
        <IndianRupee
          className={cn(
            "pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2",
            isEmerald
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400",
          )}
        />
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          autoFocus={autoFocus}
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/-/g, ""))}
          className={cn(
            "h-10 border-0 bg-transparent pl-6 text-xl font-black tracking-tight shadow-none focus-visible:ring-0",
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            isEmerald
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-rose-700 dark:text-rose-300",
          )}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function DetailsCard({
  children,
  step = "1",
  title = "Details",
  className,
}: {
  children: React.ReactNode;
  step?: string;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 space-y-2.5 rounded-xl border border-slate-200 p-3 dark:border-slate-800",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          {step}
        </span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

function ChipGrid({
  options,
  value,
  onChange,
  tone,
}: {
  options: string[];
  value: string;
  onChange: (next: string) => void;
  tone: "emerald" | "rose";
}) {
  return (
    <ChipScroll>
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "inline-flex shrink-0 items-center rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all",
              active
                ? tone === "emerald"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200"
                  : "border-rose-300 bg-rose-50 text-rose-900 shadow-sm dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-200"
                : choiceIdleClass,
            )}
          >
            {option}
          </button>
        );
      })}
    </ChipScroll>
  );
}

function SubmitButton({
  tone,
  children,
}: {
  tone: "emerald" | "rose";
  children: React.ReactNode;
}) {
  return (
    <Button
      type="submit"
      className={cn(
        "h-10 w-full rounded-xl px-5 text-sm font-bold text-white shadow-lg sm:w-auto sm:min-w-[148px]",
        tone === "emerald"
          ? "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-500"
          : "bg-rose-600 shadow-rose-600/20 hover:bg-rose-500",
      )}
    >
      <Send className="size-4" />
      {children}
    </Button>
  );
}

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
      updateInvestmentName(
        investmentToEdit.id,
        name,
        category,
        note.trim() || undefined,
      );
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
        "Initial Purchase",
      );
      toast.success("Investment added successfully!");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={dialogShellClass}>
        <form onSubmit={handleSubmit} className={consoleDialogFormClass}>
          <DialogIconHeader
            icon={Coins}
            tone="emerald"
            title={investmentToEdit ? "Edit asset" : "Add asset"}
            description={
              investmentToEdit
                ? "Update name, category, and notes."
                : "Name it and log the first purchase."
            }
          />

          <div className={consoleDialogBodyClass}>
            {!investmentToEdit && (
              <AmountCard
                id="inv-invested"
                label="Invested *"
                value={investedAmount}
                autoFocus
                tone="emerald"
                onChange={(next) => {
                  setInvestedAmount(next);
                  if (!currentValue || currentValue === investedAmount) {
                    setCurrentValue(next);
                  }
                }}
              />
            )}

            <DetailsCard className={investmentToEdit ? "sm:col-span-2" : undefined}>
              <div className="space-y-1.5">
                <Label htmlFor="inv-name" className={fieldLabelClass}>
                  Name *
                </Label>
                <Input
                  id="inv-name"
                  placeholder="e.g. Nifty 50 ETF"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={noteInputClass}
                  autoFocus={!!investmentToEdit}
                />
              </div>

              <div className="space-y-1.5">
                <span className={fieldLabelClass}>Category *</span>
                <ChipGrid
                  options={INVESTMENT_CATEGORIES}
                  value={category}
                  onChange={(next) =>
                    setCategory(next as Investment["category"])
                  }
                  tone="emerald"
                />
              </div>

              {!investmentToEdit && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="inv-current" className={fieldLabelClass}>
                      Current value
                    </Label>
                    <Input
                      id="inv-current"
                      type="number"
                      placeholder="Same as invested if new"
                      value={currentValue}
                      onChange={(e) => setCurrentValue(e.target.value)}
                      className={noteInputClass}
                    />
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <span className={fieldLabelClass}>Date *</span>
                    <CustomDatePicker
                      value={date ? parseLocalISODate(date) : undefined}
                      onChange={(d) =>
                        setDate(d ? formatDateToLocalISO(d) : "")
                      }
                      className={datePickerClass}
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="inv-note" className={fieldLabelClass}>
                  Note
                </Label>
                <Input
                  id="inv-note"
                  placeholder="Optional"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={noteInputClass}
                />
              </div>
            </DetailsCard>
          </div>

          <DialogFooter className="shrink-0 border-t border-slate-100 px-4 py-2.5 dark:border-slate-800 sm:justify-end sm:px-5">
            <SubmitButton tone="emerald">
              {investmentToEdit ? "Update asset" : "Save asset"}
            </SubmitButton>
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
      <DialogContent className={dialogShellClass}>
        <form onSubmit={handleSubmit} className={consoleDialogFormClass}>
          <DialogIconHeader
            icon={Plus}
            tone="emerald"
            title={contributionToEdit ? "Edit contribution" : "Log purchase"}
            description={
              contributionToEdit
                ? "Update this batch."
                : `Add a purchase or SIP to ${investment?.name ?? "this asset"}.`
            }
          />

          <div className={consoleDialogBodyClass}>
            <AmountCard
              id="c-amount"
              label="Invested *"
              value={amount}
              autoFocus
              tone="emerald"
              onChange={(next) => {
                setAmount(next);
                if (!currentValue || currentValue === amount) {
                  setCurrentValue(next);
                }
              }}
            />

            <DetailsCard>
              <div className="space-y-1.5">
                <Label htmlFor="c-current" className={fieldLabelClass}>
                  Current value *
                </Label>
                <Input
                  id="c-current"
                  type="number"
                  placeholder="Same as invested if new"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  className={noteInputClass}
                />
              </div>
              <div className="min-w-0 space-y-1.5">
                <span className={fieldLabelClass}>Date *</span>
                <CustomDatePicker
                  value={date ? parseLocalISODate(date) : undefined}
                  onChange={(d) => setDate(d ? formatDateToLocalISO(d) : "")}
                  className={datePickerClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-note" className={fieldLabelClass}>
                  Note
                </Label>
                <Input
                  id="c-note"
                  placeholder="Optional"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={noteInputClass}
                />
              </div>
            </DetailsCard>
          </div>

          <DialogFooter className="shrink-0 border-t border-slate-100 px-4 py-2.5 dark:border-slate-800 sm:justify-end sm:px-5">
            <SubmitButton tone="emerald">
              {contributionToEdit ? "Update log" : "Log purchase"}
            </SubmitButton>
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
        debtToEdit.interestRate !== undefined &&
          debtToEdit.interestRate !== null,
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
    const rateVal =
      hasInterestAndEmi && interestRate.trim()
        ? parseFloat(interestRate)
        : 0;
    const emiVal =
      hasInterestAndEmi && monthlyPayment.trim()
        ? parseFloat(monthlyPayment)
        : null;
    const dueVal =
      hasInterestAndEmi && dueDate.trim() ? dueDate.trim() : null;

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

      if (
        monthlyPayment.trim() &&
        emiVal !== null &&
        (isNaN(emiVal) || emiVal <= 0)
      ) {
        toast.error(
          "Please enter a valid monthly payment (EMI) greater than 0",
        );
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
      <DialogContent className={dialogShellClass}>
        <form onSubmit={handleSubmit} className={consoleDialogFormClass}>
          <DialogIconHeader
            icon={CreditCard}
            tone="rose"
            title={debtToEdit ? "Edit debt" : "Add debt"}
            description={
              debtToEdit
                ? "Update loan details."
                : "Track a loan or credit line."
            }
          />

          <div className={consoleDialogBodyClass}>
            <AmountCard
              id="debt-total"
              label="Principal *"
              value={totalAmount}
              autoFocus={!debtToEdit}
              tone="rose"
              onChange={(next) => {
                setTotalAmount(next);
                if (!remainingAmount || remainingAmount === totalAmount) {
                  setRemainingAmount(next);
                }
              }}
            />

            <DetailsCard>
              <div className="space-y-1.5">
                <Label htmlFor="debt-name" className={fieldLabelClass}>
                  Name *
                </Label>
                <Input
                  id="debt-name"
                  placeholder="e.g. SBI Home Loan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={noteInputClass}
                  autoFocus={!!debtToEdit}
                />
              </div>

              <div className="space-y-1.5">
                <span className={fieldLabelClass}>Category *</span>
                <ChipGrid
                  options={DEBT_CATEGORIES}
                  value={category}
                  onChange={(next) => setCategory(next as Debt["category"])}
                  tone="rose"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="debt-remaining" className={fieldLabelClass}>
                  Remaining
                </Label>
                <Input
                  id="debt-remaining"
                  type="number"
                  placeholder="Same as principal if new"
                  value={remainingAmount}
                  onChange={(e) => setRemainingAmount(e.target.value)}
                  className={noteInputClass}
                />
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
                <Checkbox
                  id="has-interest-emi"
                  checked={hasInterestAndEmi}
                  onCheckedChange={(checked) => setHasInterestAndEmi(!!checked)}
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                    Track interest, EMI & due date
                  </span>
                  <span className="mt-0.5 block text-[10px] text-slate-500 dark:text-slate-400">
                    Optional extras for loans with a monthly schedule.
                  </span>
                </span>
              </label>

              {hasInterestAndEmi && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="debt-rate" className={fieldLabelClass}>
                        Rate (% p.a.)
                      </Label>
                      <Input
                        id="debt-rate"
                        type="number"
                        step="0.01"
                        placeholder="8.50"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        className={noteInputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="debt-emi" className={fieldLabelClass}>
                        EMI (₹)
                      </Label>
                      <Input
                        id="debt-emi"
                        type="number"
                        placeholder="Optional"
                        value={monthlyPayment}
                        onChange={(e) => setMonthlyPayment(e.target.value)}
                        className={noteInputClass}
                      />
                    </div>
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <span className={fieldLabelClass}>Due date</span>
                    <CustomDatePicker
                      value={dueDate ? parseLocalISODate(dueDate) : undefined}
                      onChange={(d) =>
                        setDueDate(d ? formatDateToLocalISO(d) : "")
                      }
                      className={datePickerClass}
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="debt-note" className={fieldLabelClass}>
                  Note
                </Label>
                <Input
                  id="debt-note"
                  placeholder="Optional"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={noteInputClass}
                />
              </div>
            </DetailsCard>
          </div>

          <DialogFooter className="shrink-0 border-t border-slate-100 px-4 py-2.5 dark:border-slate-800 sm:justify-end sm:px-5">
            <SubmitButton tone="rose">
              {debtToEdit ? "Update debt" : "Save debt"}
            </SubmitButton>
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

export function AddEditDebtPaymentDialog({
  open,
  setOpen,
  debt,
  paymentToEdit,
}: AddEditDebtPaymentDialogProps) {
  const { addDebtPayment, updateDebtPayment } = usePortfolioStore();
  const [splitPayment, setSplitPayment] = useState(false);
  const [amount, setAmount] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestAmount, setInterestAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  const autoInterest = useMemo(() => {
    if (splitPayment || !debt || !debt.interestRate || debt.interestRate <= 0)
      return 0;
    const val = parseFloat(amount) || 0;
    if (val <= 0) return 0;

    const monthlyInterest =
      debt.remainingAmount * (debt.interestRate / 100 / 12);
    return Math.min(val, monthlyInterest);
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

      const princVal =
        debt.interestRate && debt.interestRate > 0 ? autoPrincipal : val;
      const intVal =
        debt.interestRate && debt.interestRate > 0 ? autoInterest : 0;

      if (
        princVal > debt.remainingAmount &&
        (!paymentToEdit ||
          princVal - paymentToEdit.principalAmount > debt.remainingAmount)
      ) {
        toast.error(
          `Principal payment cannot exceed remaining principal (₹${debt.remainingAmount})`,
        );
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
        toast.success(
          `Logged payment of ₹${val.toLocaleString()} to ${debt.name}`,
        );
      }
    } else {
      const princVal = parseFloat(principalAmount) || 0;
      const intVal = parseFloat(interestAmount) || 0;

      if (princVal <= 0 && intVal <= 0) {
        toast.error("Please enter a valid payment amount greater than 0");
        return;
      }

      if (
        princVal > debt.remainingAmount &&
        (!paymentToEdit ||
          princVal - paymentToEdit.principalAmount > debt.remainingAmount)
      ) {
        toast.error(
          `Principal payment cannot exceed remaining principal (₹${debt.remainingAmount})`,
        );
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
        toast.success(
          `Updated payment of ₹${(princVal + intVal).toLocaleString()}`,
        );
      } else {
        addDebtPayment(debt.id, payload);
        toast.success(
          `Logged payment of ₹${(princVal + intVal).toLocaleString()} to ${debt.name}`,
        );
      }
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={dialogShellClass}>
        <form onSubmit={handlePay} className={consoleDialogFormClass}>
          <DialogIconHeader
            icon={Send}
            tone="rose"
            title={paymentToEdit ? "Edit payment" : `Pay ${debt?.name ?? ""}`}
            description={
              paymentToEdit
                ? "Update this payment."
                : "Reduce principal or record interest."
            }
          />

          <div className={consoleDialogBodyClass}>
            {!splitPayment && (
              <AmountCard
                id="pay-amount"
                label="Amount *"
                value={amount}
                autoFocus
                tone="rose"
                placeholder={`Remaining ${debt?.remainingAmount ?? 0}`}
                onChange={setAmount}
              />
            )}

            <DetailsCard className={splitPayment ? "sm:col-span-2" : undefined}>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
                <Checkbox
                  id="split-payment"
                  checked={splitPayment}
                  onCheckedChange={(checked) => setSplitPayment(!!checked)}
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                    Split interest separately
                  </span>
                  <span className="mt-0.5 block text-[10px] text-slate-500 dark:text-slate-400">
                    Enter principal and interest as two amounts.
                  </span>
                </span>
              </label>

              {!splitPayment ? (
                <>
                  {!debt?.interestRate && (
                    <p className="font-mono text-xs text-slate-500">
                      Remaining: ₹
                      {debt?.remainingAmount.toLocaleString("en-IN")}
                    </p>
                  )}
                  {debt?.interestRate ? (
                    <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/40">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Principal
                        </p>
                        <p className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                          ₹
                          {autoPrincipal.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Interest
                        </p>
                        <p className="font-mono font-bold tabular-nums text-emerald-600">
                          ₹
                          {autoInterest.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="pay-principal" className={fieldLabelClass}>
                      Principal (₹)
                    </Label>
                    <Input
                      id="pay-principal"
                      type="number"
                      placeholder={`Max ${debt?.remainingAmount ?? 0}`}
                      value={principalAmount}
                      onChange={(e) => setPrincipalAmount(e.target.value)}
                      className={noteInputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pay-interest" className={fieldLabelClass}>
                      Interest (₹)
                    </Label>
                    <Input
                      id="pay-interest"
                      type="number"
                      placeholder="0"
                      value={interestAmount}
                      onChange={(e) => setInterestAmount(e.target.value)}
                      className={noteInputClass}
                    />
                  </div>
                </div>
              )}

              <div className="min-w-0 space-y-1.5">
                <span className={fieldLabelClass}>Date *</span>
                <CustomDatePicker
                  value={date ? parseLocalISODate(date) : undefined}
                  onChange={(d) => setDate(d ? formatDateToLocalISO(d) : "")}
                  className={datePickerClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pay-note" className={fieldLabelClass}>
                  Note
                </Label>
                <Input
                  id="pay-note"
                  placeholder="Optional"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={noteInputClass}
                />
              </div>
            </DetailsCard>
          </div>

          <DialogFooter className="shrink-0 border-t border-slate-100 px-4 py-2.5 dark:border-slate-800 sm:justify-end sm:px-5">
            <SubmitButton tone="rose">
              {paymentToEdit ? "Update payment" : "Log payment"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
