"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  name: string;
  spent: number;
  budget: number;
  color: string;
}

interface BudgetPerformanceChartProps {
  data: CategoryData[];
  height?: number | string;
}

export function BudgetPerformanceChart({
  data,
  height = 400,
}: BudgetPerformanceChartProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border-border/40 shadow-none md:col-span-2">
      <CardHeader className="border-b border-border/40 px-5 py-4">
        <CardTitle className="text-sm font-semibold">Budget vs spent</CardTitle>
        <p className="text-xs text-muted-foreground">Planned budget against actual spending</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div
          style={{
            height: typeof height === "number" ? `${height}px` : height,
            width: "100%",
          }}
        >
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center italic text-muted-foreground text-sm">
              No data to compare.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 10, right: 60, left: 0, bottom: 10 }}
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
                  dataKey="name"
                  type="category"
                  width={120}
                  tickMargin={8}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 500, fill: "hsl(var(--foreground))" }}
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
