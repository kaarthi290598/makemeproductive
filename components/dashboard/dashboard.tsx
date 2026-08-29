"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Landmark,
  ArrowRight,
  BarChart3,
  CreditCard,
  PieChart,
  Sparkles,
  KeyRound,
  ShieldCheck,
  Building2,
  CalendarSync,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  FolderLock,
  Globe,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ConsoleHeader, surfaceCardClass } from "@/components/finance/page-header";
import { fetchDashboardData, DashboardData } from "@/lib/actions/dashboardData";
import { useQuery } from "@tanstack/react-query";
import { dashboardQueryKey } from "@/lib/query-keys";

// ─── Helpers ─────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

const INVESTMENT_COLORS = [
  "#3b82f6", // Stocks - blue
  "#10b981", // Mutual Funds - emerald
  "#f59e0b", // Crypto - amber
  "#f43f5e", // Real Estate - rose
  "#eab308", // Gold - yellow
  "#8b5cf6", // Other - purple
];

const CATEGORY_COLOR_MAP: Record<string, number> = {
  Stocks: 0,
  "Mutual Funds": 1,
  Crypto: 2,
  "Real Estate": 3,
  Gold: 4,
  Other: 5,
};

// ─── Animations ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// ─── Component ───────────────────────────────────────────────────────

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: dashboardQueryKey,
    queryFn: fetchDashboardData,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error)
    return (
      <div className="flex h-[400px] items-center justify-center text-destructive">
        Error: {error instanceof Error ? error.message : "Failed to load dashboard"}
      </div>
    );
  if (!data) return null;

  // Expenses & Cash Flow
  const { totalBudget, totalSpentThisMonth, totalIncomeThisMonth, transactions } =
    data.expenses;
  const netCashFlow = totalIncomeThisMonth - totalSpentThisMonth;
  const budgetPct =
    totalBudget > 0
      ? Math.round((totalSpentThisMonth / totalBudget) * 100)
      : 0;

  // Portfolio
  const { totalInvested, totalCurrentValue, totalDebtRemaining, investments, debts } =
    data.portfolio;
  const investmentGain = totalCurrentValue - totalInvested;
  const investmentGainPct =
    totalInvested > 0
      ? ((investmentGain / totalInvested) * 100).toFixed(1)
      : "0";
  const netWorth = totalCurrentValue - totalDebtRemaining;

  // Subscriptions
  const { totalMonthlySpend, activeCount, upcomingRenewals } = data.subscriptions;

  // Credit & Dues
  const {
    totalRemainingDue,
    overallUtilization,
    totalCreditLimit,
    totalOutstanding,
    upcomingDues,
    items: creditCards,
  } = data.creditDues;
  const availableCredit = Math.max(0, totalCreditLimit - totalOutstanding);

  // Passwords
  const { totalCount: passwordCount, bankAccountsCount, webAccountsCount } = data.passwords;

  // Investment chart data
  const investmentByCategory = investments.reduce(
    (acc, inv) => {
      const existing = acc.find((a) => a.category === inv.category);
      if (existing) {
        existing.value += inv.currentValue;
      } else {
        acc.push({ category: inv.category, value: inv.currentValue });
      }
      return acc;
    },
    [] as { category: string; value: number }[],
  );

  // Combined upcoming timeline (Renewals + Credit Dues sorted by date)
  const upcomingTimeline = (() => {
    const list: {
      id: string;
      title: string;
      type: "subscription" | "credit_due";
      amount: number;
      date: string;
      tag: string;
    }[] = [];

    upcomingRenewals.forEach((s) => {
      list.push({
        id: `sub-${s.id}`,
        title: s.name,
        type: "subscription",
        amount: s.amount,
        date: s.nextPaymentDate,
        tag: `Renewal (${s.billingFrequency})`,
      });
    });

    upcomingDues.forEach((c) => {
      list.push({
        id: `due-${c.id}`,
        title: c.name,
        type: "credit_due",
        amount: c.remainingDue,
        date: c.dueDate,
        tag: "Credit Due",
      });
    });

    return list.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  })();

  // Quick Action Dock
  const quickActions = [
    {
      title: "Add Expense",
      href: "/app/expense-tracker/overview",
      icon: PlusCircle,
      color: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600/20",
    },
    {
      title: "Credit & Dues",
      href: "/app/credit-dues",
      icon: CreditCard,
      color: "bg-rose-600/10 text-rose-700 dark:text-rose-400 hover:bg-rose-600/20",
    },
    {
      title: "Subscriptions",
      href: "/app/subscriptions",
      icon: CalendarSync,
      color: "bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-600/20",
    },
    {
      title: "Portfolio Assets",
      href: "/app/portfolio/overview",
      icon: TrendingUp,
      color: "bg-sky-600/10 text-sky-700 dark:text-sky-400 hover:bg-sky-600/20",
    },
    {
      title: "Password Vault",
      href: "/app/passwords",
      icon: KeyRound,
      color: "bg-purple-600/10 text-purple-700 dark:text-purple-400 hover:bg-purple-600/20",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ─── Top Welcome & Quick Actions Bar ──────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {getGreeting()}
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Overview for {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        {/* Quick Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-[0.98]",
                action.color,
              )}
            >
              <action.icon className="size-3.5" />
              <span>{action.title}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ─── Core Executive 4 KPI Stat Cards ─────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Net Worth */}
        <StatCard
          title="Net Worth"
          value={formatCurrency(netWorth)}
          subtitle={`Assets: ${formatCurrency(totalCurrentValue)} · Debts: ${formatCurrency(totalDebtRemaining)}`}
          icon={Landmark}
          tone="emerald"
          trend={{
            label: `${Number(investmentGainPct) >= 0 ? "+" : ""}${investmentGainPct}% ROI`,
            positive: Number(investmentGainPct) >= 0,
          }}
        />

        {/* 2. Cash Flow This Month */}
        <StatCard
          title="Monthly Cash Flow"
          value={formatCurrency(netCashFlow)}
          subtitle={`In: ${formatCurrency(totalIncomeThisMonth)} · Out: ${formatCurrency(totalSpentThisMonth)}`}
          icon={Wallet}
          tone={netCashFlow >= 0 ? "emerald" : "rose"}
          trend={{
            label: `Budget Spent: ${budgetPct}%`,
            positive: budgetPct <= 100,
          }}
        />

        {/* 3. Subscriptions Burn */}
        <StatCard
          title="Monthly Subscriptions"
          value={formatCurrency(totalMonthlySpend)}
          subtitle={`${activeCount} active recurring services`}
          icon={CalendarSync}
          tone="purple"
        />

        {/* 4. Credit Dues & Utilization */}
        <StatCard
          title="Credit Statement Dues"
          value={formatCurrency(totalRemainingDue)}
          subtitle={`Utilization: ${overallUtilization.toFixed(1)}% · Avail: ${formatCurrency(availableCredit)}`}
          icon={CreditCard}
          tone="rose"
        />
      </div>

      {/* ─── Visual Command Panels: Asset Allocation & Commitments ─ */}
      <div className="grid gap-5 lg:grid-cols-7">
        {/* Left Panel: Portfolio Asset Allocation (4 Cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <Card className={surfaceCardClass}>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Asset & Investment Allocation
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Portfolio: {formatCurrency(totalCurrentValue)}
                </p>
              </div>
              <Link
                href="/app/portfolio/overview"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
              >
                <span>View Portfolio</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="pt-5">
              {investmentByCategory.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center text-center text-xs text-slate-400">
                  <PieChart className="mb-2 size-8 text-slate-300 dark:text-slate-700" />
                  <p>No investments tracked yet.</p>
                  <Link
                    href="/app/portfolio/investments"
                    className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
                  >
                    Add your first asset
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={investmentByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {investmentByCategory.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                INVESTMENT_COLORS[
                                  CATEGORY_COLOR_MAP[entry.category] ??
                                    index % INVESTMENT_COLORS.length
                                ]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val: number) => formatCurrency(val)}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend List */}
                  <div className="space-y-2.5">
                    {investmentByCategory.map((item, index) => {
                      const color =
                        INVESTMENT_COLORS[
                          CATEGORY_COLOR_MAP[item.category] ??
                            index % INVESTMENT_COLORS.length
                        ];
                      const pct =
                        totalCurrentValue > 0
                          ? ((item.value / totalCurrentValue) * 100).toFixed(0)
                          : "0";
                      return (
                        <div
                          key={item.category}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="size-2.5 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              {item.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-mono font-bold text-slate-900 dark:text-white">
                            <span>{formatCurrency(item.value)}</span>
                            <span className="text-[10px] text-slate-400">
                              ({pct}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Panel: Upcoming Financial Commitments (3 Cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className={cn(surfaceCardClass, "h-full flex flex-col")}>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Upcoming Commitments
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Card dues & subscription renewals
                </p>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {upcomingTimeline.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center p-6 text-center text-xs text-slate-400">
                  <CheckCircle2 className="mb-2 size-8 text-emerald-500/50" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    All caught up!
                  </p>
                  <p className="mt-0.5">No upcoming dues or renewals in queue.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {upcomingTimeline.slice(0, 5).map((item) => {
                    const daysLeft = differenceInCalendarDays(
                      parseISO(item.date),
                      new Date(),
                    );
                    const isDueSoon = daysLeft <= 3;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-900/40"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                              {item.title}
                            </span>
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.2 text-[9px] font-bold uppercase",
                                item.type === "credit_due"
                                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                                  : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
                              )}
                            >
                              {item.tag}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {format(parseISO(item.date), "MMM d, yyyy")} ·{" "}
                            <span
                              className={cn(
                                "font-semibold",
                                isDueSoon
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-slate-500",
                              )}
                            >
                              {daysLeft <= 0
                                ? "Due Today"
                                : `in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`}
                            </span>
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Deep Module Cockpit Cards (3-Column Grid) ─────────────── */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Module 1: Recent Cash Flow Activity */}
        <motion.div variants={itemVariants}>
          <Card className={cn(surfaceCardClass, "h-full flex flex-col")}>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="size-4 text-emerald-500" />
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Recent Cash Flow
                </CardTitle>
              </div>
              <Link
                href="/app/expense-tracker/overview"
                className="text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {transactions.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No transactions recorded this month.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.slice(0, 4).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {t.note || t.category?.name || "Transaction"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {format(parseISO(t.date), "MMM d")} ·{" "}
                          {t.category?.name || "General"}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 font-mono text-xs font-bold",
                          t.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400",
                        )}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Module 2: Credit Cards & Utilization */}
        <motion.div variants={itemVariants}>
          <Card className={cn(surfaceCardClass, "h-full flex flex-col")}>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-rose-500" />
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Credit Cards & Limits
                </CardTitle>
              </div>
              <Link
                href="/app/credit-dues"
                className="text-xs font-bold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
              >
                View cards
              </Link>
            </CardHeader>
            <CardContent className="flex-1 p-5">
              {creditCards.length === 0 ? (
                <div className="flex h-36 flex-col items-center justify-center text-center text-xs text-slate-400">
                  <p>No credit cards tracked yet.</p>
                  <Link
                    href="/app/credit-dues"
                    className="mt-1.5 font-bold text-rose-600 hover:underline"
                  >
                    Add credit card
                  </Link>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {creditCards.slice(0, 3).map((card) => {
                    const cardUtil =
                      card.creditLimit > 0
                        ? (card.totalOutstanding / card.creditLimit) * 100
                        : 0;
                    return (
                      <div key={card.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="truncate font-bold text-slate-800 dark:text-slate-200">
                            {card.name}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">
                            {cardUtil.toFixed(0)}% Util
                          </span>
                        </div>
                        <Progress
                          value={Math.min(100, cardUtil)}
                          className="h-1.5"
                          indicatorClassName={
                            cardUtil > 60
                              ? "bg-rose-500"
                              : cardUtil > 30
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }
                        />
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>
                            {card.dueDate
                              ? `Due: ${format(parseISO(card.dueDate), "MMM d")}`
                              : "No due date"}
                          </span>
                          <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                            ₹{card.remainingDue.toLocaleString("en-IN")} due
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Module 3: Security & Password Vault */}
        <motion.div variants={itemVariants}>
          <Card className={cn(surfaceCardClass, "h-full flex flex-col")}>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-purple-500" />
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Security Vault
                </CardTitle>
              </div>
              <Link
                href="/app/passwords"
                className="text-xs font-bold text-slate-500 hover:text-purple-600 dark:hover:text-purple-400"
              >
                Open Vault
              </Link>
            </CardHeader>
            <CardContent className="flex-1 p-5 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                    <span className="text-[10px] font-bold uppercase">Total Vault</span>
                  </div>
                  <p className="mt-1 font-mono text-lg font-black text-slate-900 dark:text-white">
                    {passwordCount}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Building2 className="size-3.5 text-blue-500" />
                    <span className="text-[10px] font-bold uppercase">Bank Items</span>
                  </div>
                  <p className="mt-1 font-mono text-lg font-black text-slate-900 dark:text-white">
                    {bankAccountsCount}
                  </p>
                </div>
              </div>

              <div className="mt-3.5 rounded-xl border border-purple-200/60 bg-purple-50/50 p-3 text-xs dark:border-purple-900/40 dark:bg-purple-950/20">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-purple-900 dark:text-purple-300">
                    Web & App Logins
                  </span>
                  <span className="font-mono font-bold text-purple-900 dark:text-purple-300">
                    {webAccountsCount} saved
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-purple-700/80 dark:text-purple-400/80">
                  Quick copy passwords & usernames
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Stat Card Component (Unified Gradient Pattern) ──────────────────

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "emerald",
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  tone?: "emerald" | "blue" | "rose" | "amber" | "purple";
  trend?: { label: string; positive: boolean };
}) {
  const toneStyles: Record<
    string,
    { container: string; iconBg: string; label: string; value: string }
  > = {
    emerald: {
      container:
        "border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-100/40 dark:border-emerald-800/40 dark:from-emerald-950/40 dark:to-emerald-900/20",
      iconBg: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
      label: "text-emerald-600/80 dark:text-emerald-400/80",
      value: "text-emerald-900 dark:text-emerald-300",
    },
    blue: {
      container:
        "border-sky-200/60 bg-gradient-to-br from-sky-50 to-sky-100/40 dark:border-sky-800/40 dark:from-sky-950/40 dark:to-sky-900/20",
      iconBg: "bg-sky-600/10 text-sky-700 dark:text-sky-400",
      label: "text-sky-600/80 dark:text-sky-400/80",
      value: "text-sky-900 dark:text-sky-300",
    },
    rose: {
      container:
        "border-rose-200/60 bg-gradient-to-br from-rose-50 to-rose-100/40 dark:border-rose-800/40 dark:from-rose-950/40 dark:to-rose-900/20",
      iconBg: "bg-rose-600/10 text-rose-700 dark:text-rose-400",
      label: "text-rose-600/80 dark:text-rose-400/80",
      value: "text-rose-900 dark:text-rose-300",
    },
    amber: {
      container:
        "border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-100/40 dark:border-amber-800/40 dark:from-amber-950/40 dark:to-amber-900/20",
      iconBg: "bg-amber-600/10 text-amber-700 dark:text-amber-400",
      label: "text-amber-600/80 dark:text-amber-400/80",
      value: "text-amber-900 dark:text-amber-300",
    },
    purple: {
      container:
        "border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-indigo-100/40 dark:border-indigo-800/40 dark:from-indigo-950/40 dark:to-indigo-900/20",
      iconBg: "bg-indigo-600/10 text-indigo-700 dark:text-indigo-400",
      label: "text-indigo-600/80 dark:text-indigo-400/80",
      value: "text-indigo-900 dark:text-indigo-300",
    },
  };

  const style = toneStyles[tone] || toneStyles.emerald;

  return (
    <motion.div variants={itemVariants}>
      <div className={cn("rounded-xl border p-3.5", style.container)}>
        <div className="mb-1 flex items-center gap-2">
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-lg",
              style.iconBg,
            )}
          >
            <Icon className="size-4" />
          </div>
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              style.label,
            )}
          >
            {title}
          </span>
        </div>
        <p className={cn("font-mono text-xl font-extrabold", style.value)}>
          {value}
        </p>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
        {trend && (
          <div className="mt-2 border-t border-slate-200/50 pt-1.5 dark:border-slate-800/60">
            <span
              className={cn(
                "text-[10px] font-semibold",
                trend.positive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400",
              )}
            >
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-56 rounded-xl" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-7">
        <Skeleton className="h-72 rounded-2xl lg:col-span-4" />
        <Skeleton className="h-72 rounded-2xl lg:col-span-3" />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
