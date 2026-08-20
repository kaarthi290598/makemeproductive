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

export default function OverviewPage() {
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("month");
  const [selectedDates, setSelectedDates] = useState<string[]>([
    formatDateToLocalISO(new Date()).slice(0, 7),
  ]);
  const [personFilter, setPersonFilter] = useState<string>("all");
  const persons = useExpenseStore((s) => s.persons);

  const { categoryData } = useAnalyticsData(
    dateFilterType,
    selectedDates,
    personFilter,
  );

  return (
    <div className="space-y-5">
      <PeriodFilter
        dateFilterType={dateFilterType}
        onDateFilterTypeChange={setDateFilterType}
        selectedDates={selectedDates}
        onSelectedDatesChange={setSelectedDates}
        extra={
          <Select value={personFilter} onValueChange={setPersonFilter}>
            <SelectTrigger className="h-8 w-[140px] rounded-full border-border/50 bg-background text-xs shadow-none">
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4">
          <CategorySpendingChart data={categoryData} />
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
