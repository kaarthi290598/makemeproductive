"use client";

import { useState } from "react";
import { Overview } from "@/components/expense-tracker/overview";
import { CategorySpendingChart } from "@/components/expense-tracker/category-spending-chart";
import { RecentTransactions } from "@/components/expense-tracker/recent-transactions";
import { useAnalyticsData } from "@/hooks/use-analytics-data";
import { useExpenseStore } from "@/hooks/use-expense-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateToLocalISO } from "@/lib/utils";
import {
  PeriodFilter,
  type DateFilterType,
} from "@/components/finance/period-filter";
import { useReportTabReadyAfterFirstLoad } from "@/components/expense-tracker/tab-ready";

export default function OverviewPage() {
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("month");
  const [selectedDates, setSelectedDates] = useState<string[]>([
    formatDateToLocalISO(new Date()).slice(0, 7),
  ]);
  const [personFilter, setPersonFilter] = useState<string>("all");
  const persons = useExpenseStore((s) => s.persons);

  const { categoryData, isLoading } = useAnalyticsData(
    dateFilterType,
    selectedDates,
    personFilter,
  );
  useReportTabReadyAfterFirstLoad(isLoading);

  return (
    <div className="space-y-6">
      <PeriodFilter
        dateFilterType={dateFilterType}
        onDateFilterTypeChange={setDateFilterType}
        selectedDates={selectedDates}
        onSelectedDatesChange={setSelectedDates}
        extra={
          <Select value={personFilter} onValueChange={setPersonFilter}>
            <SelectTrigger className="h-8 w-full rounded-lg border-slate-200 bg-white text-xs font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:w-[140px]">
              <SelectValue placeholder="All people" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All people</SelectItem>
              {persons.map((person) => (
                <SelectItem key={person.id} value={person.name}>
                  {person.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <Overview
        dateFilterType={dateFilterType}
        selectedDates={selectedDates}
        personFilter={personFilter}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4">
          <CategorySpendingChart data={categoryData} isLoading={isLoading} />
        </div>
        <div className="col-span-1 lg:col-span-3">
          <RecentTransactions
            limit={10}
            global={true}
            personFilter={personFilter}
            title="Recent activity"
          />
        </div>
      </div>
    </div>
  );
}
