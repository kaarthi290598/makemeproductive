"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

export function IncomeExpenseRatioChart({
  data,
  height = 350,
}: IncomeExpenseRatioChartProps) {
  return (
    <Card className="border-primary/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Income vs Expense Ratio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          style={{
            height: typeof height === "number" ? `${height}px` : height,
          }}
        >
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center italic text-muted-foreground">
              No data available for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
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
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
