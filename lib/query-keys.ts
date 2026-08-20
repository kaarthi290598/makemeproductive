import type { DateFilterType } from "@/components/finance/period-filter";
import type { ExpenseTransactionFilters } from "@/types/expense";

export const dashboardQueryKey = ["dashboard"] as const;

export const expenseQueryKeys = {
  all: ["expense"] as const,
  page: (filters: ExpenseTransactionFilters, page: number, pageSize: number) =>
    ["expense", "page", filters, page, pageSize] as const,
  stats: (
    dateFilterType: DateFilterType,
    selectedDates: string[],
    personFilter: string,
  ) => ["expense", "stats", dateFilterType, selectedDates, personFilter] as const,
  recent: (limit: number, personFilter: string) =>
    ["expense", "recent", limit, personFilter] as const,
};
