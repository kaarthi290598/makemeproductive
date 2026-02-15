"use client";

import { useMemo } from "react";
import { useExpenseStore } from "./use-expense-store";

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

export function useAnalyticsData(
  dateFilterType: "all" | "month" | "year",
  selectedDate: string,
) {
  const { categories, transactions } = useExpenseStore();

  // Filter Transactions based on Date
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (dateFilterType === "all") return true;
      if (dateFilterType === "month") {
        return t.date.startsWith(selectedDate);
      }
      if (dateFilterType === "year") {
        return t.date.startsWith(selectedDate.slice(0, 4));
      }
      return true;
    });
  }, [transactions, dateFilterType, selectedDate]);

  // Aggregate Data for Charts
  const categoryData = useMemo(() => {
    const spentByCategory = new Map<string, number>();

    filteredTransactions.forEach((t) => {
      if (t.type === "expense") {
        let catId = t.category_id;

        // Fallback for missing ID: Match by name if joined data exists
        if (!catId && t.expense_categories?.name) {
          const found = categories.find(
            (c) => c.name === t.expense_categories?.name,
          );
          if (found) catId = found.id;
        }

        if (catId) {
          const current = spentByCategory.get(catId) || 0;
          spentByCategory.set(catId, current + t.amount);
        }
      }
    });

    return categories
      .map((cat, idx) => {
        const spent = spentByCategory.get(cat.id) || 0;
        let budget = cat.monthly_budget;
        if (dateFilterType === "year") {
          budget = cat.monthly_budget * 12;
        } else if (dateFilterType === "all") {
          budget = 0;
        }

        return {
          name: cat.name,
          spent: parseFloat(spent.toFixed(2)),
          budget: parseFloat(budget.toFixed(2)),
          color: cat.color || palette[idx % palette.length],
        };
      })
      .filter((c) => c.spent > 0 || c.budget > 0)
      .sort((a, b) => b.spent - a.spent); // Show highest spent first
  }, [categories, filteredTransactions, dateFilterType]);

  const { totalIncome, totalExpense } = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    return { totalIncome: income, totalExpense: expense };
  }, [filteredTransactions]);

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
  };
}
