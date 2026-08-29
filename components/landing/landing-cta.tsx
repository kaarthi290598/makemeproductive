"use client";

import React from "react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, LayoutDashboard } from "lucide-react";

export function LandingCta() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-950 via-emerald-950/70 to-slate-950 p-8 text-center text-white shadow-2xl sm:p-14">
          {/* Radiant Aura */}
          <div className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-teal-500/20 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-300 backdrop-blur-md">
              <Sparkles className="size-3.5 text-emerald-400" />
              <span>Ready in 60 Seconds</span>
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
              Take Control of Your Complete Financial Life.
            </h2>
            <p className="mt-4 text-xs font-medium text-slate-300 sm:text-base">
              Join thousands who track expenses, grow wealth, and protect passwords with ToolCity.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <SignedOut>
                <Link href="/sign-up">
                  <Button className="h-12 gap-2 rounded-2xl bg-emerald-500 px-8 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/30 transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95">
                    <span>Create Your Free Account</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </SignedOut>

              <SignedIn>
                <Link href="/app">
                  <Button className="h-12 gap-2 rounded-2xl bg-emerald-500 px-8 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/30 transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95">
                    <LayoutDashboard className="size-4" />
                    <span>Launch Executive Command Center</span>
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
