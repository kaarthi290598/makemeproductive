"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import {
  CheckCircle2,
  Circle,
  ListTodo,
  Wallet,
  TrendingUp,
  TrendingDown,
  Landmark,
  ArrowRight,
  BarChart3,
  PlusCircle,
  CreditCard,
  PieChart,
  Clock,
  Target,
  Sparkles,
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
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ConsoleHeader, surfaceCardClass } from "@/components/finance/page-header";
import {
  fetchDashboardData,
} from "@/lib/actions/dashboardData";
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

function formatDeadline(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isPast(d)) return "Overdue";
  return format(d, "MMM d");
}

const INVESTMENT_COLORS = [
  "hsl(210, 90%, 55%)", // Stocks - blue
  "hsl(150, 70%, 45%)", // Mutual Funds - green
  "hsl(35, 90%, 55%)",  // Crypto - amber
  "hsl(340, 75%, 55%)", // Real Estate - rose
  "hsl(50, 85%, 50%)",  // Gold - yellow
  "hsl(270, 60%, 55%)", // Other - purple
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
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ─── Loading Skeleton ────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="mt-2 h-3 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  tone: "blue" | "rose" | "emerald" | "violet";
  trend?: { value: string; positive: boolean } | null;
}) {
  const tones = {
    blue: {
      card: "border-blue-200/60 bg-gradient-to-br from-blue-50 to-blue-100/40 dark:border-blue-800/40 dark:from-blue-950/40 dark:to-blue-900/20",
      icon: "bg-blue-600/10 text-blue-700 dark:text-blue-400",
      label: "text-blue-600/80 dark:text-blue-400/80",
      value: "text-blue-900 dark:text-blue-300",
    },
    rose: {
      card: "border-rose-200/60 bg-gradient-to-br from-rose-50 to-rose-100/40 dark:border-rose-800/40 dark:from-rose-950/40 dark:to-rose-900/20",
      icon: "bg-rose-600/10 text-rose-700 dark:text-rose-400",
      label: "text-rose-600/80 dark:text-rose-400/80",
      value: "text-rose-900 dark:text-rose-300",
    },
    emerald: {
      card: "border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-100/40 dark:border-emerald-800/40 dark:from-emerald-950/40 dark:to-emerald-900/20",
      icon: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
      label: "text-emerald-600/80 dark:text-emerald-400/80",
      value: "text-emerald-900 dark:text-emerald-300",
    },
    violet: {
      card: "border-violet-200/60 bg-gradient-to-br from-violet-50 to-violet-100/40 dark:border-violet-800/40 dark:from-violet-950/40 dark:to-violet-900/20",
      icon: "bg-violet-600/10 text-violet-700 dark:text-violet-400",
      label: "text-violet-600/80 dark:text-violet-400/80",
      value: "text-violet-900 dark:text-violet-300",
    },
  }[tone];

  return (
    <motion.div variants={itemVariants}>
      <div className={`rounded-xl border p-3.5 ${tones.card}`}>
        <div className="mb-1 flex items-center gap-2">
          <div
            className={`flex size-7 items-center justify-center rounded-lg ${tones.icon}`}
          >
            <Icon className="size-4" />
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${tones.label}`}
          >
            {title}
          </span>
        </div>
        <p className={`font-mono text-xl font-extrabold ${tones.value}`}>
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
        {trend && (
          <div
            className={`mt-1 flex items-center gap-1 text-[11px] font-semibold ${
              trend.positive ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {trend.positive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {trend.value}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: dashboardQueryKey,
    queryFn: fetchDashboardData,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error)
    return (
      <div className="flex h-[400px] items-center justify-center text-destructive">
        Error: {error instanceof Error ? error.message : "Failed to load"}
      </div>
    );
  if (!data) return null;

  const pendingTodos = data.todos.items;
  const completedCount = data.todos.completedCount;
  const totalTodos = data.todos.pendingCount + data.todos.completedCount;
  const completionPct = totalTodos > 0 ? Math.round((completedCount / totalTodos) * 100) : 0;

  const { totalBudget, totalSpentThisMonth, totalIncomeThisMonth } = data.expenses;
  const budgetPct = totalBudget > 0 ? Math.round((totalSpentThisMonth / totalBudget) * 100) : 0;

  const { totalInvested, totalCurrentValue, totalDebtRemaining } = data.portfolio;
  const investmentGain = totalCurrentValue - totalInvested;
  const investmentGainPct = totalInvested > 0 ? ((investmentGain / totalInvested) * 100).toFixed(1) : "0";
  const netWorth = totalCurrentValue - totalDebtRemaining;

  // Investment chart data
  const investmentByCategory = data.portfolio.investments.reduce(
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

  // Quick links
  const quickLinks = [
    {
      title: "Add Task",
      description: "Create a new todo",
      href: "/app/todo",
      icon: PlusCircle,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Add Expense",
      description: "Track a transaction",
      href: "/app/expense-tracker/overview",
      icon: CreditCard,
      color: "bg-rose-500/10 text-rose-500",
    },
    {
      title: "Analytics",
      description: "Spending insights",
      href: "/app/expense-tracker/analytics",
      icon: BarChart3,
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      title: "Investments",
      description: "Manage portfolio",
      href: "/app/portfolio/investments",
      icon: TrendingUp,
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      title: "Debts",
      description: "Track liabilities",
      href: "/app/portfolio/debts",
      icon: Landmark,
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      title: "Overview",
      description: "Portfolio summary",
      href: "/app/portfolio/overview",
      icon: PieChart,
      color: "bg-cyan-500/10 text-cyan-500",
    },
  ];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Greeting ────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <ConsoleHeader
          icon={
            <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          }
          title={`${getGreeting()}`}
          subtitle={format(new Date(), "EEEE, MMMM d, yyyy")}
        />
      </motion.div>

      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tasks"
          value={`${data.todos.pendingCount} pending`}
          subtitle={
            totalTodos > 0
              ? `${completedCount}/${totalTodos} done · ${completionPct}%`
              : "No tasks yet"
          }
          icon={ListTodo}
          tone="blue"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(totalSpentThisMonth)}
          subtitle={
            totalBudget > 0
              ? `${budgetPct}% of ${formatCurrency(totalBudget)} budget`
              : "No budget set"
          }
          icon={Wallet}
          tone="rose"
          trend={
            totalIncomeThisMonth > 0
              ? {
                  value: `${formatCurrency(totalIncomeThisMonth)} income`,
                  positive: true,
                }
              : null
          }
        />
        <StatCard
          title="Investments"
          value={formatCurrency(totalCurrentValue)}
          subtitle={`${formatCurrency(totalInvested)} invested`}
          icon={TrendingUp}
          tone="emerald"
          trend={
            totalInvested > 0
              ? {
                  value: `${investmentGain >= 0 ? "+" : ""}${investmentGainPct}% return`,
                  positive: investmentGain >= 0,
                }
              : null
          }
        />
        <StatCard
          title="Net Worth"
          value={formatCurrency(netWorth)}
          subtitle={
            totalDebtRemaining > 0
              ? `${formatCurrency(totalDebtRemaining)} debt remaining`
              : "Debt free"
          }
          icon={Sparkles}
          tone="violet"
          trend={
            netWorth > 0
              ? { value: "Positive", positive: true }
              : netWorth < 0
                ? { value: "Negative", positive: false }
                : null
          }
        />
      </div>

      {/* ── Middle Row: Todos + Recent Expenses ─────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending Tasks */}
        <motion.div variants={itemVariants}>
          <Card className={surfaceCardClass}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <ListTodo className="size-4 text-blue-500" />
                </div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Pending Tasks
                </CardTitle>
              </div>
              <Link
                href="/app/todo"
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 transition-colors hover:text-emerald-500"
              >
                View all
                <ArrowRight className="size-3" />
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {pendingTodos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="mb-2 size-8 text-emerald-500/50" />
                  <p className="text-sm font-medium text-muted-foreground">
                    All caught up!
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    No pending tasks
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {pendingTodos.slice(0, 5).map((todo) => (
                    <div
                      key={todo.id}
                      className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                    >
                      <Circle className="size-4 shrink-0 text-muted-foreground/40" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {todo.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {todo.category && (
                            <span className="text-[10px] font-medium text-muted-foreground/60">
                              {todo.category.category}
                            </span>
                          )}
                        </div>
                      </div>
                      {todo.deadline && (
                        <Badge
                          variant="secondary"
                          className={`shrink-0 text-[10px] font-medium ${
                            isPast(parseISO(todo.deadline)) && !isToday(parseISO(todo.deadline))
                              ? "border-rose-500/20 bg-rose-500/10 text-rose-500"
                              : isToday(parseISO(todo.deadline))
                                ? "border-amber-500/20 bg-amber-500/10 text-amber-600"
                                : "border-border/50"
                          }`}
                        >
                          <Clock className="mr-1 size-2.5" />
                          {formatDeadline(todo.deadline)}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {pendingTodos.length > 5 && (
                    <p className="px-2 pt-1 text-xs text-muted-foreground/60">
                      +{Math.max(0, data.todos.pendingCount - 5)} more tasks
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Expenses */}
        <motion.div variants={itemVariants}>
          <Card className={surfaceCardClass}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10">
                  <Wallet className="size-4 text-rose-500" />
                </div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Recent Transactions
                </CardTitle>
              </div>
              <Link
                href="/app/expense-tracker/transactions"
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 transition-colors hover:text-emerald-500"
              >
                View all
                <ArrowRight className="size-3" />
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {data.expenses.transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Wallet className="mb-2 size-8 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No transactions yet
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    Start tracking expenses
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {data.expenses.transactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                    >
                      <div
                        className="size-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: tx.category?.color || "hsl(var(--muted-foreground))",
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {tx.note || tx.category?.name || "Transaction"}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60">
                          {tx.category?.name && tx.note ? tx.category.name + " · " : ""}
                          {format(parseISO(tx.date), "MMM d")}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 font-mono text-sm font-bold tabular-nums ${
                          tx.type === "income"
                            ? "text-emerald-600"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Bottom Row: Investment Chart + Debt Overview ─────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Investment Breakdown */}
        <motion.div variants={itemVariants}>
          <Card className={surfaceCardClass}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <TrendingUp className="size-4 text-emerald-500" />
                </div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Investment Breakdown
                </CardTitle>
              </div>
              <Link
                href="/app/portfolio/investments"
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 transition-colors hover:text-emerald-500"
              >
                Details
                <ArrowRight className="size-3" />
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {investmentByCategory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <PieChart className="mb-2 size-8 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No investments yet
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    Start building your portfolio
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  {/* Pie Chart */}
                  <div className="h-[160px] w-[160px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={investmentByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={72}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="category"
                          strokeWidth={0}
                        >
                          {investmentByCategory.map((entry, index) => (
                            <Cell
                              key={entry.category}
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
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            borderRadius: "10px",
                            border: "1px solid hsl(var(--border))",
                            background: "hsl(var(--card))",
                            fontSize: "12px",
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-1 flex-col gap-2">
                    {investmentByCategory.map((entry, index) => (
                      <div
                        key={entry.category}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="size-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                INVESTMENT_COLORS[
                                  CATEGORY_COLOR_MAP[entry.category] ??
                                    index % INVESTMENT_COLORS.length
                                ],
                            }}
                          />
                          <span className="text-xs font-medium text-muted-foreground">
                            {entry.category}
                          </span>
                        </div>
                        <span className="text-xs font-semibold tabular-nums text-foreground">
                          {formatCurrency(entry.value)}
                        </span>
                      </div>
                    ))}
                    <div className="mt-2 border-t border-border/50 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Total Value
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {formatCurrency(totalCurrentValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Debt Overview */}
        <motion.div variants={itemVariants}>
          <Card className={surfaceCardClass}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10">
                  <Landmark className="size-4 text-purple-500" />
                </div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Debt Overview
                </CardTitle>
              </div>
              <Link
                href="/app/portfolio/debts"
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 transition-colors hover:text-emerald-500"
              >
                Details
                <ArrowRight className="size-3" />
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {data.portfolio.debts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Target className="mb-2 size-8 text-emerald-500/50" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No debts! 🎉
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    You&apos;re debt free
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.portfolio.debts.slice(0, 4).map((debt) => {
                    const paidPct =
                      debt.totalAmount > 0
                        ? Math.round(
                            ((debt.totalAmount - debt.remainingAmount) /
                              debt.totalAmount) *
                              100,
                          )
                        : 0;
                    return (
                      <div key={debt.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {debt.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-medium border-border/50"
                            >
                              {debt.category}
                            </Badge>
                          </div>
                          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                            {paidPct}% paid
                          </span>
                        </div>
                        <Progress
                          value={paidPct}
                          className="h-1.5"
                          indicatorClassName={
                            paidPct > 75
                              ? "bg-emerald-500"
                              : paidPct > 40
                                ? "bg-amber-500"
                                : "bg-rose-500"
                          }
                        />
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                          <span>
                            {formatCurrency(debt.totalAmount - debt.remainingAmount)} paid
                          </span>
                          <span>
                            {formatCurrency(debt.remainingAmount)} remaining
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {data.portfolio.debts.length > 4 && (
                    <p className="pt-1 text-xs text-muted-foreground/60">
                      +{data.portfolio.debts.length - 4} more debts
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Quick Links ─────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className={surfaceCardClass}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/60 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20"
                >
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${link.color}`}
                  >
                    <link.icon className="size-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-foreground">
                      {link.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">
                      {link.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
