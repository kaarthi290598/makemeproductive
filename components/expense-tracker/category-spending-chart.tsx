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
  height = 500,
}: CategorySpendingChartProps) {
  return (
    <Card className="border-primary/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Spending by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          style={{
            height: typeof height === "number" ? `${height}px` : height,
          }}
        >
          {data.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-2 italic text-muted-foreground">
              <p>No expenses found for this period.</p>
              <p className="text-xs not-italic">
                Try changing the date filter.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ left: 10, right: 60, top: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  opacity={0.3}
                />
                <XAxis
                  type="number"
                  hide={false}
                  axisLine={false}
                  tickLine={false}
                  style={{ fontSize: "10px" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  axisLine={false}
                  tickLine={false}
                  style={{ fontSize: "11px", fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: number) => [
                    `₹${value.toLocaleString()}`,
                    "Spent",
                  ]}
                />
                <Bar
                  dataKey="spent"
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                  barSize={20}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="spent"
                    position="right"
                    formatter={(v: number) =>
                      v > 0 ? `₹${v.toLocaleString()}` : ""
                    }
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      fill: "hsl(var(--foreground))",
                    }}
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
