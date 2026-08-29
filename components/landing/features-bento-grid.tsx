"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  CreditCard,
  CalendarSync,
  Landmark,
  KeyRound,
  ShieldCheck,
  Building2,
  PieChart,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "expenses",
    title: "Intelligent Expense & Budgeting Engine",
    subtitle: "Categorized tracking with real-time budget utilization alerts.",
    icon: Wallet,
    color: "emerald",
    gradient: "from-emerald-500/15 via-teal-500/10 to-transparent",
    badge: "Cash Flow",
    highlights: [
      "Custom categories with visual color palettes",
      "Dynamic monthly budget limit thresholds",
      "Instant Income vs Expense flow breakdown",
    ],
    mockStat: "₹74,500 Saved this Month",
  },
  {
    id: "portfolio",
    title: "Net Worth & Asset Portfolio",
    subtitle: "Consolidate Stocks, Mutual Funds, Crypto, Gold, and Real Estate.",
    icon: TrendingUp,
    color: "sky",
    gradient: "from-sky-500/15 via-blue-500/10 to-transparent",
    badge: "Wealth Growth",
    highlights: [
      "Dynamic Net Worth (Assets minus Liabilities)",
      "Real-time ROI gain/loss percentages",
      "Interactive asset allocation charts",
    ],
    mockStat: "+18.4% All-Time Portfolio ROI",
  },
  {
    id: "credit-dues",
    title: "Credit Card & Dues Command Center",
    subtitle: "Monitor credit limits, utilization health, and avoid late payment fees.",
    icon: CreditCard,
    color: "rose",
    gradient: "from-rose-500/15 via-pink-500/10 to-transparent",
    badge: "Credit Health",
    highlights: [
      "Realistic Vector EMV microchip card interface",
      "Credit utilization meters (<30% safe threshold)",
      "Flexible mandatory fields: limit & balance",
    ],
    mockStat: "12.5% Safe Credit Utilization",
  },
  {
    id: "subscriptions",
    title: "Subscription Burn Hub",
    subtitle: "Calculate monthly normalized costs and auto-renewal schedules.",
    icon: CalendarSync,
    color: "purple",
    gradient: "from-indigo-500/15 via-purple-500/10 to-transparent",
    badge: "Recurring Bills",
    highlights: [
      "Normalized Monthly & Yearly burn rate",
      "Auto-renew countdowns (Due in 2 days)",
      "Instant billing frequency conversion",
    ],
    mockStat: "₹2,840 / month Normalized Burn",
  },
  {
    id: "debts",
    title: "Debt Payoff & Liabilities Tracker",
    subtitle: "Formulate repayment strategies with interest tracking and milestones.",
    icon: Landmark,
    color: "amber",
    gradient: "from-amber-500/15 via-yellow-500/10 to-transparent",
    badge: "Debt Free",
    highlights: [
      "Track principal vs interest liabilities",
      "Visual payoff progress bars per debt",
      "Milestone completion notifications",
    ],
    mockStat: "45% Debt Repayment Complete",
  },
  {
    id: "passwords",
    title: "Encrypted Banking & Password Vault",
    subtitle: "Store bank accounts, IFSC codes, MPINs, and login credentials safely.",
    icon: KeyRound,
    color: "teal",
    gradient: "from-teal-500/15 via-emerald-500/10 to-transparent",
    badge: "Zero-Knowledge",
    highlights: [
      "Dedicated Banking schema (IFSC, Account, MPIN)",
      "1-Click copy usernames, passwords & pins",
      "Clerk authenticated secure user tenancy",
    ],
    mockStat: "Bank-Grade Vault Isolation",
  },
];

export function FeaturesBentoGrid() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/80 px-3.5 py-1 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
            <Zap className="size-3.5 text-emerald-500" />
            <span>The 6-in-1 Financial Architecture</span>
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            Everything You Need. <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
              Zero Fragmented Tools.
            </span>
          </h2>
          <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400 sm:text-base">
            Engineered to replace your scattered spreadsheets, banking apps, and subscription trackers with a unified, high-performance executive cockpit.
          </p>
        </div>

        {/* Bento Grid 3x2 */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={cn(
                  "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white/70 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-2xl dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-slate-700",
                )}
              >
                {/* Background Gradient Accent */}
                <div
                  className={cn(
                    "pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-gradient-to-br blur-3xl transition-opacity duration-300 group-hover:opacity-100",
                    feature.gradient,
                  )}
                />

                <div>
                  {/* Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 shadow-sm transition-transform duration-300 group-hover:scale-105 dark:bg-slate-800 dark:text-white">
                      <Icon className="size-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors dark:text-white dark:group-hover:text-emerald-400">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                    {feature.subtitle}
                  </p>

                  {/* Highlights Checklist */}
                  <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600 dark:border-slate-800 dark:text-slate-400">
                    {feature.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Mock Stat Tag */}
                <div className="mt-6 rounded-xl border border-slate-200/60 bg-slate-50/80 px-3.5 py-2 text-[11px] font-bold text-slate-700 dark:border-slate-800/60 dark:bg-slate-950/60 dark:text-slate-300">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {feature.mockStat}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
