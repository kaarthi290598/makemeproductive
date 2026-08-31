"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Is ToolCity completely free to use?",
    answer:
      "Yes! ToolCity provides full access to all 6 modules — Expense Tracking, Portfolio, Debts, Subscriptions, Credit Cards & Dues, and Password Vault — without hidden fees, subscriptions, or paywalls.",
  },
  {
    question: "How is my financial and password data secured?",
    answer:
      "Your account is secured via Clerk authentication with strict user-isolated Row Level Security (RLS) policies on Supabase. We do not sell or monetize your data.",
  },
  {
    question: "How does the Credit Card Dues calculation work?",
    answer:
      "You only need to enter your Credit Limit and Total Outstanding balance. Statement amounts, due dates, and minimum dues are optional. ToolCity calculates real-time credit utilization health (<30% safe threshold) and available credit balance.",
  },
  {
    question: "Can I install ToolCity on my iPhone, Android, or Mac?",
    answer:
      "Yes! ToolCity is built with Progressive Web App (PWA) support. On mobile devices, simply tap 'Share -> Add to Home Screen' on iOS or 'Install App' on Android to use it as a native standalone app.",
  },
  {
    question: "How does Subscription normalized spend work?",
    answer:
      "Subscriptions with weekly, monthly, quarterly, half-yearly (6 months), or yearly frequencies are automatically converted into equivalent monthly and yearly burn rates so you can budget accurately.",
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/80 px-3.5 py-1 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
            <HelpCircle className="size-3.5 text-emerald-500" />
            <span>Got Questions?</span>
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Everything you need to know about ToolCity architecture and features.
          </p>
        </div>

        <div className="mt-12 space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/70 shadow-sm transition-all dark:border-slate-800/80 dark:bg-slate-900/50"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-slate-900 transition-colors hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400 sm:text-base"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "size-4.5 shrink-0 text-slate-400 transition-transform duration-200",
                      isOpen && "rotate-180 text-emerald-500",
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-5 pb-5 pt-3 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-400 sm:text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
