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
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.2}
                />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={80}
                  axisLine={false}
                  tickLine={false}
                  style={{ fontSize: "11px" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  style={{ fontSize: "11px" }}
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
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                  animationDuration={1500}
                />
                <Bar
                  dataKey="spent"
                  fill="#f43f5e"
                  name="Actual Spent"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                  animationDuration={1500}
                >
                  <LabelList
                    dataKey="spent"
                    position="top"
                    formatter={(v: number) =>
                      v > 0 ? `₹${v.toLocaleString()}` : ""
                    }
                    style={{ fontSize: "10px", fontWeight: 600 }}
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
