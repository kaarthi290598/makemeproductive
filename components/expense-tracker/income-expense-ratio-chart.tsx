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
  height = 300,
}: IncomeExpenseRatioChartProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border-border/40 shadow-none">
      <CardHeader className="border-b border-border/40 px-5 py-4">
        <CardTitle className="text-sm font-semibold">Credits vs debits</CardTitle>
        <p className="text-xs text-muted-foreground">Cash in versus cash out</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div
          style={{
            height: typeof height === "number" ? `${height}px` : height,
          }}
        >
          {data.length === 0 ? (
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
