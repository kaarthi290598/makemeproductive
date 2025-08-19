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

import { Todos } from "@/lib/types/type";

export default function TodoChart({ todos }: { todos: Todos }) {
  // Count tasks per category
  const categoryCounts = todos
    .filter((todo) => !todo.isCompleted) // Filter only completed todos
    .reduce(
      (acc, todo) => {
        const categoryName = todo.category.category;
        acc[categoryName] = (acc[categoryName] || 0) + 1;
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
    <div className="w-full overflow-scroll rounded-lg">
      <Card className="h-full border-none bg-sidebar">
        <CardHeader>
          <CardTitle>Tasks by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="h-full w-full overflow-scroll"
          >
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
