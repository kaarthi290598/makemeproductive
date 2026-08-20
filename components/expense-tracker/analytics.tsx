"use client";

import { useState } from "react";
import { CategorySpendingChart } from "./category-spending-chart";
import { IncomeExpenseRatioChart } from "./income-expense-ratio-chart";
import { BudgetPerformanceChart } from "./budget-performance-chart";
import { useAnalyticsData } from "@/hooks/use-analytics-data";
import { formatDateToLocalISO } from "@/lib/utils";
import {
  PeriodFilter,
  type DateFilterType,
} from "@/components/finance/period-filter";

export function Analytics() {
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("month");
  const [selectedDates, setSelectedDates] = useState<string[]>([
    formatDateToLocalISO(new Date()).slice(0, 7),
  ]);

  const { categoryData, pieData } = useAnalyticsData(
    dateFilterType,
    selectedDates,
  );

  return (
    <div className="space-y-5">
      <PeriodFilter
        dateFilterType={dateFilterType}
        onDateFilterTypeChange={setDateFilterType}
        selectedDates={selectedDates}
        onSelectedDatesChange={setSelectedDates}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <CategorySpendingChart data={categoryData} />
        <IncomeExpenseRatioChart data={pieData} />
        <BudgetPerformanceChart data={categoryData} />
      </div>
    </div>
  );
}
