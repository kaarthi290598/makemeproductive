"use client";

import { useState } from "react";
import { Overview } from "@/components/expense-tracker/overview";
import { CategorySpendingChart } from "@/components/expense-tracker/category-spending-chart";
import { RecentTransactions } from "@/components/expense-tracker/recent-transactions";
import { useAnalyticsData } from "@/hooks/use-analytics-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { formatDateToLocalISO } from "@/lib/utils";

export default function OverviewPage() {
  const [dateFilterType, setDateFilterType] = useState<
    "all" | "month" | "year"
  >("month");
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateToLocalISO(new Date()).slice(0, 7),
  ); // YYYY-MM

  const { categoryData } = useAnalyticsData(dateFilterType, selectedDate);

  return (
    <div className="space-y-4">
      {/* Date Filters */}
      {/* Date Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-sidebar p-2 shadow-sm lg:p-3">
        <Select
          value={dateFilterType}
          onValueChange={(val) =>
            setDateFilterType(val as "all" | "month" | "year")
          }
        >
          <SelectTrigger className="h-9 w-full border-none bg-secondary sm:w-[130px]">
            <SelectValue placeholder="Date Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>

        {(dateFilterType === "month" || dateFilterType === "year") && (
          <Select
            value={selectedDate.slice(0, 4)}
            onValueChange={(year) => {
              const currentMonth =
                selectedDate.slice(5, 7) ||
                new Date().toISOString().slice(5, 7);
              setSelectedDate(`${year}-${currentMonth}`);
            }}
          >
            <SelectTrigger className="h-9 w-[calc(50%-4px)] border-none bg-secondary sm:w-[100px]">
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
        )}

        {dateFilterType === "month" && (
          <Select
            value={selectedDate.slice(5, 7)}
            onValueChange={(month) => {
              const currentYear = selectedDate.slice(0, 4);
              setSelectedDate(`${currentYear}-${month}`);
            }}
          >
            <SelectTrigger className="h-9 w-[calc(50%-4px)] border-none bg-secondary sm:w-[120px]">
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

      <Overview dateFilterType={dateFilterType} selectedDate={selectedDate} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4">
          <CategorySpendingChart data={categoryData} />
        </div>
        <div className="col-span-1 lg:col-span-3">
          <RecentTransactions
            limit={10}
            global={true}
            title="Recent Activity"
          />
        </div>
      </div>
    </div>
  );
}
