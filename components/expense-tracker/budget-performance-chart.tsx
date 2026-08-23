"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface CategoryData {
  id?: string;
  name: string;
  spent: number;
  budget: number;
  color: string;
}

interface BudgetPerformanceChartProps {
  data: CategoryData[];
  height?: number | string;
  isLoading?: boolean;
}

function CategoryTick({
  x,
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
}) {
  const label = payload?.value || "";
  const truncated = label.length > 18 ? `${label.slice(0, 17)}…` : label;
  return (
    <g transform={`translate(${x ?? 0},${y ?? 0})`}>
      <title>{label}</title>
      <text
        x={-8}
        y={0}
        dy={4}
        textAnchor="end"
        fontSize={11}
        fontWeight={500}
        fill="hsl(var(--foreground))"
      >
        {truncated}
      </text>
    </g>
  );
}

export function BudgetPerformanceChart({
  data,
  height = 400,
  isLoading = false,
}: BudgetPerformanceChartProps) {
  const chartHeight = Math.max(
    typeof height === "number" ? height : 400,
    data.length * 52 + 80,
  );
  const chartData = data.map((row, index) => ({
    ...row,
    label: row.name,
    key: row.id || `${row.name}-${index}`,
  }));

  return (
    <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm dark:border-slate-800 md:col-span-2">
      <CardHeader className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Budget vs spent</CardTitle>
        <p className="text-xs text-slate-500 dark:text-slate-400">Planned budget against actual spending</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div
          style={{
            height: `${chartHeight}px`,
            width: "100%",
          }}
        >
          {isLoading ? (
            <div className="flex h-full flex-col justify-center gap-5 px-2" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-20 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-4/5 rounded-full" />
                    <Skeleton className="h-3 w-3/5 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center italic text-muted-foreground text-sm">
              No data to compare.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 60, left: 8, bottom: 10 }}
                barGap={4}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  vertical={true}
                  opacity={0.15}
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  dataKey="label"
                  type="category"
                  width={128}
                  interval={0}
                  tickMargin={8}
                  axisLine={false}
                  tickLine={false}
                  tick={<CategoryTick />}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.3)", radius: 4 }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                  }}
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px", paddingBottom: "15px" }}
                />
                <Bar
                  dataKey="budget"
                  fill="hsl(var(--muted-foreground)/0.35)"
                  name="Planned Budget"
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                  animationDuration={1200}
                />
                <Bar
                  dataKey="spent"
                  fill="hsl(var(--primary))"
                  name="Actual Spent"
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                  animationDuration={1200}
                >
                  <LabelList
                    dataKey="spent"
                    position="right"
                    formatter={(v: number) =>
                      v > 0 ? `₹${v.toLocaleString()}` : ""
                    }
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      fill: "hsl(var(--foreground))",
                    }}
                    offset={10}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
