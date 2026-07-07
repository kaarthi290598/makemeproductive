"use client";

import React, { useEffect, useState } from "react";
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
  CalendarDays,
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
import {
  fetchDashboardData,
  type DashboardData,
} from "@/lib/actions/dashboardData";

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
      <div className="space-y-1">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
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
  iconBgClass,
  iconColorClass,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  iconBgClass: string;
  iconColorClass: string;
  trend?: { value: string; positive: boolean } | null;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="group relative overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-border hover:shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <CardContent className="relative p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                {title}
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {value}
              </p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
              {trend && (
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    trend.positive ? "text-emerald-500" : "text-rose-500"
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
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconBgClass}`}
            >
              <Icon className={`size-5 ${iconColorClass}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error)
    return (
      <div className="flex h-[400px] items-center justify-center text-destructive">
        Error: {error}
      </div>
    );
  if (!data) return null;

  // ── Computed values ──────────────────────────────────────────────
  const pendingTodos = data.todos.filter((t) => !t.isCompleted);
  const completedCount = data.todos.filter((t) => t.isCompleted).length;
  const totalTodos = data.todos.length;
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
        <h1 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">
          {getGreeting()}{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            👋
          </span>
        </h1>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground lg:text-sm">
          <CalendarDays className="size-3.5" />
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </motion.div>

      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tasks"
          value={`${pendingTodos.length} pending`}
          subtitle={
            totalTodos > 0
              ? `${completedCount}/${totalTodos} done · ${completionPct}%`
              : "No tasks yet"
          }
          icon={ListTodo}
          iconBgClass="bg-blue-500/10"
          iconColorClass="text-blue-500"
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
          iconBgClass="bg-rose-500/10"
          iconColorClass="text-rose-500"
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
          iconBgClass="bg-emerald-500/10"
          iconColorClass="text-emerald-500"
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
              : "Debt free! 🎉"
          }
          icon={Sparkles}
          iconBgClass="bg-purple-500/10"
          iconColorClass="text-purple-500"
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
          <Card className="border-border/50 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <ListTodo className="size-4 text-blue-500" />
                </div>
                <CardTitle className="text-sm font-semibold">
                  Pending Tasks
                </CardTitle>
              </div>
              <Link
                href="/app/todo"
                className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
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
                      +{pendingTodos.length - 5} more tasks
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Expenses */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10">
                  <Wallet className="size-4 text-rose-500" />
                </div>
                <CardTitle className="text-sm font-semibold">
                  Recent Transactions
                </CardTitle>
              </div>
              <Link
                href="/app/expense-tracker/transactions"
                className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
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
                        className={`shrink-0 text-sm font-semibold tabular-nums ${
                          tx.type === "income"
                            ? "text-emerald-500"
                            : "text-foreground"
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
          <Card className="border-border/50 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <TrendingUp className="size-4 text-emerald-500" />
                </div>
                <CardTitle className="text-sm font-semibold">
                  Investment Breakdown
                </CardTitle>
              </div>
              <Link
                href="/app/portfolio/investments"
                className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
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
          <Card className="border-border/50 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10">
                  <Landmark className="size-4 text-purple-500" />
                </div>
                <CardTitle className="text-sm font-semibold">
                  Debt Overview
                </CardTitle>
              </div>
              <Link
                href="/app/portfolio/debts"
                className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
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
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-muted/20 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
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
