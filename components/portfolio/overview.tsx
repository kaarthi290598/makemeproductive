"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePortfolioStore } from "@/hooks/use-portfolio-store";
import {
  TrendingUp,
  ShieldCheck,
  Percent,
  Coins,
  ChevronRight,
  TrendingDown,
  PieChart as PieIcon,
  Sparkles,
} from "lucide-react";
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
  "Stocks": "hsl(221, 83%, 53%)", // Blue
  "Mutual Funds": "hsl(160, 60%, 45%)", // Emerald
  "Crypto": "hsl(280, 65%, 60%)", // Purple
  "Real Estate": "hsl(30, 80%, 55%)", // Orange
  "Gold": "hsl(45, 85%, 50%)", // Amber
  "Other": "hsl(340, 75%, 55%)", // Rose
};

export function PortfolioOverview() {
  const { investments, debts } = usePortfolioStore();

  const totalAssets = useMemo(() => {
    return investments.reduce((acc, inv) => {
      const current = inv.contributions && inv.contributions.length > 0
        ? [...inv.contributions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].currentValue
        : 0;
      return acc + current;
    }, 0);
  }, [investments]);

  const totalInvested = useMemo(() => {
    return investments.reduce((acc, inv) => {
      const invested = inv.contributions?.reduce((sum, c) => sum + c.amount, 0) || 0;
      return acc + invested;
    }, 0);
  }, [investments]);

  const totalLiabilities = useMemo(() => {
    return debts.reduce((acc, d) => acc + d.remainingAmount, 0);
  }, [debts]);

  const netWorth = totalAssets - totalLiabilities;
  const overallReturns = totalAssets - totalInvested;
  const overallReturnsRate = totalInvested > 0 ? (overallReturns / totalInvested) * 100 : 0;

  // Asset Allocation Pie Chart Data
  const assetAllocationData = useMemo(() => {
    const categories: Record<string, number> = {};
    investments.forEach((inv) => {
      const current = inv.contributions && inv.contributions.length > 0
        ? [...inv.contributions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].currentValue
        : 0;
      categories[inv.category] = (categories[inv.category] || 0) + current;
    });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      color: ALLOCATION_COLORS[name] || "hsl(var(--primary))",
    }));
  }, [investments]);

  // Overall Debt Payoff Progress
  const totalOriginalDebt = useMemo(() => {
    return debts.reduce((acc, d) => acc + d.totalAmount, 0);
  }, [debts]);

  const debtPayoffProgress = useMemo(() => {
    if (totalOriginalDebt === 0) return 100;
    const paid = totalOriginalDebt - totalLiabilities;
    return (paid / totalOriginalDebt) * 100;
  }, [totalOriginalDebt, totalLiabilities]);

  return (
    <div className="space-y-6">
      {/* 3 Grid Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Net Worth Card */}
        <Card className="overflow-hidden border border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Net Worth</p>
              <p className={cn(
                "text-3xl font-bold tracking-tight truncate mt-0.5",
                netWorth >= 0 ? "text-foreground" : "text-rose-600"
              )}>
                ₹{netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Assets minus liabilities</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Assets Card */}
        <Card className="overflow-hidden border border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <TrendingUp className="size-5 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Assets</p>
              <p className="text-3xl font-bold tracking-tight text-emerald-600 truncate mt-0.5">
                ₹{totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <div className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground">
                <span className={cn(
                  "font-medium",
                  overallReturns >= 0 ? "text-emerald-600" : "text-rose-600"
                )}>
                  {overallReturns >= 0 ? "+" : ""}
                  {overallReturnsRate.toFixed(1)}%
                </span>
                <span>ROI returns</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities Card */}
        <Card className="overflow-hidden border border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
              <TrendingDown className="size-5 text-rose-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Debts</p>
              <p className="text-3xl font-bold tracking-tight text-rose-600 truncate mt-0.5">
                ₹{totalLiabilities.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {debts.length} active liabilities
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Section */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Asset Allocation Chart */}
        <Card className="border border-border/50 bg-card shadow-sm rounded-xl overflow-hidden lg:col-span-4">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
              <PieIcon className="size-3.5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Asset Allocation</CardTitle>
              <p className="text-[10px] text-muted-foreground mt-0.5">Distribution of asset valuations by class</p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px]">
              {assetAllocationData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground italic">
                  No assets listed yet.
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
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderRadius: "12px",
                        border: "1px solid hsl(var(--border))",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                      }}
                      formatter={(value: number) => `₹${value.toLocaleString()}`}
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

        {/* Debt Payoff Visualizer */}
        <Card className="border border-border/50 bg-card shadow-sm rounded-xl overflow-hidden lg:col-span-3 flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10">
                <ShieldCheck className="size-3.5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Debt Payoff Progress</CardTitle>
                <p className="text-[10px] text-muted-foreground mt-0.5">Overall percentage of total liabilities paid off</p>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold tracking-tight text-emerald-600">
                    {debtPayoffProgress.toFixed(1)}% Paid
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    ₹{(totalOriginalDebt - totalLiabilities).toLocaleString(undefined, { maximumFractionDigits: 0 })} of ₹{totalOriginalDebt.toLocaleString(undefined, { maximumFractionDigits: 0 })} cleared
                  </p>
                </div>
                <Coins className="size-8 text-emerald-500/20" />
              </div>

              <div className="w-full">
                <Progress
                  value={debtPayoffProgress}
                  className="h-2 rounded-full bg-muted"
                  indicatorClassName="bg-emerald-500 rounded-full"
                />
              </div>

              <div className="h-[px] bg-border/40" />

              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Liabilities</p>
                <div className="space-y-2">
                  {debts.slice(0, 3).map((d) => {
                    const percentPaid = ((d.totalAmount - d.remainingAmount) / d.totalAmount) * 100;
                    return (
                      <div key={d.id} className="flex flex-col gap-1.5 p-2 rounded-lg bg-muted/40 border border-border/30">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-foreground truncate max-w-[120px]">{d.name}</span>
                          <span className="text-muted-foreground font-medium">₹{d.remainingAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                          <span>{d.monthlyPayment !== undefined && d.monthlyPayment !== null ? `EMI: ₹${d.monthlyPayment.toLocaleString()}/mo` : 'No EMI set'}</span>
                          <span>{percentPaid.toFixed(0)}% paid</span>
                        </div>
                      </div>
                    );
                  })}
                  {debts.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No debt balances listed!</p>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
export default PortfolioOverview;
