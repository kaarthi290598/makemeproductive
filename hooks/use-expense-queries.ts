"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  fetchExpenseStats,
  fetchExpenseTransactionsPage,
  fetchRecentExpenseTransactions,
} from "@/lib/actions/expenseData";
import { expenseQueryKeys } from "@/lib/query-keys";
import type { DateFilterType } from "@/components/finance/period-filter";
import type { ExpenseTransactionFilters } from "@/types/expense";
import { useExpenseStore } from "@/hooks/use-expense-store";

const palette = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
];

export function useInvalidateExpense() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: expenseQueryKeys.all });
}

export function useExpenseStats(
  dateFilterType: DateFilterType,
  selectedDates: string[],
  personFilter = "all",
) {
  return useQuery({
    queryKey: expenseQueryKeys.stats(
      dateFilterType,
      selectedDates,
      personFilter,
    ),
    queryFn: () =>
      fetchExpenseStats({
        dateFilterType,
        selectedDates,
        personFilter,
      }),
  });
}

export function useExpenseTransactionsPage(
  filters: ExpenseTransactionFilters,
  page: number,
  pageSize = 40,
) {
  return useQuery({
    queryKey: expenseQueryKeys.page(filters, page, pageSize),
    queryFn: () => fetchExpenseTransactionsPage(filters, page, pageSize),
  });
}

export function useRecentExpenseTransactions(
  limit = 10,
  personFilter = "all",
) {
  return useQuery({
    queryKey: expenseQueryKeys.recent(limit, personFilter),
    queryFn: () => fetchRecentExpenseTransactions(limit, personFilter),
  });
}

export function useAnalyticsData(
  dateFilterType: DateFilterType,
  selectedDates: string[],
  personFilter = "all",
) {
  const categories = useExpenseStore((s) => s.categories);
  const { data: stats, isLoading } = useExpenseStats(
    dateFilterType,
    selectedDates,
    personFilter,
  );

  const categoryData = useMemo(() => {
    const spentByCategory = stats?.spentByCategory || {};
    const knownIds = new Set(categories.map((c) => c.id));

    const rows = categories.map((cat, idx) => {
      const spent = spentByCategory[cat.id] || 0;
      let budget = cat.monthly_budget;
      if (dateFilterType === "year") {
        budget = cat.monthly_budget * 12;
      } else if (dateFilterType === "all") {
        budget = 0;
      }

      return {
        id: cat.id,
        name: cat.name,
        spent: parseFloat(spent.toFixed(2)),
        budget: parseFloat(budget.toFixed(2)),
        color: cat.color || palette[idx % palette.length],
      };
    });

    const extraIds = Object.keys(spentByCategory).filter(
      (id) => !knownIds.has(id) && spentByCategory[id] > 0,
    );

    for (const id of extraIds) {
      rows.push({
        id,
        name: id === "__uncategorized__" ? "Uncategorized" : "Unknown",
        spent: parseFloat(spentByCategory[id].toFixed(2)),
        budget: 0,
        color: "#94a3b8",
      });
    }

    return rows
      .filter((c) => c.spent > 0 || c.budget > 0)
      .sort((a, b) => b.spent - a.spent);
  }, [categories, stats, dateFilterType]);

  const totalIncome = stats?.totalIncome || 0;
  const totalExpense = stats?.totalExpense || 0;

  const pieData = useMemo(() => {
    if (totalIncome === 0 && totalExpense === 0) return [];
    return [
      { name: "Credits", value: totalIncome, color: "#10b981" },
      { name: "Debits", value: totalExpense, color: "#f43f5e" },
    ];
  }, [totalIncome, totalExpense]);

  return {
    categoryData,
    pieData,
    totalIncome,
    totalExpense,
    isLoading,
  };
}
