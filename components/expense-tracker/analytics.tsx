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
import { useReportTabReadyAfterFirstLoad } from "./tab-ready";

export function Analytics() {
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("month");
  const [selectedDates, setSelectedDates] = useState<string[]>([
    formatDateToLocalISO(new Date()).slice(0, 7),
  ]);

  const { categoryData, pieData, isLoading } = useAnalyticsData(
    dateFilterType,
    selectedDates,
  );
  useReportTabReadyAfterFirstLoad(isLoading);

  return (
    <div className="space-y-6">
      <PeriodFilter
        dateFilterType={dateFilterType}
        onDateFilterTypeChange={setDateFilterType}
        selectedDates={selectedDates}
        onSelectedDatesChange={setSelectedDates}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <CategorySpendingChart data={categoryData} isLoading={isLoading} />
        <IncomeExpenseRatioChart data={pieData} isLoading={isLoading} />
        <BudgetPerformanceChart data={categoryData} isLoading={isLoading} />
      </div>
    </div>
  );
}
