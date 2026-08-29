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
  Coins,
  CreditCard,
  IndianRupee,
  Plus,
  Send,
  Calendar,
  FileText,
  Percent,
  Check,
  Building2,
} from "lucide-react";

const fieldLabelClass =
  "block text-xs font-bold text-slate-700 dark:text-slate-300";

const dialogShellClass =
  "max-h-[min(94dvh,44rem)] w-[min(calc(100vw-1.5rem),32rem)] max-w-lg overflow-y-auto rounded-2xl border-slate-200/90 p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:rounded-3xl";

const inputClass =
  "h-9 rounded-xl border-slate-200 bg-slate-50/70 text-xs shadow-2xs placeholder:text-slate-400 focus-visible:bg-white dark:border-slate-800 dark:bg-slate-900 dark:focus-visible:bg-slate-950";

const datePickerClass =
  "h-9 w-full rounded-xl border-slate-200 bg-slate-50/70 font-mono text-xs font-semibold shadow-2xs hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800";

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
  const isEmerald = tone === "emerald";
  return (
    <div
      className={cn(
        "relative border-b px-5 py-3.5 transition-colors duration-200 sm:px-6",
        isEmerald
          ? "border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-transparent dark:border-emerald-950/60 dark:from-emerald-950/30"
          : "border-rose-100 bg-gradient-to-b from-rose-50/80 to-transparent dark:border-rose-950/60 dark:from-rose-950/30",
      )}
    >
      <DialogHeader className="space-y-0.5 text-left">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-all duration-300",
              isEmerald
                ? "bg-emerald-600 shadow-emerald-600/25 ring-4 ring-emerald-100 dark:ring-emerald-950/50"
                : "bg-rose-600 shadow-rose-600/25 ring-4 ring-rose-100 dark:ring-rose-950/50",
            )}
          >
            <Icon className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {description}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
    </div>
  );
}

