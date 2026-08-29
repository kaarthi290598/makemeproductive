"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/darkModeToggle";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Layers,
  ShieldCheck,
  CreditCard,
  PieChart,
  CalendarSync,
  KeyRound,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 py-3 shadow-md backdrop-blur-xl dark:bg-slate-950/80 dark:border-b dark:border-slate-800/80"
          : "bg-transparent py-5",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md shadow-emerald-500/25 transition-transform duration-300 group-hover:scale-105">
            <svg
              className="size-5 text-white"
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
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400 sm:text-lg">
              ToolCity
            </span>
            <span className="hidden text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 sm:inline-block">
              Finance & Vault
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-7 md:flex">
          <SignedIn>
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300"
            >
              <LayoutDashboard className="size-3.5" />
              <span>Go to App</span>
            </Link>
          </SignedIn>
          <a
            href="#features"
            className="text-xs font-semibold text-slate-600 transition-colors hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
          >
            Modules
          </a>
          <a
            href="#command-center"
            className="text-xs font-semibold text-slate-600 transition-colors hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
          >
            Command Center
          </a>
          <a
            href="#security"
            className="text-xs font-semibold text-slate-600 transition-colors hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
          >
            Security Vault
          </a>
          <a
            href="#faq"
            className="text-xs font-semibold text-slate-600 transition-colors hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
          >
            FAQ
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <ModeToggle />

          <SignedOut>
            <Link href="/sign-in">
              <Button
                variant="ghost"
                className="h-9 rounded-xl px-4 text-xs font-bold text-slate-700 hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="h-9 gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:bg-emerald-500 active:scale-95">
                <span>Get Started Free</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <Link href="/app">
              <Button className="h-9 gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:bg-emerald-500 active:scale-95">
                <LayoutDashboard className="size-3.5" />
                <span>Go to App</span>
              </Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile Header Right */}
        <div className="flex items-center gap-2 md:hidden">
          <ModeToggle />
          <SignedIn>
            <Link href="/app">
              <Button className="h-8 gap-1 rounded-lg bg-emerald-600 px-2.5 text-xs font-bold text-white shadow-xs">
                <span>App</span>
                <ArrowRight className="size-3" />
              </Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="size-8 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white/95 px-5 py-5 shadow-2xl backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
          <nav className="flex flex-col gap-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Modules & Capabilities
            </a>
            <a
              href="#command-center"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Executive Command Center
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Privacy & Security
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              FAQ
            </a>
          </nav>

          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
            <SignedOut>
              <div className="flex flex-col gap-2">
                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="h-10 w-full rounded-xl text-xs font-bold">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="h-10 w-full gap-1.5 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-600/25">
                    <span>Create Free Account</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center justify-between">
                <Link href="/app" onClick={() => setMobileMenuOpen(false)} className="w-full mr-3">
                  <Button className="h-10 w-full gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white">
                    <LayoutDashboard className="size-4" />
                    <span>Open Command Center</span>
                  </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  );
}
