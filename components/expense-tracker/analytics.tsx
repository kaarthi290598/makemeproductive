"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
  const [selectedDates, setSelectedDates] = useState<string[]>([
    formatDateToLocalISO(new Date()).slice(0, 7),
  ]); // Array of YYYY-MM

  const { categoryData, pieData } = useAnalyticsData(
    dateFilterType,
    selectedDates,
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
              value={selectedDates.length > 0 ? selectedDates[0].slice(0, 4) : new Date().getFullYear().toString()}
              onValueChange={(year) => {
                setSelectedDates((prev) => {
                  if (prev.length === 0) {
                    const currentMonth = new Date().toISOString().slice(5, 7);
                    return [`${year}-${currentMonth}`];
                  }
                  return prev.map((d) => `${year}-${d.slice(5, 7)}`);
                });
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 min-w-[120px] justify-between rounded-lg border-border/60 bg-background text-sm shadow-none transition-colors hover:bg-accent font-normal">
                {selectedDates.length === 0 ? "Select Month" : selectedDates.length === 1 ? format(new Date(0, parseInt(selectedDates[0].slice(5, 7)) - 1), "MMMM") : `${selectedDates.length} Months`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[150px]">
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date(0, i);
                const monthStr = format(date, "MM");
                const monthName = format(date, "MMMM");
                
                const currentYear = selectedDates.length > 0 ? selectedDates[0].slice(0, 4) : new Date().getFullYear().toString();
                const value = `${currentYear}-${monthStr}`;
                const isSelected = selectedDates.includes(value);

                return (
                  <DropdownMenuCheckboxItem
                    key={monthStr}
                    checked={isSelected}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDates((prev) => [...prev, value].sort());
                      } else {
                        setSelectedDates((prev) => prev.filter((d) => d !== value));
                      }
                    }}
                  >
                    {monthName}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
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
