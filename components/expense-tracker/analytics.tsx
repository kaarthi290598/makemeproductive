"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CategorySpendingChart } from "./category-spending-chart";
import { IncomeExpenseRatioChart } from "./income-expense-ratio-chart";
import { BudgetPerformanceChart } from "./budget-performance-chart";
import { Calendar, Filter } from "lucide-react";

import { useAnalyticsData } from "@/hooks/use-analytics-data";
import { formatDateToLocalISO } from "@/lib/utils";

export function Analytics() {
  const [dateFilterType, setDateFilterType] = useState<
    "all" | "month" | "year"
  >("month"); // Default to month for better initial view
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateToLocalISO(new Date()).slice(0, 7),
  ); // YYYY-MM

  const { categoryData, pieData } = useAnalyticsData(
    dateFilterType,
    selectedDate,
  );

  return (
    <div className="space-y-6">
      {/* Premium Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-card p-3 shadow-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground mr-2">
          <Filter className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Analyze By</span>
        </div>

        <Select
          value={dateFilterType}
          onValueChange={(val) =>
            setDateFilterType(val as "all" | "month" | "year")
          }
        >
          <SelectTrigger className="h-9 w-[130px] rounded-lg border-border/60 bg-background text-sm shadow-none transition-colors hover:bg-accent">
            <SelectValue placeholder="Date Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>

        {(dateFilterType === "month" || dateFilterType === "year") && (
          <div className="flex items-center gap-2">
            <div className="h-4 w-px bg-border" />
            <Select
              value={selectedDate.slice(0, 4)}
              onValueChange={(year) => {
                const currentMonth =
                  selectedDate.slice(5, 7) ||
                  new Date().toISOString().slice(5, 7);
                setSelectedDate(`${year}-${currentMonth}`);
              }}
            >
              <SelectTrigger className="h-9 w-[100px] rounded-lg border-border/60 bg-background text-sm shadow-none transition-colors hover:bg-accent">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - i,
                ).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {dateFilterType === "month" && (
          <Select
            value={selectedDate.slice(5, 7)}
            onValueChange={(month) => {
              const currentYear = selectedDate.slice(0, 4);
              setSelectedDate(`${currentYear}-${month}`);
            }}
          >
            <SelectTrigger className="h-9 w-[120px] rounded-lg border-border/60 bg-background text-sm shadow-none transition-colors hover:bg-accent">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date(0, i);
                const monthStr = format(date, "MM");
                const monthName = format(date, "MMMM");
                return { value: monthStr, label: monthName };
              }).map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CategorySpendingChart data={categoryData} />
        <IncomeExpenseRatioChart data={pieData} />
        <BudgetPerformanceChart data={categoryData} />
      </div>
    </div>
  );
}
