"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  CalendarSync,
  Landmark,
  Wallet,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Background Decorative Mesh & Radial Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-emerald-600/20 via-teal-500/15 to-sky-500/10 blur-[130px] dark:from-emerald-600/15 dark:via-teal-500/10 dark:to-purple-900/10" />
      <div className="pointer-events-none absolute top-1/2 -right-40 -z-10 size-[450px] rounded-full bg-rose-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 -z-10 size-[450px] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Hero Text */}
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {/* Badge Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50/70 px-3.5 py-1 text-xs font-bold text-emerald-800 backdrop-blur-md dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <Sparkles className="size-3.5 text-emerald-500 animate-pulse" />
            <span>Next-Gen Personal Finance & Vault Hub</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Command Your Wealth. <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
              Track Every Rupee.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 max-w-2xl text-xs font-medium text-slate-600 dark:text-slate-300 sm:text-base md:text-lg"
          >
            Consolidate your daily expenses, investment portfolio, credit card limits,
            recurring subscriptions, and encrypted credentials in one lightning-fast command center.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-3"
          >
            <SignedOut>
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button className="h-11 w-full gap-2 rounded-2xl bg-emerald-600 px-6 text-xs font-bold text-white shadow-xl shadow-emerald-600/30 transition-all hover:bg-emerald-500 sm:h-12 sm:w-auto sm:px-8 sm:text-sm">
                  <span>Start Free Workspace</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-2xl border-slate-200 bg-white/80 px-6 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 sm:h-12 sm:w-auto sm:text-sm"
                >
                  Explore 6 Modules
                </Button>
              </a>
            </SignedOut>

            <SignedIn>
              <Link href="/app" className="w-full sm:w-auto">
                <Button className="h-11 w-full gap-2 rounded-2xl bg-emerald-600 px-6 text-xs font-bold text-white shadow-xl shadow-emerald-600/30 transition-all hover:bg-emerald-500 sm:h-12 sm:w-auto sm:px-8 sm:text-sm">
                  <span>Open Executive Dashboard</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </SignedIn>
          </motion.div>

          {/* Trust Value Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span>100% Free & No Ads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              <span>Zero Data Selling</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="size-3.5 text-emerald-500" />
              <span>Isolated User Tenancy</span>
            </div>
          </motion.div>
        </div>

        {/* ─── Interactive Hero Visual Showcase ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative mx-auto mt-12 max-w-5xl"
        >
          {/* Glassmorphic Mockup Container */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/70 p-3.5 shadow-2xl backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-900/60 sm:rounded-3xl sm:p-6 lg:p-8">
            {/* Mock Header Controls */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-200/60 pb-3 dark:border-slate-800/60 sm:mb-6 sm:pb-4">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-rose-500/80 sm:size-3" />
                <div className="size-2.5 rounded-full bg-amber-500/80 sm:size-3" />
                <div className="size-2.5 rounded-full bg-emerald-500/80 sm:size-3" />
                <span className="hidden font-mono text-[11px] font-bold text-slate-400 sm:inline-block sm:ml-2">
                  app.toolcity.finance / dashboard
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 sm:text-[11px]">
                <span className="inline-block size-2 animate-ping rounded-full bg-emerald-500" />
                <span>LIVE COMMAND CENTER</span>
              </div>
            </div>

            {/* Mock Dashboard Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Net Worth */}
              <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-4 dark:border-emerald-800/40 dark:from-emerald-950/40 dark:to-emerald-900/20">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
                    <Landmark className="size-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">
                    Net Worth
                  </span>
                </div>
                <p className="mt-2 font-mono text-2xl font-black text-emerald-900 dark:text-emerald-300">
                  ₹18,45,200
                </p>
                <div className="mt-2 flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <TrendingUp className="size-3" />
                  <span>+18.4% ROI Gains</span>
                </div>
              </div>

              {/* Card 2: Cash Flow */}
              <div className="rounded-2xl border border-sky-200/60 bg-gradient-to-br from-sky-50 to-sky-100/40 p-4 dark:border-sky-800/40 dark:from-sky-950/40 dark:to-sky-900/20">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-sky-600/10 text-sky-700 dark:text-sky-400">
                    <Wallet className="size-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600/80 dark:text-sky-400/80">
                    Monthly Flow
                  </span>
                </div>
                <p className="mt-2 font-mono text-2xl font-black text-sky-900 dark:text-sky-300">
                  +₹74,500
                </p>
                <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Income: ₹1.45L · Spent: ₹70.5K
                </p>
              </div>

              {/* Card 3: Subscriptions */}
              <div className="rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-indigo-100/40 p-4 dark:border-indigo-800/40 dark:from-indigo-950/40 dark:to-indigo-900/20">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-700 dark:text-indigo-400">
                    <CalendarSync className="size-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600/80 dark:text-indigo-400/80">
                    Subscriptions
                  </span>
                </div>
                <p className="mt-2 font-mono text-2xl font-black text-indigo-900 dark:text-indigo-300">
                  ₹2,840/mo
                </p>
                <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  6 active recurring services
                </p>
              </div>

              {/* Card 4: Credit Dues */}
              <div className="rounded-2xl border border-rose-200/60 bg-gradient-to-br from-rose-50 to-rose-100/40 p-4 dark:border-rose-800/40 dark:from-rose-950/40 dark:to-rose-900/20">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-rose-600/10 text-rose-700 dark:text-rose-400">
                    <CreditCard className="size-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600/80 dark:text-rose-400/80">
                    Credit Dues
                  </span>
                </div>
                <p className="mt-2 font-mono text-2xl font-black text-rose-900 dark:text-rose-300">
                  ₹14,800
                </p>
                <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Utilization: 12.5% · Safe Limit
                </p>
              </div>
            </div>

            {/* Mini Showcase Row: Realistic Card & Upcoming Timeline */}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {/* Realistic Titanium EMV Card */}
              <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 via-slate-900 to-black p-5 text-white shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/50">
                      INFINIA PRIVILEGE
                    </span>
                    <h4 className="text-sm font-extrabold tracking-tight text-white">
                      HDFC Regalia Gold
                    </h4>
                  </div>
                  <div className="font-mono text-xs font-bold italic text-white/90">
                    VISA
                  </div>
                </div>

                <div className="my-4 flex items-center justify-between">
                  {/* Vector Chip */}
                  <div className="h-6 w-8 rounded-sm bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-inner" />
                  <span className="font-mono text-xs font-bold tracking-[0.2em] text-white/70">
                    •••• 8899
                  </span>
                </div>

                <div className="flex items-end justify-between border-t border-white/10 pt-2 text-[11px]">
                  <div>
                    <span className="block text-[8px] uppercase text-white/50">
                      Limit Available
                    </span>
                    <span className="font-mono font-black text-emerald-400">
                      ₹4,85,200
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] uppercase text-white/50">
                      Due Date
                    </span>
                    <span className="font-mono font-bold text-white/90">
                      15 Sep
                    </span>
                  </div>
                </div>
              </div>

              {/* Upcoming Commitments Preview */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>Upcoming Commitments</span>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                    Next 14 Days
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center justify-between rounded-xl bg-white p-2.5 shadow-2xs dark:bg-slate-950">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        HDFC Regalia Statement Due
                      </p>
                      <p className="text-[10px] text-rose-500 font-semibold">
                        Due in 3 days
                      </p>
                    </div>
                    <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                      ₹14,800
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white p-2.5 shadow-2xs dark:bg-slate-950">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Netflix 4K Renewal
                      </p>
                      <p className="text-[10px] text-indigo-500 font-semibold">
                        Due in 5 days
                      </p>
                    </div>
                    <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                      ₹649
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
