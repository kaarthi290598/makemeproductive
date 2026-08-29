"use client";

import React, { useState } from "react";
import { PasswordItem } from "@/types/password";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Copy,
  Check,
  User,
  Lock,
  Building2,
  ExternalLink,
  CreditCard,
  Hash,
  Eye,
  EyeOff,
} from "lucide-react";

interface PasswordQuickCopyViewProps {
  items: PasswordItem[];
}

export function PasswordQuickCopyView({ items }: PasswordQuickCopyViewProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<string[]>([]);

  const toggleReveal = (id: string) => {
    setRevealedPasswords((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const copyField = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    const key = `${id}-${label}`;
    setCopiedKey(key);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const isBank = item.category === "Bank" || !!item.account_number;
        const isRevealed = revealedPasswords.includes(item.id);

        return (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-black",
                      isBank
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                    )}
                  >
                    {isBank ? (
                      <Building2 className="size-4" />
                    ) : (
                      item.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.category || "General"}
                    </span>
                  </div>
                </div>

                {item.website_url && (
                  <a
                    href={
                      item.website_url.startsWith("http")
                        ? item.website_url
                        : `https://${item.website_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800"
                    title="Open Website"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>

              {/* Actionable Copy Buttons Group */}
              <div className="mt-3 space-y-2">
                {/* Username / User ID Copy Button */}
                <button
                  type="button"
                  onClick={() =>
                    copyField(
                      item.username,
                      item.id,
                      isBank ? "Netbanking User ID" : "Username",
                    )
                  }
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 text-left transition-all hover:border-emerald-300 hover:bg-emerald-50/30 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-emerald-700"
                >
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {isBank ? "User ID" : "Username"}
                    </span>
                    <span className="block truncate font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {item.username}
                    </span>
                  </div>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors">
                    {copiedKey ===
                    `${item.id}-${isBank ? "Netbanking User ID" : "Username"}` ? (
                      <Check className="size-4 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </span>
                </button>

                {/* Password Copy Button */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      copyField(
                        item.password,
                        item.id,
                        isBank ? "Netbanking Password" : "Password",
                      )
                    }
                    className="flex flex-1 items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 text-left transition-all hover:border-emerald-300 hover:bg-emerald-50/30 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-emerald-700"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {isBank ? "Login Password" : "Password"}
                      </span>
                      <span className="block truncate font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {isRevealed ? item.password : "••••••••••••"}
                      </span>
                    </div>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors">
                      {copiedKey ===
                      `${item.id}-${isBank ? "Netbanking Password" : "Password"}` ? (
                        <Check className="size-4 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleReveal(item.id)}
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/70 bg-slate-50/80 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-800 dark:hover:text-white"
                    title={isRevealed ? "Hide password" : "Show password"}
                  >
                    {isRevealed ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>

                {/* If Bank: Quick Copy for Account Number & IFSC & PINs */}
                {isBank && (
                  <div className="space-y-1.5 pt-1">
                    {/* Account Number */}
                    {item.account_number && (
                      <button
                        type="button"
                        onClick={() =>
                          copyField(
                            item.account_number!,
                            item.id,
                            "Account Number",
                          )
                        }
                        className="flex w-full items-center justify-between rounded-xl border border-blue-200/60 bg-blue-50/40 px-3 py-1.5 text-left transition-all hover:bg-blue-100/50 dark:border-blue-900/40 dark:bg-blue-950/30"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                            Account Number
                          </span>
                          <span className="block truncate font-mono text-xs font-bold text-slate-900 dark:text-white">
                            {item.account_number}
                          </span>
                        </div>
                        <span className="text-blue-600 dark:text-blue-400">
                          {copiedKey === `${item.id}-Account Number` ? (
                            <Check className="size-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </span>
                      </button>
                    )}

                    {/* IFSC Code */}
                    {item.ifsc_code && (
                      <button
                        type="button"
                        onClick={() =>
                          copyField(item.ifsc_code!, item.id, "IFSC Code")
                        }
                        className="flex w-full items-center justify-between rounded-xl border border-blue-200/60 bg-blue-50/40 px-3 py-1.5 text-left transition-all hover:bg-blue-100/50 dark:border-blue-900/40 dark:bg-blue-950/30"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                            IFSC Code
                          </span>
                          <span className="block font-mono text-xs font-bold text-slate-900 dark:text-white">
                            {item.ifsc_code}
                          </span>
                        </div>
                        <span className="text-blue-600 dark:text-blue-400">
                          {copiedKey === `${item.id}-IFSC Code` ? (
                            <Check className="size-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </span>
                      </button>
                    )}

                    {/* ATM PIN / MPIN Quick Row */}
                    {(item.atm_pin || item.mpin) && (
                      <div className="grid grid-cols-2 gap-1.5">
                        {item.atm_pin && (
                          <button
                            type="button"
                            onClick={() =>
                              copyField(item.atm_pin!, item.id, "ATM PIN")
                            }
                            className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/80 px-2.5 py-1 text-left hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60"
                          >
                            <div>
                              <span className="block text-[9px] font-bold uppercase text-slate-400">
                                ATM PIN
                              </span>
                              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                                {item.atm_pin}
                              </span>
                            </div>
                            <span>
                              {copiedKey === `${item.id}-ATM PIN` ? (
                                <Check className="size-3 text-emerald-600" />
                              ) : (
                                <Copy className="size-3 text-slate-400" />
                              )}
                            </span>
                          </button>
                        )}

                        {item.mpin && (
                          <button
                            type="button"
                            onClick={() =>
                              copyField(item.mpin!, item.id, "MPIN")
                            }
                            className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/80 px-2.5 py-1 text-left hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60"
                          >
                            <div>
                              <span className="block text-[9px] font-bold uppercase text-slate-400">
                                MPIN
                              </span>
                              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                                {item.mpin}
                              </span>
                            </div>
                            <span>
                              {copiedKey === `${item.id}-MPIN` ? (
                                <Check className="size-3 text-emerald-600" />
                              ) : (
                                <Copy className="size-3 text-slate-400" />
                              )}
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Notes preview */}
            {item.notes && (
              <p className="mt-2.5 line-clamp-1 text-[10px] italic text-slate-400">
                {item.notes}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
