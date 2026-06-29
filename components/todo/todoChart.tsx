"use client";
import React from "react";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { Todos } from "@/lib/types/type";
import { BarChart3 } from "lucide-react";

// Modern color palette
const CHART_COLORS = [
  "hsl(221, 83%, 53%)", // Blue
  "hsl(160, 60%, 45%)", // Emerald
  "hsl(280, 65%, 60%)", // Purple
  "hsl(30, 80%, 55%)", // Orange
  "hsl(340, 75%, 55%)", // Rose
  "hsl(190, 70%, 45%)", // Cyan
  "hsl(45, 85%, 50%)", // Amber
];

export default function TodoChart({ todos }: { todos: Todos }) {
  // Count tasks per category
  const categoryCounts = todos
    .filter((todo) => !todo.isCompleted)
    .reduce(
      (acc, todo) => {
        const categoryName = todo.category
          ? todo.category.category
          : "Uncategorized";
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
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }),
  );

  // Chart configuration
  const chartConfig = Object.fromEntries(
    Object.keys(categoryCounts).map((category, index) => [
      category,
      {
        label: category,
        color: CHART_COLORS[index % CHART_COLORS.length],
      },
    ]),
  ) satisfies ChartConfig;

  return (
    <div className="flex h-full flex-col">
      {/* Chart Header */}
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="size-3.5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Tasks by Category
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Distribution of pending tasks
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-4">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 8, right: 8, top: 4, bottom: 4 }}
            barGap={4}
          >
            <YAxis
              dataKey="category"
              type="category"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              width={80}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label ?? value
              }
            />
            <XAxis dataKey="tasks" type="number" hide />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", radius: 4 }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="tasks" layout="vertical" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  style={{ filter: "brightness(1.05)" }}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
