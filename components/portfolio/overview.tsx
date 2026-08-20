"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePortfolioStore } from "@/hooks/use-portfolio-store";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

const ALLOCATION_COLORS: Record<string, string> = {
  Stocks: "hsl(221, 83%, 53%)",
  "Mutual Funds": "hsl(160, 60%, 45%)",
  Crypto: "hsl(280, 65%, 60%)",
  "Real Estate": "hsl(30, 80%, 55%)",
  Gold: "hsl(45, 85%, 50%)",
  Other: "hsl(340, 75%, 55%)",
};

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
      color: ALLOCATION_COLORS[name] || "hsl(var(--primary))",
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
        <Card className="rounded-2xl border-border/40 shadow-none">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">
              Net worth
            </p>
            <p
              className={cn(
                "mt-0.5 truncate text-2xl font-semibold tracking-tight",
                netWorth >= 0 ? "text-foreground" : "text-rose-600",
              )}
            >
              ₹
              {netWorth.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Assets minus debts
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/40 shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10">
              <TrendingUp className="size-5 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">
                Assets
              </p>
              <p className="mt-0.5 truncate text-2xl font-semibold tracking-tight text-emerald-600">
                ₹
                {totalAssets.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-[11px] font-medium",
                  overallReturns >= 0 ? "text-emerald-600" : "text-rose-600",
                )}
              >
                {overallReturns >= 0 ? "+" : ""}
                {overallReturnsRate.toFixed(1)}% ROI
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/40 shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10">
              <TrendingDown className="size-5 text-rose-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">Debts</p>
              <p className="mt-0.5 truncate text-2xl font-semibold tracking-tight text-rose-600">
                ₹
                {totalLiabilities.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {debts.length} {debts.length === 1 ? "liability" : "liabilities"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-7">
        <Card className="overflow-hidden rounded-2xl border-border/40 shadow-none lg:col-span-4">
          <CardHeader className="border-b border-border/40 px-5 py-4">
            <CardTitle className="text-sm font-semibold">
              Asset allocation
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Current value by category
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px]">
              {assetAllocationData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
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
                        backgroundColor: "hsl(var(--card))",
                        borderRadius: "12px",
                        border: "1px solid hsl(var(--border))",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                      }}
                      formatter={(value: number) =>
                        `₹${value.toLocaleString("en-IN")}`
                      }
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

        <Card className="overflow-hidden rounded-2xl border-border/40 shadow-none lg:col-span-3">
          <CardHeader className="border-b border-border/40 px-5 py-4">
            <CardTitle className="text-sm font-semibold">
              Debt payoff
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Share of original balances cleared
            </p>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-emerald-600">
                {debtPayoffProgress.toFixed(0)}% paid
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                ₹
                {(totalOriginalDebt - totalLiabilities).toLocaleString(
                  "en-IN",
                  { maximumFractionDigits: 0 },
                )}{" "}
                of ₹
                {totalOriginalDebt.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>

            <Progress
              value={debtPayoffProgress}
              className="h-1.5 rounded-full bg-muted"
              indicatorClassName="rounded-full bg-emerald-500"
            />

            <div className="space-y-2">
              {debts.slice(0, 3).map((d) => {
                const percentPaid =
                  ((d.totalAmount - d.remainingAmount) / d.totalAmount) * 100;
                return (
                  <div
                    key={d.id}
                    className="rounded-xl border border-border/40 bg-muted/30 p-3"
                  >
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-medium">{d.name}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        ₹
                        {d.remainingAmount.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {percentPaid.toFixed(0)}% paid
                      {d.monthlyPayment != null
                        ? ` · EMI ₹${d.monthlyPayment.toLocaleString("en-IN")}`
                        : ""}
                    </p>
                  </div>
                );
              })}
              {debts.length === 0 && (
                <p className="text-sm text-muted-foreground">No debts listed.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PortfolioOverview;
