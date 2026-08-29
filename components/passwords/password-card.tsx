"use client";

import React, { useState } from "react";
import { PasswordItem } from "@/types/password";
import { usePasswordsStore } from "@/hooks/use-passwords-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Pencil,
  Trash2,
  Lock,
  User,
  Globe,
} from "lucide-react";

interface PasswordCardProps {
  item: PasswordItem;
  onView: (item: PasswordItem) => void;
  onEdit: (item: PasswordItem) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  General: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800",
  Bank: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  Work: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
  Personal: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
  Finance: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  Entertainment: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  Social: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
  Other: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800",
};

export function PasswordCard({ item, onView, onEdit }: PasswordCardProps) {
  const { selectedIds, toggleSelectId, removePassword } = usePasswordsStore();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const isSelected = selectedIds.includes(item.id);
  const isBank = item.category === "Bank" || !!item.account_number;

  const copyToClipboard = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const catStyle =
    CATEGORY_COLORS[item.category] || CATEGORY_COLORS.General;

  return (
    <div
      onClick={() => onView(item)}
      className={cn(
        "group relative flex cursor-pointer flex-col justify-between rounded-2xl border bg-white p-4 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-md dark:bg-slate-900/90 dark:hover:border-slate-700",
        isSelected
          ? "border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/20"
          : "border-slate-200/80 dark:border-slate-800",
      )}
    >
      {/* Top Row: Selection Checkbox + Logo/Name + Category Badge + Actions */}
      <div>
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleSelectId(item.id)}
                className="size-4.5 rounded-md border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
            </div>
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-black shadow-2xs",
                isBank
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
              )}
            >
              {isBank ? (
                <span className="text-xs font-black tracking-tight">BANK</span>
              ) : (
                item.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors dark:text-white dark:group-hover:text-emerald-400">
                {item.name}
              </h3>
              {item.website_url ? (
                <a
                  href={
                    item.website_url.startsWith("http")
                      ? item.website_url
                      : `https://${item.website_url}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 truncate text-[11px] font-medium text-slate-400 hover:text-emerald-600 hover:underline dark:hover:text-emerald-400"
                >
                  <Globe className="size-3 shrink-0" />
                  <span className="truncate">
                    {item.website_url.replace(/^https?:\/\/(www\.)?/, "")}
                  </span>
                  <ExternalLink className="size-2.5 shrink-0 opacity-60" />
                </a>
              ) : item.ifsc_code ? (
                <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  IFSC: {item.ifsc_code}
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-400">
                  {item.category || "General"}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span
              className={cn(
                "hidden rounded-lg border px-2 py-0.5 text-[10px] font-bold tracking-wide sm:inline-block",
                catStyle,
              )}
            >
              {item.category || "General"}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-700 dark:hover:text-white transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              title="Edit Credential"
            >
              <Pencil className="size-3.5" />
            </Button>

            <div onClick={(e) => e.stopPropagation()}>
              <ConfirmDialog
                title={`Delete ${item.name}`}
                description="Are you sure you want to delete this entry? This action cannot be undone."
                onConfirm={() => removePassword(item.id)}
                variant="destructive"
                confirmText="Delete"
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 transition-opacity"
                    title="Delete Credential"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                }
              />
            </div>
          </div>
        </div>

        {/* Bank Account Number Quick Row (if available) */}
        {item.account_number && (
          <div className="mt-2.5 flex items-center justify-between rounded-xl border border-blue-200/60 bg-blue-50/50 px-2.5 py-1.5 text-xs dark:border-blue-900/40 dark:bg-blue-950/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              A/C:{" "}
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {item.account_number}
              </span>
            </span>
            <button
              type="button"
              onClick={(e) =>
                copyToClipboard(e, item.account_number!, "Account Number")
              }
              className="flex size-5 items-center justify-center rounded text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50"
              title="Copy Account Number"
            >
              {copiedField === "Account Number" ? (
                <Check className="size-3 text-emerald-600" />
              ) : (
                <Copy className="size-3" />
              )}
            </button>
          </div>
        )}

        {/* Credentials Rows */}
        <div className="mt-3.5 space-y-2 rounded-xl bg-slate-50/70 p-2.5 dark:bg-slate-950/50">
          {/* Username / Email */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <User className="size-3 text-slate-400 shrink-0" />
              <span className="truncate font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                {item.username}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => copyToClipboard(e, item.username, "Username")}
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white hover:text-slate-700 hover:shadow-2xs dark:hover:bg-slate-800 dark:hover:text-white"
              title="Copy Username"
            >
              {copiedField === "Username" ? (
                <Check className="size-3 text-emerald-600" />
              ) : (
                <Copy className="size-3" />
              )}
            </button>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between gap-2 border-t border-slate-200/50 pt-1.5 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5 min-w-0">
              <Lock className="size-3 text-slate-400 shrink-0" />
              <span className="truncate font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                {showPassword ? item.password : "••••••••••••"}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPassword(!showPassword);
                }}
                className="flex size-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white hover:text-slate-700 hover:shadow-2xs dark:hover:bg-slate-800 dark:hover:text-white"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-3" />
                ) : (
                  <Eye className="size-3" />
                )}
              </button>
              <button
                type="button"
                onClick={(e) => copyToClipboard(e, item.password, "Password")}
                className="flex size-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white hover:text-slate-700 hover:shadow-2xs dark:hover:bg-slate-800 dark:hover:text-white"
                title="Copy Password"
              >
                {copiedField === "Password" ? (
                  <Check className="size-3 text-emerald-600" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Notes */}
      {item.notes && (
        <div className="mt-2.5">
          <p className="line-clamp-1 text-[11px] italic text-slate-400">
            {item.notes}
          </p>
        </div>
      )}
    </div>
  );
}
