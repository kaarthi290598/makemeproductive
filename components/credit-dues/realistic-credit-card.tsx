"use client";

import React from "react";
import {
  CreditDueItem,
  calculateRemainingDue,
  calculateUtilization,
  calculateAvailableCredit,
} from "@/types/credit-due";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface RealisticCreditCardProps {
  account: CreditDueItem;
  className?: string;
}

// Generate luxury theme based on card name
function getCardTheme(name: string) {
  const n = name.toLowerCase();
  if (n.includes("amazon") || n.includes("icici") || n.includes("gold")) {
    return {
      bgGradient: "from-zinc-900 via-neutral-900 to-stone-900",
      accentColor: "text-amber-400",
      borderGlow: "border-amber-500/25 ring-1 ring-amber-500/10",
      ambientGlow: "bg-amber-500/10",
      chipGold: true,
      cardType: "PREMIUM REWARDS",
      network: "mastercard",
    };
  }
  if (
    n.includes("hdfc") ||
    n.includes("regalia") ||
    n.includes("millennia") ||
    n.includes("infinia")
  ) {
    return {
      bgGradient: "from-slate-950 via-slate-900 to-blue-950",
      accentColor: "text-sky-400",
      borderGlow: "border-blue-500/30 ring-1 ring-blue-500/10",
      ambientGlow: "bg-blue-500/15",
      chipGold: true,
      cardType: "INFINIA / WORLD",
      network: "visa",
    };
  }
  if (n.includes("axis") || n.includes("magnus") || n.includes("flipkart") || n.includes("neo")) {
    return {
      bgGradient: "from-neutral-950 via-zinc-900 to-rose-950",
      accentColor: "text-rose-400",
      borderGlow: "border-rose-500/25 ring-1 ring-rose-500/10",
      ambientGlow: "bg-rose-500/15",
      chipGold: true,
      cardType: "TITANIUM PRIVILEGE",
      network: "mastercard",
    };
  }
  if (n.includes("sbi") || n.includes("simply")) {
    return {
      bgGradient: "from-slate-950 via-zinc-900 to-cyan-950",
      accentColor: "text-cyan-400",
      borderGlow: "border-cyan-500/25 ring-1 ring-cyan-500/10",
      ambientGlow: "bg-cyan-500/15",
      chipGold: true,
      cardType: "SIGNATURE ELITE",
      network: "visa",
    };
  }
  if (n.includes("slice") || n.includes("onecard") || n.includes("uni")) {
    return {
      bgGradient: "from-zinc-950 via-neutral-900 to-purple-950",
      accentColor: "text-purple-400",
      borderGlow: "border-purple-500/25 ring-1 ring-purple-500/10",
      ambientGlow: "bg-purple-500/15",
      chipGold: false,
      cardType: "METAL BLACK",
      network: "visa",
    };
  }
  // Default Obsidian Platinum
  return {
    bgGradient: "from-zinc-950 via-neutral-900 to-black",
    accentColor: "text-slate-300",
    borderGlow: "border-white/15 ring-1 ring-white/10",
    ambientGlow: "bg-white/5",
    chipGold: true,
    cardType: "PLATINUM METAL",
    network: "mastercard",
  };
}

