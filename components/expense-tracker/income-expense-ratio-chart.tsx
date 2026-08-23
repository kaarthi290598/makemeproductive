"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RatioData {
  name: string;
  value: number;
  color: string;
}

interface IncomeExpenseRatioChartProps {
  data: RatioData[];
  height?: number | string;
  isLoading?: boolean;
}

export function IncomeExpenseRatioChart({
  data,
  height = 300,
  isLoading = false,
}: IncomeExpenseRatioChartProps) {
  return (
    <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm dark:border-slate-800">
      <CardHeader className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Credits vs debits</CardTitle>
        <p className="text-xs text-slate-500 dark:text-slate-400">Cash in versus cash out</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div
          style={{
            height: typeof height === "number" ? `${height}px` : height,
          }}
        >
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-4" aria-hidden>
              <Skeleton className="size-40 rounded-full" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center italic text-muted-foreground text-sm">
              No data available for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={6}
                  dataKey="value"
                  animationDuration={1200}
                >
                  {data.map((entry, index) => (
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
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
