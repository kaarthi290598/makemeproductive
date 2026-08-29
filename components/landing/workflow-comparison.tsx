"use client";

import React from "react";
import { motion } from "framer-motion";
import { XCircle, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

export function WorkflowComparison() {
  const comparisons = [
    {
      aspect: "Expense Tracking",
      oldWay: "Multiple banking SMS, manual spreadsheets, delayed monthly reviews",
      toolCity: "Instant categorization, live budget burn limits, unified cash flow",
    },
    {
      aspect: "Credit Cards & Dues",
      oldWay: "Forgetting payment due dates, high interest penalties, blind utilization",
      toolCity: "Realistic EMV chip card views, utilization safety meters (<30%), statement countdowns",
    },
    {
      aspect: "Recurring Subscriptions",
      oldWay: "Unnoticed auto-debits, confusing monthly vs annual billing schedules",
      toolCity: "Normalized monthly/yearly burn rate with 14-day advance renewal alerts",
    },
    {
      aspect: "Net Worth & Assets",
      oldWay: "Manually calculating stocks, mutual funds, gold, and debt balances",
      toolCity: "Real-time Net Worth calculation (Assets minus Debts) with ROI percentage badges",
    },
    {
      aspect: "Banking & Vault Security",
      oldWay: "Notes app plaintext, insecure WhatsApp chats, forgotten IFSC/MPINs",
      toolCity: "Encrypted password vault with dedicated banking credentials and 1-click copy",
    },
  ];

  return (
    <section id="command-center" className="relative py-20 bg-slate-50/50 dark:bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Why Switch to <span className="text-emerald-600 dark:text-emerald-400">ToolCity</span>?
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
            Stop juggling 5 different apps. Experience unified financial clarity in a single cockpit.
          </p>
        </div>

        {/* Comparison Table / Cards */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 divide-y divide-slate-200 dark:divide-slate-800 md:grid-cols-2 md:divide-x md:divide-y-0">
            {/* Left Column: The Old Way */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  <XCircle className="size-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  The Old Fragmented Way
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Disconnected spreadsheets, missed due dates, and security risks.
              </p>

              <div className="mt-6 space-y-4">
                {comparisons.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 text-xs dark:border-rose-950/50 dark:bg-rose-950/20"
                  >
                    <span className="font-bold text-rose-900 dark:text-rose-200">
                      {c.aspect}
                    </span>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">
                      {c.oldWay}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: ToolCity Command Center */}
            <div className="bg-emerald-50/20 p-6 dark:bg-emerald-950/10 sm:p-8">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="size-4" />
                </span>
                <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-300">
                  The ToolCity Executive Experience
                </h3>
              </div>
              <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-400/80">
                Unified real-time cockpit with zero latency and complete privacy.
              </p>

              <div className="mt-6 space-y-4">
                {comparisons.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-emerald-200/80 bg-white p-4 text-xs shadow-2xs dark:border-emerald-800/60 dark:bg-slate-900"
                  >
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      {c.aspect}
                    </span>
                    <p className="mt-1 text-slate-700 dark:text-slate-300 font-medium">
                      {c.toolCity}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
