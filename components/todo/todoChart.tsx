"use client";
import React from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTodo } from "./todoContext";

export default function TodoChart() {
  const { todos } = useTodo();

  // Count tasks per category
  const categoryCounts = todos.reduce(
    (acc, todo) => {
      acc[todo.category] = (acc[todo.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Convert category data into chart format
  const chartData = Object.entries(categoryCounts).map(
    ([category, count], index) => ({
      category,
      tasks: count,
      fill: `hsl(var(--chart-${index + 1}))`,
    }),
  );

  // Chart configuration
  const chartConfig = Object.fromEntries(
    Object.keys(categoryCounts).map((category, index) => [
      category,
      { label: category, color: `hsl(var(--chart-${index + 1}))` },
    ]),
  ) satisfies ChartConfig;

  return (
    <div className="h-full w-full flex-1 rounded-lg">
      <Card className="border-none bg-sidebar">
        <CardHeader>
          <CardTitle>Tasks by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ left: 4 }}
            >
              <YAxis
                dataKey="category"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  chartConfig[value as keyof typeof chartConfig]?.label
                }
              />
              <XAxis dataKey="tasks" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="tasks" layout="vertical" radius={5} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
