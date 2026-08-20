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
    <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/80 p-3 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full bg-muted/80 p-1">
          {(["month", "year", "all"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onDateFilterTypeChange(opt)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all",
                dateFilterType === opt
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt === "all" ? "All time" : opt}
            </button>
          ))}
        </div>

        {(dateFilterType === "month" || dateFilterType === "year") && (
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="h-8 w-[92px] rounded-full border-border/50 bg-background text-xs shadow-none">
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
        <div className="flex flex-wrap gap-1.5">
          {MONTHS.map((month) => {
            const value = `${year}-${month.key}`;
            const selected = selectedDates.includes(value);
            return (
              <button
                key={month.key}
                type="button"
                onClick={() => toggleMonth(month.key)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all",
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
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
