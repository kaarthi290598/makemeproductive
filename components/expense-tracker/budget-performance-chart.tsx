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
  height = 500,
}: BudgetPerformanceChartProps) {
  return (
    <Card className="border-primary/10 shadow-lg md:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Budget vs Actual Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          style={{
            height: typeof height === "number" ? `${height}px` : height,
            width: "100%",
          }}
        >
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center italic text-muted-foreground">
              No data to compare.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 20, right: 60, left: 10, bottom: 20 }}
                barGap={5}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  vertical={true}
                  opacity={0.2}
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  style={{ fontSize: "11px" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                  style={{ fontSize: "11px", fontWeight: 500 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                />
                <Legend verticalAlign="top" align="right" />
                <Bar
                  dataKey="budget"
                  fill="#94a3b8"
                  name="Planned Budget"
                  radius={[0, 4, 4, 0]}
                  barSize={15}
                  animationDuration={1500}
                />
                <Bar
                  dataKey="spent"
                  fill="#f43f5e"
                  name="Actual Spent"
                  radius={[0, 4, 4, 0]}
                  barSize={15}
                  animationDuration={1500}
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