function AmountCard({
  id,
  label,
  value,
  onChange,
  tone,
  placeholder = "0.00",
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
        "group relative rounded-xl border p-3 transition-all duration-200",
        isEmerald
          ? "border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 dark:border-emerald-900/50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-emerald-950/10"
          : "border-rose-200/80 bg-gradient-to-br from-rose-50/50 via-white to-rose-50/30 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/10 dark:border-rose-900/50 dark:from-rose-950/20 dark:via-slate-900 dark:to-rose-950/10",
      )}
    >
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          {label}
        </Label>
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider",
            isEmerald
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400",
          )}
        >
          INR (₹)
        </span>
      </div>

      <div className="relative mt-1 flex items-center">
        <IndianRupee
          className={cn(
            "pointer-events-none absolute left-0 size-5.5 shrink-0 transition-colors sm:size-6",
            isEmerald
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400",
          )}
        />
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          step="any"
          autoFocus={autoFocus}
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/-/g, ""))}
          placeholder={placeholder}
          className={cn(
            "h-10 border-0 bg-transparent pl-7 font-mono text-xl font-black tracking-tight shadow-none focus-visible:ring-0 sm:pl-8 sm:text-2xl",
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            isEmerald
              ? "text-emerald-950 placeholder:text-emerald-300 dark:text-emerald-200 dark:placeholder:text-emerald-800"
              : "text-rose-950 placeholder:text-rose-300 dark:text-rose-200 dark:placeholder:text-rose-800",
          )}
        />
      </div>
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
  const isEmerald = tone === "emerald";
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5",
        options.length > 12 && "max-h-28 overflow-y-auto pr-1",
      )}
    >
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-bold transition-all",
              active
                ? isEmerald
                  ? "border-emerald-400 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-400 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-200"
                  : "border-rose-400 bg-rose-50 text-rose-900 shadow-sm ring-1 ring-rose-400 dark:border-rose-600 dark:bg-rose-950/60 dark:text-rose-200"
                : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
            )}
          >
            <span>{option}</span>
            {active && (
              <Check
                className={cn(
                  "size-3",
                  isEmerald ? "text-emerald-600" : "text-rose-600",
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function SubmitButton({
  tone,
  children,
}: {
  tone: "emerald" | "rose";
  children: React.ReactNode;
}) {
  const isEmerald = tone === "emerald";
  return (
    <Button
      type="submit"
      className={cn(
        "h-9.5 w-full gap-2 rounded-xl px-5 text-xs font-bold text-white shadow-lg sm:w-auto sm:min-w-[140px]",
        isEmerald
          ? "bg-emerald-600 shadow-emerald-600/25 hover:bg-emerald-500"
          : "bg-rose-600 shadow-rose-600/25 hover:bg-rose-500",
      )}
    >
      <Send className="size-3.5" />
      <span>{children}</span>
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
      toast.error("Please enter an asset name");
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
        toast.error("Please enter a valid invested amount");
        return;
      }

      if (isNaN(currentVal) || currentVal < 0) {
        toast.error("Please enter a valid current value");
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
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogIconHeader
            icon={Coins}
            tone="emerald"
            title={investmentToEdit ? "Edit Asset" : "Add Asset"}
            description={
              investmentToEdit
                ? "Update asset name, category, and notes."
                : "Name the asset and record the initial purchase."
            }
          />

          <div className="space-y-3 px-5 py-3.5 sm:px-6">
            <div className="space-y-1">
              <Label htmlFor="inv-name" className={fieldLabelClass}>
                Asset Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="inv-name"
                placeholder="e.g. Nifty 50 ETF, Apple Inc, Gold ETF"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
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
                <AmountCard
                  id="inv-invested"
                  label="Initial Invested Amount *"
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

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="inv-current" className={fieldLabelClass}>
                      Current Value (₹)
                    </Label>
                    <Input
                      id="inv-current"
                      type="number"
                      placeholder="Same as invested if new"
                      value={currentValue}
                      onChange={(e) => setCurrentValue(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Calendar className="size-3.5 text-slate-400" />
                      Date <span className="text-rose-500">*</span>
                    </Label>
                    <CustomDatePicker
                      value={date ? parseLocalISODate(date) : undefined}
                      onChange={(d) =>
                        setDate(d ? formatDateToLocalISO(d) : "")
                      }
                      className={datePickerClass}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <Label
                htmlFor="inv-note"
                className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <FileText className="size-3.5 text-slate-400" />
                Note
              </Label>
              <Input
                id="inv-note"
                placeholder="Optional description or broker details"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:justify-end sm:px-6">
            <SubmitButton tone="emerald">
              {investmentToEdit ? "Update Asset" : "Save Asset"}
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
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogIconHeader
            icon={Plus}
            tone="emerald"
            title={contributionToEdit ? "Edit Contribution" : "Log Purchase"}
            description={
              contributionToEdit
                ? "Update this contribution entry."
                : `Add a purchase or SIP to ${investment?.name ?? "this asset"}.`
            }
          />

          <div className="space-y-3 px-5 py-3.5 sm:px-6">
            <AmountCard
              id="c-amount"
              label="Invested Amount *"
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

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="c-current" className={fieldLabelClass}>
                  Current Value (₹) *
                </Label>
                <Input
                  id="c-current"
                  type="number"
                  placeholder="Same as invested if new"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <Label className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Calendar className="size-3.5 text-slate-400" />
                  Date <span className="text-rose-500">*</span>
                </Label>
                <CustomDatePicker
                  value={date ? parseLocalISODate(date) : undefined}
                  onChange={(d) => setDate(d ? formatDateToLocalISO(d) : "")}
                  className={datePickerClass}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="c-note"
                className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <FileText className="size-3.5 text-slate-400" />
                Note
              </Label>
              <Input
                id="c-note"
                placeholder="e.g. Monthly SIP, Dip buy"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:justify-end sm:px-6">
            <SubmitButton tone="emerald">
              {contributionToEdit ? "Update Log" : "Log Purchase"}
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
      toast.error("Please enter a loan/debt name");
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
      toast.error("Please enter a valid loan principal amount");
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
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogIconHeader
            icon={CreditCard}
            tone="rose"
            title={debtToEdit ? "Edit Debt" : "Add Debt"}
            description={
              debtToEdit
                ? "Update liability and schedule details."
                : "Track a loan, credit card, or liability."
            }
          />

          <div className="space-y-3 px-5 py-3.5 sm:px-6">
            <div className="space-y-1">
              <Label htmlFor="debt-name" className={fieldLabelClass}>
                Loan / Liability Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="debt-name"
                placeholder="e.g. HDFC Home Loan, ICICI Credit Card"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
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

            <AmountCard
              id="debt-total"
              label="Total Loan Principal *"
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

            <div className="space-y-1">
              <Label htmlFor="debt-remaining" className={fieldLabelClass}>
                Remaining Principal (₹)
              </Label>
              <Input
                id="debt-remaining"
                type="number"
                placeholder="Same as principal if new"
                value={remainingAmount}
                onChange={(e) => setRemainingAmount(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Interest & Schedule Option */}
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-3 transition-colors hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900/80">
              <Checkbox
                id="has-interest-emi"
                checked={hasInterestAndEmi}
                onCheckedChange={(checked) => setHasInterestAndEmi(!!checked)}
                className="mt-0.5"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Track interest, EMI & due date
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                  Optional extras for loans with monthly payment schedules.
                </span>
              </span>
            </label>

            {hasInterestAndEmi && (
              <div className="space-y-2.5 rounded-xl border border-rose-200/60 bg-rose-50/30 p-3 dark:border-rose-900/40 dark:bg-rose-950/20">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label
                      htmlFor="debt-rate"
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300"
                    >
                      <Percent className="size-3 text-slate-400" />
                      Rate (% p.a.)
                    </Label>
                    <Input
                      id="debt-rate"
                      type="number"
                      step="0.01"
                      placeholder="8.50"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="debt-emi"
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300"
                    >
                      <IndianRupee className="size-3 text-slate-400" />
                      Monthly EMI
                    </Label>
                    <Input
                      id="debt-emi"
                      type="number"
                      placeholder="Optional"
                      value={monthlyPayment}
                      onChange={(e) => setMonthlyPayment(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <Calendar className="size-3 text-slate-400" />
                    Due date
                  </Label>
                  <CustomDatePicker
                    value={dueDate ? parseLocalISODate(dueDate) : undefined}
                    onChange={(d) =>
                      setDueDate(d ? formatDateToLocalISO(d) : "")
                    }
                    className={datePickerClass}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label
                htmlFor="debt-note"
                className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <FileText className="size-3.5 text-slate-400" />
                Note
              </Label>
              <Input
                id="debt-note"
                placeholder="Optional loan account details or lender"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:justify-end sm:px-6">
            <SubmitButton tone="rose">
              {debtToEdit ? "Update Debt" : "Save Debt"}
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
        <form onSubmit={handlePay} className="flex flex-col">
          <DialogIconHeader
            icon={Send}
            tone="rose"
            title={paymentToEdit ? "Edit Payment" : `Pay ${debt?.name ?? ""}`}
            description={
              paymentToEdit
                ? "Update payment entry details."
                : "Reduce principal balance or record interest payment."
            }
          />

          <div className="space-y-3 px-5 py-3.5 sm:px-6">
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-3 transition-colors hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900/80">
              <Checkbox
                id="split-payment"
                checked={splitPayment}
                onCheckedChange={(checked) => setSplitPayment(!!checked)}
                className="mt-0.5"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                  Split principal & interest manually
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                  Enter principal and interest as two distinct amounts.
                </span>
              </span>
            </label>

            {!splitPayment ? (
              <>
                <AmountCard
                  id="pay-amount"
                  label="Total Payment Amount *"
                  value={amount}
                  autoFocus
                  tone="rose"
                  placeholder={`Remaining ₹${debt?.remainingAmount ?? 0}`}
                  onChange={setAmount}
                />

                {debt?.interestRate ? (
                  <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/40">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Principal Paid
                      </p>
                      <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
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
                      <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
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
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="pay-principal" className={fieldLabelClass}>
                    Principal Amount (₹) *
                  </Label>
                  <Input
                    id="pay-principal"
                    type="number"
                    placeholder={`Max ${debt?.remainingAmount ?? 0}`}
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pay-interest" className={fieldLabelClass}>
                    Interest Amount (₹)
                  </Label>
                  <Input
                    id="pay-interest"
                    type="number"
                    placeholder="0"
                    value={interestAmount}
                    onChange={(e) => setInterestAmount(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Calendar className="size-3.5 text-slate-400" />
                  Date <span className="text-rose-500">*</span>
                </Label>
                <CustomDatePicker
                  value={date ? parseLocalISODate(date) : undefined}
                  onChange={(d) => setDate(d ? formatDateToLocalISO(d) : "")}
                  className={datePickerClass}
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="pay-note"
                  className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <FileText className="size-3.5 text-slate-400" />
                  Note
                </Label>
                <Input
                  id="pay-note"
                  placeholder="Optional reference / transaction ID"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:justify-end sm:px-6">
            <SubmitButton tone="rose">
              {paymentToEdit ? "Update Payment" : "Log Payment"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

