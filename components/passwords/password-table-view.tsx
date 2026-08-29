"use client";

import React, { useState } from "react";
import { PasswordItem } from "@/types/password";
import { usePasswordsStore } from "@/hooks/use-passwords-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
  Building2,
} from "lucide-react";

interface PasswordTableViewProps {
  items: PasswordItem[];
  onView: (item: PasswordItem) => void;
  onEdit: (item: PasswordItem) => void;
}

export function PasswordTableView({
  items,
  onView,
  onEdit,
}: PasswordTableViewProps) {
  const { selectedIds, toggleSelectId, removePassword } = usePasswordsStore();
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [copiedIdField, setCopiedIdField] = useState<string | null>(null);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const copyToClipboard = (
    e: React.MouseEvent,
    text: string,
    id: string,
    field: string,
  ) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    const key = `${id}-${field}`;
    setCopiedIdField(key);
    toast.success(`Copied ${field}`);
    setTimeout(() => setCopiedIdField(null), 1800);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
            <tr>
              <th className="w-10 px-3 py-3 text-center">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-3 py-3">App / Bank Name</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Username / Login ID</th>
              <th className="px-3 py-3">Password</th>
              <th className="px-3 py-3">Account / URL</th>
              <th className="w-24 px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isRevealed = revealedIds.includes(item.id);
              const isBank = item.category === "Bank" || !!item.account_number;

              return (
                <tr
                  key={item.id}
                  onClick={() => onView(item)}
                  className={cn(
                    "group cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
                    isSelected && "bg-emerald-50/30 dark:bg-emerald-950/20",
                  )}
                >
                  {/* Select Checkbox */}
                  <td
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-3 text-center"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectId(item.id)}
                      className="size-4 rounded border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                  </td>

                  {/* Name */}
                  <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-black",
                          isBank
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                        )}
                      >
                        {isBank ? (
                          <Building2 className="size-3.5" />
                        ) : (
                          item.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="truncate font-bold max-w-[140px] sm:max-w-[180px]">
                        {item.name}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase",
                        isBank
                          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                          : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300",
                      )}
                    >
                      {item.category || "General"}
                    </span>
                  </td>

                  {/* Username */}
                  <td className="px-3 py-3 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[130px] font-medium text-slate-700 dark:text-slate-300">
                        {item.username}
                      </span>
                      <button
                        type="button"
                        onClick={(e) =>
                          copyToClipboard(
                            e,
                            item.username,
                            item.id,
                            "Username",
                          )
                        }
                        className="flex size-6 shrink-0 items-center justify-center rounded text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                        title="Copy Username"
                      >
                        {copiedIdField === `${item.id}-Username` ? (
                          <Check className="size-3 text-emerald-600" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Password */}
                  <td className="px-3 py-3 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[100px] font-medium text-slate-700 dark:text-slate-300">
                        {isRevealed ? item.password : "••••••••"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReveal(item.id);
                        }}
                        className="flex size-6 shrink-0 items-center justify-center rounded text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                        title={isRevealed ? "Hide" : "Show"}
                      >
                        {isRevealed ? (
                          <EyeOff className="size-3" />
                        ) : (
                          <Eye className="size-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) =>
                          copyToClipboard(
                            e,
                            item.password,
                            item.id,
                            "Password",
                          )
                        }
                        className="flex size-6 shrink-0 items-center justify-center rounded text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                        title="Copy Password"
                      >
                        {copiedIdField === `${item.id}-Password` ? (
                          <Check className="size-3 text-emerald-600" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Account Number / URL */}
                  <td className="px-3 py-3">
                    {item.account_number ? (
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <span className="text-[11px] text-slate-500">
                          A/C: {item.account_number}
                        </span>
                        <button
                          type="button"
                          onClick={(e) =>
                            copyToClipboard(
                              e,
                              item.account_number!,
                              item.id,
                              "Account Number",
                            )
                          }
                          className="flex size-5 items-center justify-center rounded text-slate-400 hover:text-blue-600"
                          title="Copy Account Number"
                        >
                          {copiedIdField === `${item.id}-Account Number` ? (
                            <Check className="size-3 text-emerald-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    ) : item.website_url ? (
                      <a
                        href={
                          item.website_url.startsWith("http")
                            ? item.website_url
                            : `https://${item.website_url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-slate-400 hover:text-emerald-600"
                      >
                        <Globe className="size-3" />
                        <span className="truncate max-w-[120px]">
                          {item.website_url.replace(
                            /^https?:\/\/(www\.)?/,
                            "",
                          )}
                        </span>
                        <ExternalLink className="size-2.5" />
                      </a>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">
                        —
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-3 text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        onClick={() => onEdit(item)}
                        title="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <ConfirmDialog
                        title={`Delete ${item.name}`}
                        description="Are you sure you want to delete this entry?"
                        onConfirm={() => removePassword(item.id)}
                        variant="destructive"
                        confirmText="Delete"
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        }
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
