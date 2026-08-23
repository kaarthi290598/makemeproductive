"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePortfolioStore } from "@/hooks/use-portfolio-store";
import { Landmark, TrendingDown, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { surfaceCardClass } from "@/components/finance/page-header";

const ALLOCATION_COLORS: Record<string, string> = {
  Stocks: "#2563eb",
  "Mutual Funds": "#059669",
  Crypto: "#7c3aed",
  "Real Estate": "#ea580c",
  Gold: "#d97706",
  Other: "#e11d48",
};

function money(n: number) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function PortfolioOverview() {
  const investments = usePortfolioStore((s) => s.investments);
  const debts = usePortfolioStore((s) => s.debts);

  const totalAssets = useMemo(() => {
    return investments.reduce((acc, inv) => acc + (inv.currentValue || 0), 0);
  }, [investments]);

  const totalInvested = useMemo(() => {
    return investments.reduce((acc, inv) => acc + (inv.investedAmount || 0), 0);
  }, [investments]);

  const totalLiabilities = useMemo(() => {
    return debts.reduce((acc, d) => acc + d.remainingAmount, 0);
  }, [debts]);

  const netWorth = totalAssets - totalLiabilities;
  const overallReturns = totalAssets - totalInvested;
  const overallReturnsRate =
    totalInvested > 0 ? (overallReturns / totalInvested) * 100 : 0;

  const assetAllocationData = useMemo(() => {
    const categories: Record<string, number> = {};
    investments.forEach((inv) => {
      categories[inv.category] =
        (categories[inv.category] || 0) + (inv.currentValue || 0);
    });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      color: ALLOCATION_COLORS[name] || "#059669",
    }));
  }, [investments]);

  const totalOriginalDebt = useMemo(() => {
    return debts.reduce((acc, d) => acc + d.totalAmount, 0);
  }, [debts]);

  const debtPayoffProgress = useMemo(() => {
    if (totalOriginalDebt === 0) return 100;
    const paid = totalOriginalDebt - totalLiabilities;
    return (paid / totalOriginalDebt) * 100;
  }, [totalOriginalDebt, totalLiabilities]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-teal-200/60 bg-gradient-to-br from-teal-50 to-teal-100/40 p-3.5 dark:border-teal-800/40 dark:from-teal-950/40 dark:to-teal-900/20">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-teal-600/10 text-teal-700 dark:text-teal-400">
              <Landmark className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600/80 dark:text-teal-400/80">
              Net worth
            </span>
          </div>
          <p
            className={cn(
              "font-mono text-xl font-extrabold",
              netWorth >= 0
                ? "text-emerald-900 dark:text-emerald-300"
                : "text-rose-900 dark:text-rose-300",
            )}
          >
            {netWorth < 0 ? "−" : ""}₹{money(Math.abs(netWorth))}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Assets minus debts
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-3.5 dark:border-emerald-800/40 dark:from-emerald-950/40 dark:to-emerald-900/20">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
              <TrendingUp className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">
              Assets
            </span>
          </div>
          <p className="font-mono text-xl font-extrabold text-emerald-900 dark:text-emerald-300">
            ₹{money(totalAssets)}
          </p>
          <p
            className={cn(
              "mt-1 text-[11px] font-semibold",
              overallReturns >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400",
            )}
          >
            {overallReturns >= 0 ? "+" : ""}
            {overallReturnsRate.toFixed(1)}% ROI
          </p>
        </div>

        <div className="rounded-xl border border-rose-200/60 bg-gradient-to-br from-rose-50 to-rose-100/40 p-3.5 dark:border-rose-800/40 dark:from-rose-950/40 dark:to-rose-900/20">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-rose-600/10 text-rose-700 dark:text-rose-400">
              <TrendingDown className="size-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600/80 dark:text-rose-400/80">
              Debts
            </span>
          </div>
          <p className="font-mono text-xl font-extrabold text-rose-900 dark:text-rose-300">
            ₹{money(totalLiabilities)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {debts.length} {debts.length === 1 ? "liability" : "liabilities"}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-7">
        <Card className={cn(surfaceCardClass, "lg:col-span-4")}>
          <CardHeader className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
              Asset allocation
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current value by category
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[220px] sm:h-[280px]">
              {assetAllocationData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No assets yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetAllocationData}
                      cx="50%"
                      cy="45%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {assetAllocationData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => `₹${money(value)}`}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      iconType="circle"
                      iconSize={6}
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={cn(surfaceCardClass, "lg:col-span-3")}>
          <CardHeader className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
              Debt payoff
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Share of original balances cleared
            </p>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <div>
              <p className="font-mono text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {debtPayoffProgress.toFixed(0)}% paid
              </p>
              <p className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                ₹{money(totalOriginalDebt - totalLiabilities)} of ₹
                {money(totalOriginalDebt)}
              </p>
            </div>

            <Progress
              value={debtPayoffProgress}
              className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800"
              indicatorClassName="rounded-full bg-emerald-500"
            />

            <div className="space-y-2">
              {debts.slice(0, 3).map((d) => {
                const percentPaid =
                  ((d.totalAmount - d.remainingAmount) / d.totalAmount) * 100;
                return (
                  <div
                    key={d.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-semibold text-slate-900 dark:text-white">
                        {d.name}
                      </span>
                      <span className="shrink-0 font-mono text-slate-500">
                        ₹{money(d.remainingAmount)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {percentPaid.toFixed(0)}% paid
                      {d.monthlyPayment != null
                        ? ` · EMI ₹${d.monthlyPayment.toLocaleString("en-IN")}`
                        : ""}
                    </p>
                  </div>
                );
              })}
              {debts.length === 0 && (
                <p className="text-sm text-slate-500">No debts listed.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PortfolioOverview;
