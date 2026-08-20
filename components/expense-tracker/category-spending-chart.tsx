"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="overflow-hidden rounded-2xl border-border/40 shadow-none">
      <CardHeader className="border-b border-border/40 px-5 py-4">
        <CardTitle className="text-sm font-semibold">Spending by category</CardTitle>
        <p className="text-xs text-muted-foreground">Total spent per category</p>
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
