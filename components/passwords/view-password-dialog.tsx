"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PasswordItem } from "@/types/password";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  User,
  Lock,
  Globe,
  FileText,
  Calendar,
  Pencil,
  Building2,
  CreditCard,
  Phone,
  ShieldAlert,
  Hash,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface ViewPasswordDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  password: PasswordItem | null;
  onEdit: (item: PasswordItem) => void;
}

export function ViewPasswordDialog({
  open,
  setOpen,
  password,
  onEdit,
}: ViewPasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showAtmPin, setShowAtmPin] = useState(false);
  const [showMpin, setShowMpin] = useState(false);
  const [showTxPassword, setShowTxPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!password) return null;

  const isBank = password.category === "Bank" || !!password.account_number;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-full sm:w-[min(calc(100vw-1.5rem),34rem)] sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl rounded-b-none sm:rounded-3xl border-slate-200/90 p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        {/* Header */}
        <div
          className={cn(
            "relative border-b px-5 py-3.5 transition-colors sm:px-6",
            isBank
              ? "border-blue-100 bg-gradient-to-b from-blue-50/80 to-transparent dark:border-blue-950/60 dark:from-blue-950/30"
              : "border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-transparent dark:border-emerald-950/60 dark:from-emerald-950/30",
          )}
        >
          <DialogHeader className="space-y-0.5 text-left">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl text-base font-black text-white shadow-md ring-4",
                  isBank
                    ? "bg-blue-600 shadow-blue-600/25 ring-blue-100 dark:ring-blue-950/50"
                    : "bg-emerald-600 shadow-emerald-600/25 ring-emerald-100 dark:ring-emerald-950/50",
                )}
              >
                {isBank ? (
                  <Building2 className="size-5" />
                ) : (
                  password.name.charAt(0).toUpperCase()
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                    {password.name}
                  </DialogTitle>
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase",
                      isBank
                        ? "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
                    )}
                  >
                    {password.category || "General"}
                  </span>
                </div>
                <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {isBank
                    ? "Bank account & netbanking credentials"
                    : "Stored credential details"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content Details */}
        <div className="space-y-3 px-5 py-3.5 sm:px-6">
          {/* Banking Details Card */}
          {isBank && (
            <div className="space-y-2.5 rounded-2xl border border-blue-200/70 bg-blue-50/30 p-3.5 dark:border-blue-900/40 dark:bg-blue-950/20">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-blue-600 dark:text-blue-400" />
                  Bank Account Information
                </span>
                {password.account_type && (
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                    {password.account_type}
                  </span>
                )}
              </div>

              {/* Account Number */}
              {password.account_number && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Account Number
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                      {password.account_number}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    onClick={() =>
                      copyToClipboard(password.account_number!, "Account Number")
                    }
                  >
                    {copiedField === "Account Number" ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </div>
              )}

              {/* IFSC Code & Customer ID */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {password.ifsc_code && (
                  <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        IFSC Code
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {password.ifsc_code}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      onClick={() =>
                        copyToClipboard(password.ifsc_code!, "IFSC Code")
                      }
                    >
                      {copiedField === "IFSC Code" ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                )}

                {password.customer_id && (
                  <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Customer ID / CIF
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {password.customer_id}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      onClick={() =>
                        copyToClipboard(password.customer_id!, "Customer ID")
                      }
                    >
                      {copiedField === "Customer ID" ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* ATM PIN & MPIN */}
              {(password.atm_pin || password.mpin) && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {password.atm_pin && (
                    <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          ATM / Card PIN
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {showAtmPin ? password.atm_pin : "••••"}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          onClick={() => setShowAtmPin(!showAtmPin)}
                        >
                          {showAtmPin ? (
                            <EyeOff className="size-3.5" />
                          ) : (
                            <Eye className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          onClick={() =>
                            copyToClipboard(password.atm_pin!, "ATM PIN")
                          }
                        >
                          {copiedField === "ATM PIN" ? (
                            <Check className="size-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {password.mpin && (
                    <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          App MPIN
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {showMpin ? password.mpin : "••••••"}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          onClick={() => setShowMpin(!showMpin)}
                        >
                          {showMpin ? (
                            <EyeOff className="size-3.5" />
                          ) : (
                            <Eye className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          onClick={() =>
                            copyToClipboard(password.mpin!, "MPIN")
                          }
                        >
                          {copiedField === "MPIN" ? (
                            <Check className="size-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Transaction Password */}
              {password.transaction_password && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Transaction / Profile Password
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {showTxPassword
                        ? password.transaction_password
                        : "••••••••••••"}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      onClick={() => setShowTxPassword(!showTxPassword)}
                    >
                      {showTxPassword ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      onClick={() =>
                        copyToClipboard(
                          password.transaction_password!,
                          "Transaction Password",
                        )
                      }
                    >
                      {copiedField === "Transaction Password" ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Account Holder, Branch, Phone */}
              {(password.account_holder_name ||
                password.branch_name ||
                password.registered_phone) && (
                <div className="space-y-1 rounded-xl bg-white/60 p-2.5 text-xs dark:bg-slate-900/60">
                  {password.account_holder_name && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Holder:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {password.account_holder_name}
                      </span>
                    </div>
                  )}
                  {password.branch_name && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Branch:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {password.branch_name}
                      </span>
                    </div>
                  )}
                  {password.registered_phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reg. Phone:</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {password.registered_phone}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Username / Login ID Card */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <User className="size-3" />
                <span>
                  {isBank ? "Netbanking User ID / Login ID" : "Username / Email"}
                </span>
              </div>
              <p className="mt-0.5 truncate font-mono text-sm font-bold text-slate-900 dark:text-white">
                {password.username}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              onClick={() =>
                copyToClipboard(
                  password.username,
                  isBank ? "Netbanking User ID" : "Username",
                )
              }
              title="Copy Login ID"
            >
              {copiedField === (isBank ? "Netbanking User ID" : "Username") ? (
                <Check className="size-4 text-emerald-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>

          {/* Login Password Card */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Lock className="size-3" />
                <span>{isBank ? "Netbanking Login Password" : "Password"}</span>
              </div>
              <p className="mt-0.5 truncate font-mono text-sm font-bold text-slate-900 dark:text-white">
                {showPassword ? password.password : "••••••••••••••••"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                onClick={() =>
                  copyToClipboard(
                    password.password,
                    isBank ? "Netbanking Password" : "Password",
                  )
                }
                title="Copy Password"
              >
                {copiedField === (isBank ? "Netbanking Password" : "Password") ? (
                  <Check className="size-4 text-emerald-600" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Website / Portal URL */}
          {password.website_url && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <Globe className="size-3" />
                  <span>{isBank ? "Netbanking Portal Link" : "Website URL"}</span>
                </div>
                <a
                  href={
                    password.website_url.startsWith("http")
                      ? password.website_url
                      : `https://${password.website_url}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 block truncate text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  {password.website_url}
                </a>
              </div>
              <a
                href={
                  password.website_url.startsWith("http")
                    ? password.website_url
                    : `https://${password.website_url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-emerald-600"
                title="Open Website"
              >
                <ExternalLink className="size-4" />
              </a>
            </div>
          )}

          {/* Notes */}
          {password.notes && (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <FileText className="size-3" />
                <span>Notes</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300">
                {password.notes}
              </p>
            </div>
          )}

          {/* Timestamp */}
          {password.created_at && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Calendar className="size-3" />
              <span>
                Added {format(parseISO(password.created_at), "MMM d, yyyy")}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:justify-between sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-xl text-xs font-bold"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            className={cn(
              "h-9 gap-1.5 rounded-xl px-4 text-xs font-bold text-white shadow-md",
              isBank
                ? "bg-blue-600 shadow-blue-600/25 hover:bg-blue-500"
                : "bg-emerald-600 shadow-emerald-600/25 hover:bg-emerald-500",
            )}
            onClick={() => {
              setOpen(false);
              onEdit(password);
            }}
          >
            <Pencil className="size-3.5" />
            <span>Edit {isBank ? "Bank Details" : "Credential"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
