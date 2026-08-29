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
import { usePasswordsStore } from "@/hooks/use-passwords-store";
import {
  PasswordItem,
  PASSWORD_CATEGORIES,
  ACCOUNT_TYPES,
} from "@/types/password";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  KeyRound,
  Eye,
  EyeOff,
  Globe,
  User,
  Lock,
  FileText,
  Check,
  Send,
  Building2,
  CreditCard,
  Hash,
  Phone,
  ShieldAlert,
} from "lucide-react";

interface AddEditPasswordDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  passwordToEdit?: PasswordItem | null;
}

const dialogShellClass =
  "w-full max-w-full sm:w-[min(calc(100vw-1.5rem),34rem)] sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl rounded-b-none sm:rounded-3xl border-slate-200/90 p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-950";

const inputClass =
  "h-10 sm:h-9 rounded-xl border-slate-200 bg-slate-50/70 text-sm sm:text-xs shadow-2xs placeholder:text-slate-400 focus-visible:bg-white dark:border-slate-800 dark:bg-slate-900 dark:focus-visible:bg-slate-950";

export function AddEditPasswordDialog({
  open,
  setOpen,
  passwordToEdit,
}: AddEditPasswordDialogProps) {
  const { addPassword, editPassword } = usePasswordsStore();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [category, setCategory] = useState<string>("General");
  const [notes, setNotes] = useState("");

  // Bank Specific State
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountType, setAccountType] = useState<string>("Savings");
  const [customerId, setCustomerId] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [atmPin, setAtmPin] = useState("");
  const [mpin, setMpin] = useState("");
  const [transactionPassword, setTransactionPassword] = useState("");
  const [registeredPhone, setRegisteredPhone] = useState("");

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showAtmPin, setShowAtmPin] = useState(false);
  const [showMpin, setShowMpin] = useState(false);
  const [showTxPassword, setShowTxPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBank = category === "Bank";

  useEffect(() => {
    if (passwordToEdit) {
      setName(passwordToEdit.name);
      setUsername(passwordToEdit.username);
      setPassword(passwordToEdit.password);
      setWebsiteUrl(passwordToEdit.website_url || "");
      setCategory(passwordToEdit.category || "General");
      setNotes(passwordToEdit.notes || "");

      // Bank fields
      setAccountNumber(passwordToEdit.account_number || "");
      setIfscCode(passwordToEdit.ifsc_code || "");
      setAccountType(passwordToEdit.account_type || "Savings");
      setCustomerId(passwordToEdit.customer_id || "");
      setAccountHolderName(passwordToEdit.account_holder_name || "");
      setBranchName(passwordToEdit.branch_name || "");
      setAtmPin(passwordToEdit.atm_pin || "");
      setMpin(passwordToEdit.mpin || "");
      setTransactionPassword(passwordToEdit.transaction_password || "");
      setRegisteredPhone(passwordToEdit.registered_phone || "");

      setShowPassword(false);
      setShowAtmPin(false);
      setShowMpin(false);
      setShowTxPassword(false);
    } else {
      setName("");
      setUsername("");
      setPassword("");
      setWebsiteUrl("");
      setCategory("General");
      setNotes("");

      setAccountNumber("");
      setIfscCode("");
      setAccountType("Savings");
      setCustomerId("");
      setAccountHolderName("");
      setBranchName("");
      setAtmPin("");
      setMpin("");
      setTransactionPassword("");
      setRegisteredPhone("");

      setShowPassword(false);
      setShowAtmPin(false);
      setShowMpin(false);
      setShowTxPassword(false);
    }
  }, [passwordToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(
        isBank
          ? "Please enter a Bank Name (e.g. HDFC Bank)"
          : "Please enter an App/Website name",
      );
      return;
    }
    if (!username.trim()) {
      toast.error(
        isBank
          ? "Please enter a Netbanking User ID / Login ID"
          : "Please enter a username or email",
      );
      return;
    }
    if (!password) {
      toast.error("Please enter a password");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        username: username.trim(),
        password,
        website_url: websiteUrl.trim() || null,
        category,
        notes: notes.trim() || null,
        account_number: isBank ? accountNumber.trim() || null : null,
        ifsc_code: isBank ? ifscCode.trim().toUpperCase() || null : null,
        account_type: isBank ? accountType.trim() || null : null,
        customer_id: isBank ? customerId.trim() || null : null,
        account_holder_name: isBank ? accountHolderName.trim() || null : null,
        branch_name: isBank ? branchName.trim() || null : null,
        atm_pin: isBank ? atmPin.trim() || null : null,
        mpin: isBank ? mpin.trim() || null : null,
        transaction_password: isBank ? transactionPassword.trim() || null : null,
        registered_phone: isBank ? registeredPhone.trim() || null : null,
      };

      if (passwordToEdit) {
        await editPassword(passwordToEdit.id, payload);
      } else {
        await addPassword(payload);
      }
      setOpen(false);
    } catch {
      // Error handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={dialogShellClass}>
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Desktop Only Header */}
          <div
            className={cn(
              "hidden border-b px-6 py-3.5 transition-colors sm:block",
              isBank
                ? "border-blue-100 bg-gradient-to-b from-blue-50/80 to-transparent dark:border-blue-950/60 dark:from-blue-950/30"
                : "border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-transparent dark:border-emerald-950/60 dark:from-emerald-950/30",
            )}
          >
            <DialogHeader className="space-y-0.5 text-left">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md ring-4",
                    isBank
                      ? "bg-blue-600 shadow-blue-600/25 ring-blue-100 dark:ring-blue-950/50"
                      : "bg-emerald-600 shadow-emerald-600/25 ring-emerald-100 dark:ring-emerald-950/50",
                  )}
                >
                  {isBank ? (
                    <Building2 className="size-4.5" />
                  ) : (
                    <KeyRound className="size-4.5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                    {passwordToEdit
                      ? isBank
                        ? "Edit Bank Account & Credentials"
                        : "Edit Credential"
                      : isBank
                        ? "Add Bank Account & Credentials"
                        : "Add Credential"}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {isBank
                      ? "Store account numbers, IFSC, ATM PIN, MPIN & Netbanking login."
                      : "Save login credentials for an app or website."}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <DialogTitle className="sr-only sm:hidden">
            {passwordToEdit
              ? isBank
                ? "Edit Bank Account & Credentials"
                : "Edit Credential"
              : isBank
                ? "Add Bank Account & Credentials"
                : "Add Credential"}
          </DialogTitle>

          {/* Form Body */}
          <div className="space-y-3 px-5 py-3.5 sm:px-6">
            {/* Category Chips */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Category
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {PASSWORD_CATEGORIES.map((cat) => {
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-bold transition-all",
                        active
                          ? cat === "Bank"
                            ? "border-blue-400 bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-400 dark:border-blue-600 dark:bg-blue-950/60 dark:text-blue-200"
                            : "border-emerald-400 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-400 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-200"
                          : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                      )}
                    >
                      {cat === "Bank" && <Building2 className="size-3" />}
                      <span>{cat}</span>
                      {active && (
                        <Check
                          className={cn(
                            "size-3",
                            cat === "Bank"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-emerald-600",
                          )}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name / Bank Name */}
            <div className="space-y-1">
              <Label
                htmlFor="pwd-name"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {isBank ? "Bank Name" : "App / Website Name"}{" "}
                <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="pwd-name"
                placeholder={
                  isBank
                    ? "e.g. HDFC Bank, State Bank of India, ICICI Bank"
                    : "e.g. GitHub, Netflix, Amazon, Work Email"
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* If Bank Category: Show Bank Specific Fields */}
            {isBank && (
              <div className="space-y-2.5 rounded-2xl border border-blue-200/70 bg-blue-50/30 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                  <Building2 className="size-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Account & Branch Details</span>
                </div>

                {/* Account Number & IFSC Code */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label
                      htmlFor="pwd-acc"
                      className="text-[11px] font-bold text-slate-700 dark:text-slate-300"
                    >
                      Account Number
                    </Label>
                    <Input
                      id="pwd-acc"
                      placeholder="e.g. 50100234567890"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className={cn(inputClass, "font-mono")}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="pwd-ifsc"
                      className="text-[11px] font-bold text-slate-700 dark:text-slate-300"
                    >
                      IFSC Code
                    </Label>
                    <Input
                      id="pwd-ifsc"
                      placeholder="e.g. HDFC0001234"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      className={cn(inputClass, "font-mono uppercase")}
                    />
                  </div>
                </div>

                {/* Customer ID & Account Type */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label
                      htmlFor="pwd-cif"
                      className="text-[11px] font-bold text-slate-700 dark:text-slate-300"
                    >
                      Customer ID / CIF
                    </Label>
                    <Input
                      id="pwd-cif"
                      placeholder="e.g. 84729103"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className={cn(inputClass, "font-mono")}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="pwd-acctype"
                      className="text-[11px] font-bold text-slate-700 dark:text-slate-300"
                    >
                      Account Type
                    </Label>
                    <select
                      id="pwd-acctype"
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value)}
                      className={cn(
                        inputClass,
                        "w-full px-2.5 font-medium text-xs bg-white dark:bg-slate-900",
                      )}
                    >
                      {ACCOUNT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Account Holder Name & Branch Name */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label
                      htmlFor="pwd-holder"
                      className="text-[11px] font-bold text-slate-700 dark:text-slate-300"
                    >
                      Account Holder Name
                    </Label>
                    <Input
                      id="pwd-holder"
                      placeholder="Name on bank records"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="pwd-branch"
                      className="text-[11px] font-bold text-slate-700 dark:text-slate-300"
                    >
                      Branch / City
                    </Label>
                    <Input
                      id="pwd-branch"
                      placeholder="e.g. Indiranagar, Bangalore"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Registered Phone */}
                <div className="space-y-1">
                  <Label
                    htmlFor="pwd-phone"
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300"
                  >
                    <Phone className="size-3 text-slate-400" />
                    Registered Mobile Number
                  </Label>
                  <Input
                    id="pwd-phone"
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={registeredPhone}
                    onChange={(e) => setRegisteredPhone(e.target.value)}
                    className={cn(inputClass, "font-mono")}
                  />
                </div>

                {/* Security PINs: ATM PIN & MPIN */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {/* ATM PIN */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="pwd-atmpin"
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300"
                    >
                      <CreditCard className="size-3 text-slate-400" />
                      ATM / Card PIN
                    </Label>
                    <div className="relative">
                      <Input
                        id="pwd-atmpin"
                        type={showAtmPin ? "text" : "password"}
                        placeholder="e.g. 4-digit PIN"
                        value={atmPin}
                        onChange={(e) => setAtmPin(e.target.value)}
                        className={cn(inputClass, "pr-8 font-mono")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAtmPin(!showAtmPin)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showAtmPin ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* App MPIN */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="pwd-mpin"
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300"
                    >
                      <Lock className="size-3 text-slate-400" />
                      App MPIN
                    </Label>
                    <div className="relative">
                      <Input
                        id="pwd-mpin"
                        type={showMpin ? "text" : "password"}
                        placeholder="e.g. 6-digit MPIN"
                        value={mpin}
                        onChange={(e) => setMpin(e.target.value)}
                        className={cn(inputClass, "pr-8 font-mono")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowMpin(!showMpin)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showMpin ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transaction Password */}
                <div className="space-y-1">
                  <Label
                    htmlFor="pwd-txpass"
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300"
                  >
                    <ShieldAlert className="size-3 text-slate-400" />
                    Transaction / Profile Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="pwd-txpass"
                      type={showTxPassword ? "text" : "password"}
                      placeholder="Optional fund transfer password"
                      value={transactionPassword}
                      onChange={(e) => setTransactionPassword(e.target.value)}
                      className={cn(inputClass, "pr-8 font-mono")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowTxPassword(!showTxPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showTxPassword ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Netbanking User ID / Login ID */}
            <div className="space-y-1">
              <Label
                htmlFor="pwd-username"
                className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <User className="size-3.5 text-slate-400" />
                {isBank ? "Netbanking User ID / Customer ID" : "Username / Email"}{" "}
                <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="pwd-username"
                placeholder={
                  isBank
                    ? "e.g. HDFC Customer ID or Netbanking Username"
                    : "e.g. john@example.com or user123"
                }
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Netbanking Login Password */}
            <div className="space-y-1">
              <Label
                htmlFor="pwd-pass"
                className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <Lock className="size-3.5 text-slate-400" />
                {isBank ? "Netbanking Login Password" : "Password"}{" "}
                <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="pwd-pass"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter login password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(inputClass, "pr-10 font-mono")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Website / Netbanking Portal URL */}
            <div className="space-y-1">
              <Label
                htmlFor="pwd-url"
                className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <Globe className="size-3.5 text-slate-400" />
                {isBank ? "Netbanking Portal URL" : "Website URL"}
              </Label>
              <Input
                id="pwd-url"
                type="url"
                placeholder={
                  isBank
                    ? "https://netbanking.hdfcbank.com"
                    : "https://example.com"
                }
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label
                htmlFor="pwd-notes"
                className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <FileText className="size-3.5 text-slate-400" />
                Notes
              </Label>
              <Input
                id="pwd-notes"
                placeholder="Optional recovery hints, branch phone, or notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-5 pt-3 pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))] dark:border-slate-800 dark:bg-slate-900/50 sm:justify-end sm:px-6 sm:pb-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "h-10 w-full gap-2 rounded-xl px-5 text-xs font-bold text-white shadow-lg active:scale-[0.98] sm:h-9.5 sm:w-auto sm:min-w-[140px]",
                isBank
                  ? "bg-blue-600 shadow-blue-600/25 hover:bg-blue-500"
                  : "bg-emerald-600 shadow-emerald-600/25 hover:bg-emerald-500",
              )}
            >
              <Send className="size-3.5" />
              <span>
                {isSubmitting
                  ? "Saving..."
                  : passwordToEdit
                    ? isBank
                      ? "Update Bank Details"
                      : "Update Credential"
                    : isBank
                      ? "Save Bank Details"
                      : "Save Credential"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
