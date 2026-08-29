"use client";

import type { ReactNode } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DateFilterType = "all" | "month" | "year";

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const date = new Date(0, i);
  return {
    key: format(date, "MM"),
    short: format(date, "MMM"),
  };
});

interface PeriodFilterProps {
  dateFilterType: DateFilterType;
  onDateFilterTypeChange: (value: DateFilterType) => void;
  selectedDates: string[];
  onSelectedDatesChange: (value: string[]) => void;
  extra?: ReactNode;
}

export function PeriodFilter({
  dateFilterType,
  onDateFilterTypeChange,
  selectedDates,
  onSelectedDatesChange,
  extra,
}: PeriodFilterProps) {
  const year =
    selectedDates[0]?.slice(0, 4) || new Date().getFullYear().toString();

  const setYear = (nextYear: string) => {
    if (selectedDates.length === 0) {
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
      onSelectedDatesChange([`${nextYear}-${currentMonth}`]);
      return;
    }
    onSelectedDatesChange(selectedDates.map((d) => `${nextYear}-${d.slice(5, 7)}`));
  };

  const toggleMonth = (monthKey: string) => {
    const value = `${year}-${monthKey}`;
    if (selectedDates.includes(value)) {
      onSelectedDatesChange(selectedDates.filter((d) => d !== value));
    } else {
      onSelectedDatesChange([...selectedDates, value].sort());
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/60 bg-slate-100 p-1 text-xs dark:border-slate-700/60 dark:bg-slate-800">
          {(["month", "year", "all"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onDateFilterTypeChange(opt)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 font-bold capitalize transition-all",
                dateFilterType === opt
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
              )}
            >
              {opt === "all" ? "All time" : opt}
            </button>
          ))}
        </div>

        {(dateFilterType === "month" || dateFilterType === "year") && (
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="h-8 w-[92px] rounded-lg border-slate-200 bg-white text-xs font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
                (y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        )}

        {extra}
      </div>

      {dateFilterType === "month" && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:gap-1.5">
          {MONTHS.map((month) => {
            const value = `${year}-${month.key}`;
            const selected = selectedDates.includes(value);
            return (
              <button
                key={month.key}
                type="button"
                onClick={() => toggleMonth(month.key)}
                className={cn(
                  "shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all",
                  selected
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white",
                )}
              >
                {month.short}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
