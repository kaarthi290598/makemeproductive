"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

interface CategoryData {
  name: string;
  spent: number;
  budget: number;
  color: string;
}

interface CategorySpendingChartProps {
  data: CategoryData[];
  height?: number | string;
}

export function CategorySpendingChart({
  data,
  height = 400,
}: CategorySpendingChartProps) {
  return (
    <Card className="border border-border/50 bg-card shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="size-3.5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-sm font-semibold">Spending by Category</CardTitle>
          <p className="text-[10px] text-muted-foreground mt-0.5">Total spent per category</p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div
          style={{
            height: typeof height === "number" ? `${height}px` : height,
          }}
        >
          {data.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-2 italic text-muted-foreground">
              <p className="text-sm">No expenses found for this period.</p>
              <p className="text-xs not-italic">Try changing the date filter.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ left: 0, right: 60, top: 10, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  opacity={0.15}
                />
                <XAxis
                  type="number"
                  hide={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 500, fill: "hsl(var(--foreground))" }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.5)", radius: 4 }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                  }}
                  formatter={(value: number) => [
                    `₹${value.toLocaleString()}`,
                    "Spent",
                  ]}
                />
                <Bar
                  dataKey="spent"
                  radius={[0, 6, 6, 0]}
                  animationDuration={1200}
                  barSize={18}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || "hsl(var(--primary))"} />
                  ))}
                  <LabelList
                    dataKey="spent"
                    position="right"
                    formatter={(v: number) =>
                      v > 0 ? `₹${v.toLocaleString()}` : ""
                    }
                    style={{
                      fontSize: "11px",
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
