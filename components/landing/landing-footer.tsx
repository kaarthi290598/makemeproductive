"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/50 py-12 text-xs dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-base font-black text-slate-900 dark:text-white">
                ToolCity
              </span>
            </Link>
            <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
              Personal finance, investment portfolio, credit dues, recurring subscriptions, and zero-knowledge security vault.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>Isolated Supabase RLS & Clerk Tenancy</span>
            </div>
          </div>

          {/* Modules Col */}
          <div className="space-y-2.5">
            <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Modules
            </span>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/app/expense-tracker/overview" className="hover:text-emerald-500">
                  Expense Tracker
                </Link>
              </li>
              <li>
                <Link href="/app/portfolio/overview" className="hover:text-emerald-500">
                  Portfolio & Net Worth
                </Link>
              </li>
              <li>
                <Link href="/app/credit-dues" className="hover:text-emerald-500">
                  Credit & Dues
                </Link>
              </li>
              <li>
                <Link href="/app/subscriptions" className="hover:text-emerald-500">
                  Subscriptions
                </Link>
              </li>
              <li>
                <Link href="/app/passwords" className="hover:text-emerald-500">
                  Password Vault
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Col */}
          <div className="space-y-2.5">
            <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Navigation
            </span>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li>
                <a href="#features" className="hover:text-emerald-500">
                  All Features
                </a>
              </li>
              <li>
                <a href="#command-center" className="hover:text-emerald-500">
                  Command Center
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-500">
                  FAQ
                </a>
              </li>
              <li>
                <Link href="/app" className="hover:text-emerald-500">
                  Launch App
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} ToolCity. Make Me Productive. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for modern personal financial sovereignty.
          </p>
        </div>
      </div>
    </footer>
  );
}