export function RealisticCreditCard({
  account,
  className,
}: RealisticCreditCardProps) {
  const theme = getCardTheme(account.name);
  const remainingDue = calculateRemainingDue(account);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border bg-gradient-to-br p-5 text-white shadow-2xl transition-all duration-300 select-none",
        theme.bgGradient,
        theme.borderGlow,
        className,
      )}
      style={{
        aspectRatio: "1.586 / 1",
        boxShadow:
          "0 20px 35px -10px rgba(0,0,0,0.6), inset 0 1px 1px 0 rgba(255,255,255,0.15)",
      }}
    >
      {/* Specular Diagonal Reflection Sheen */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/5 blur-2xl" />
      <div
        className={cn(
          "pointer-events-none absolute -left-12 -bottom-12 size-48 rounded-full blur-2xl",
          theme.ambientGlow,
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08]" />

      {/* Card Content Container */}
      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* Top Row: Bank / Card Name + Contactless NFC Icon */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 pr-2">
            <span className="block font-mono text-[9px] font-black uppercase tracking-widest text-white/50">
              {theme.cardType}
            </span>
            <h4 className="truncate text-sm font-black tracking-tight text-white drop-shadow-sm sm:text-base">
              {account.name}
            </h4>
          </div>

          {/* Contactless Wave SVG */}
          <div className="shrink-0 text-white/70">
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M8.5 16.5a5 5 0 0 1 0-9" />
              <path d="M12 19a8.5 8.5 0 0 0 0-14" />
              <path d="M15.5 21.5a12 12 0 0 0 0-19" />
            </svg>
          </div>
        </div>

        {/* Middle Row: Realistic Gold / Silver EMV Microchip */}
        <div className="flex items-center justify-between my-auto py-1">
          {/* Vector EMV Chip */}
          <div className="relative size-auto">
            <svg
              className="h-7 w-9 sm:h-8 sm:w-11"
              viewBox="0 0 44 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="goldChipGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="35%" stopColor="#D97706" />
                  <stop offset="70%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
                <linearGradient
                  id="silverChipGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#F3F4F6" />
                  <stop offset="40%" stopColor="#9CA3AF" />
                  <stop offset="80%" stopColor="#D1D5DB" />
                  <stop offset="100%" stopColor="#6B7280" />
                </linearGradient>
              </defs>
              {/* Chip Body */}
              <rect
                width="44"
                height="32"
                rx="4"
                fill={theme.chipGold ? "url(#goldChipGrad)" : "url(#silverChipGrad)"}
                stroke="#78350F"
                strokeWidth="0.5"
              />
              {/* Circuit Micro-engravings */}
              <path
                d="M0 11H14V21H0M44 11H30V21H44M14 16H30M22 0V11M22 21V32M14 11V21M30 11V21"
                stroke="#78350F"
                strokeWidth="1"
                strokeOpacity="0.4"
              />
              <rect
                x="15"
                y="12"
                width="14"
                height="8"
                rx="1.5"
                fill={theme.chipGold ? "#FEF3C7" : "#F9FAFB"}
                fillOpacity="0.3"
                stroke="#78350F"
                strokeWidth="0.5"
              />
            </svg>
          </div>

          {/* Masked Card Digits */}
          <div className="font-mono text-xs font-bold tracking-[0.22em] text-white/80 drop-shadow-xs sm:text-sm">
            •••• •••• •••• 8899
          </div>
        </div>

        {/* Bottom Row: Remaining Due / Holder + Due Date + Card Network Logo */}
        <div className="flex items-end justify-between border-t border-white/10 pt-2.5">
          {/* Remaining Due */}
          <div>
            <span className="block font-mono text-[8px] font-bold uppercase tracking-wider text-white/50">
              Remaining Due
            </span>
            <p className="font-mono text-base font-black text-rose-300 drop-shadow-xs sm:text-lg">
              ₹{remainingDue.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Due Date */}
          <div className="text-center">
            <span className="block font-mono text-[8px] font-bold uppercase tracking-wider text-white/50">
              Payment Due
            </span>
            <p className="font-mono text-xs font-bold text-white/90">
              {account.due_date ? format(parseISO(account.due_date), "MM/yy") : "—"}
            </p>
          </div>

          {/* Card Network Logo (Mastercard / Visa) */}
          <div className="shrink-0">
            {theme.network === "visa" ? (
              <span className="font-serif text-sm font-black italic tracking-wider text-white/90 drop-shadow-xs sm:text-base">
                VISA
              </span>
            ) : (
              <div className="flex items-center -space-x-2 opacity-90">
                <div className="size-5 rounded-full bg-rose-500 shadow-xs sm:size-6" />
                <div className="size-5 rounded-full bg-amber-400 shadow-xs sm:size-6" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
