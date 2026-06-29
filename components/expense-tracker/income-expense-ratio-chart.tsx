"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieIcon } from "lucide-react";
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
    <Card className="border border-border/50 bg-card shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-2 border-b border-border/50 py-3">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
          <PieIcon className="size-3.5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-sm font-semibold">Income vs Expense Ratio</CardTitle>
          <p className="text-[10px] text-muted-foreground mt-0.5">Ratio of incoming vs outgoing cash flow</p>
        </div>
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
