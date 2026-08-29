"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";
import { Category, Transaction, Person, MonthlySummary, ExpenseTransactionFilters, ExpenseStats } from "@/types/expense";

/**
 * CATEGORIES ACTIONS
 */

export async function fetchExpenseCategories() {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("expense_categories")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    throw new Error(`Error fetching categories: ${error.message}`);
  }

  return data as Category[];
}

export async function createExpenseCategory(
  category: Omit<Category, "id" | "user_id" | "spent">,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("expense_categories")
    .insert({
      ...category,
      user_id: userId,
      spent: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    throw new Error(`Error creating category: ${error.message}`);
  }

  return data as Category;
}

export async function updateExpenseCategory(
  id: string,
  updates: Partial<Category>,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("expense_categories")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating category:", error);
    throw new Error(`Error updating category: ${error.message}`);
  }

  return data as Category;
}

export async function deleteExpenseCategory(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { error } = await supabase
    .from("expense_categories")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting category:", error);
    throw new Error(`Error deleting category: ${error.message}`);
  }

  return { success: true };
}

/**
 * TRANSACTIONS ACTIONS
 */

function monthBounds(yyyyMm: string) {
  const [year, month] = yyyyMm.split("-").map(Number);
  const start = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${String(nextYear).padStart(4, "0")}-${String(nextMonth).padStart(2, "0")}-01`;
  return { start, end };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyTransactionFilters(query: any, filters: ExpenseTransactionFilters) {
  let next = query;

  if (filters.filterType && filters.filterType !== "all") {
    next = next.eq("type", filters.filterType);
  }
  if (filters.filterCategory && filters.filterCategory !== "all") {
    next = next.eq("category_id", filters.filterCategory);
  }
  const person =
    filters.filterPaidBy && filters.filterPaidBy !== "all"
      ? filters.filterPaidBy
      : filters.personFilter && filters.personFilter !== "all"
        ? filters.personFilter
        : null;
  if (person) {
    next = next.eq("paid_by", person);
  }
  if (filters.filterSettlement === "settlement") {
    next = next.eq("needs_settlement", true);
  }
  if (filters.searchTerm?.trim()) {
    next = next.ilike("note", `%${filters.searchTerm.trim()}%`);
  }

  if (filters.dateFilterType === "month") {
    if (filters.selectedDates.length === 0) {
      next = next.eq("id", "00000000-0000-0000-0000-000000000000");
    } else if (filters.selectedDates.length === 1) {
      const { start, end } = monthBounds(filters.selectedDates[0]);
      next = next.gte("date", start).lt("date", end);
    } else {
      next = next.or(
        filters.selectedDates
          .map((d) => {
            const { start, end } = monthBounds(d);
            return `and(date.gte.${start},date.lt.${end})`;
          })
          .join(","),
      );
    }
  } else if (filters.dateFilterType === "year") {
    const years = [
      ...new Set(filters.selectedDates.map((d) => d.slice(0, 4))),
    ];
    if (years.length === 0) {
      next = next.eq("id", "00000000-0000-0000-0000-000000000000");
    } else if (years.length === 1) {
      next = next
        .gte("date", `${years[0]}-01-01`)
        .lt("date", `${Number(years[0]) + 1}-01-01`);
    } else {
      next = next.or(
        years
          .map(
            (y) =>
              `and(date.gte.${y}-01-01,date.lt.${Number(y) + 1}-01-01)`,
          )
          .join(","),
      );
    }
  }

  return next;
}

function mapTransaction(row: Record<string, unknown>): Transaction {
  return {
    ...(row as unknown as Transaction),
    amount: Number(row.amount),
  };
}

export async function fetchExpenseTransactionsPage(
  filters: ExpenseTransactionFilters,
  page = 1,
  pageSize = 40,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("expense_transactions")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  query = applyTransactionFilters(query, filters);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error fetching transactions page:", error);
    throw new Error(`Error fetching transactions: ${error.message}`);
  }

  return {
    items: (data || []).map((row) => mapTransaction(row as Record<string, unknown>)),
    totalCount: count ?? 0,
  };
}

export async function fetchExpenseStats(
  filters: Pick<
    ExpenseTransactionFilters,
    "dateFilterType" | "selectedDates" | "personFilter"
  >,
): Promise<ExpenseStats> {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  let query = supabase
    .from("expense_transactions")
    .select("amount, type, category_id")
    .eq("user_id", userId);

  query = applyTransactionFilters(query, {
    dateFilterType: filters.dateFilterType,
    selectedDates: filters.selectedDates,
    personFilter: filters.personFilter,
  });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching expense stats:", error);
    throw new Error(`Error fetching expense stats: ${error.message}`);
  }

  let totalIncome = 0;
  let totalExpense = 0;
  const spentByCategory: Record<string, number> = {};

  for (const row of data || []) {
    const amount = Number(row.amount);
    if (row.type === "income") {
      totalIncome += amount;
    } else if (row.type === "expense") {
      totalExpense += amount;
      const categoryKey = row.category_id || "__uncategorized__";
      spentByCategory[categoryKey] =
        (spentByCategory[categoryKey] || 0) + amount;
    }
  }

  return { totalIncome, totalExpense, spentByCategory };
}

export async function fetchRecentExpenseTransactions(
  limit = 10,
  personFilter = "all",
) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  let query = supabase
    .from("expense_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (personFilter !== "all") {
    query = query.eq("paid_by", personFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching recent transactions:", error);
    throw new Error(`Error fetching recent transactions: ${error.message}`);
  }

  return (data || []).map((row) => mapTransaction(row as Record<string, unknown>));
}

export async function exportExpenseTransactionsCsv(
  filters: ExpenseTransactionFilters,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  let query = supabase
    .from("expense_transactions")
    .select("date, type, amount, paid_by, note, needs_settlement, category_id, expense_categories(name)")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  query = applyTransactionFilters(query, filters);

  const { data, error } = await query;

  if (error) {
    console.error("Error exporting transactions:", error);
    throw new Error(`Error exporting transactions: ${error.message}`);
  }

  const headers = [
    "Date",
    "Type",
    "Category",
    "Amount",
    "Paid By",
    "Note",
    "Settlement Status",
  ];

  const rows = (data || []).map((t) => {
    const category = Array.isArray(t.expense_categories)
      ? t.expense_categories[0]?.name
      : (t.expense_categories as { name?: string } | null)?.name;
    const note = String(t.note || "").replace(/"/g, '""');
    return [
      t.date,
      t.type,
      category || "-",
      t.amount,
      t.paid_by || "-",
      `"${note}"`,
      t.needs_settlement ? "Needs Settlement" : "Cleared",
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export async function createExpenseTransaction(
  transaction: Omit<Transaction, "id" | "user_id">,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("expense_transactions")
    .insert({
      ...transaction,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating transaction:", error);
    throw new Error(`Error creating transaction: ${error.message}`);
  }

  return data as Transaction;
}

export async function updateExpenseTransaction(
  id: string,
  updates: Partial<Transaction>,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("expense_transactions")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating transaction:", error);
    throw new Error(`Error updating transaction: ${error.message}`);
  }

  return data as Transaction;
}

export async function toggleTransactionSettlement(
  id: string,
  needsSettlement: boolean,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("expense_transactions")
    .update({ needs_settlement: needsSettlement })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error toggling settlement:", error);
    throw new Error(`Error toggling settlement: ${error.message}`);
  }

  return data as Transaction;
}

export async function deleteExpenseTransaction(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { error } = await supabase
    .from("expense_transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting transaction:", error);
    throw new Error(`Error deleting transaction: ${error.message}`);
  }

  return { success: true };
}

export async function deleteMultipleExpenseTransactions(ids: string[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");
  if (!ids || ids.length === 0) return { success: true };

  const { error } = await supabase
    .from("expense_transactions")
    .delete()
    .in("id", ids)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting multiple transactions:", error);
    throw new Error(`Error deleting multiple transactions: ${error.message}`);
  }

  return { success: true };
}

/**
 * PERSONS ACTIONS
 */

export async function fetchExpensePersons() {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("expense_persons")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching persons:", error);
    throw new Error(`Error fetching persons: ${error.message}`);
  }

  return data as Person[];
}

export async function createExpensePerson(name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("expense_persons")
    .insert({ name, user_id: userId })
    .select()
    .single();

  if (error) {
    console.error("Error creating person:", error);
    throw new Error(`Error creating person: ${error.message}`);
  }

  return data as Person;
}

export async function updateExpensePerson(id: string, name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("expense_persons")
    .update({ name })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating person:", error);
    throw new Error(`Error updating person: ${error.message}`);
  }

  return data as Person;
}

export async function deleteExpensePerson(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { error } = await supabase
    .from("expense_persons")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting person:", error);
    throw new Error(`Error deleting person: ${error.message}`);
  }

  return { success: true };
}

/**
 * MONTHLY SUMMARIES ACTIONS
 */

export async function fetchMonthlySummaries() {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("expense_monthly_summaries")
    .select("*")
    .eq("user_id", userId)
    .order("month", { ascending: false });

  if (error) {
    console.error("Error fetching summaries:", error);
    throw new Error(`Error fetching summaries: ${error.message}`);
  }

  return data as MonthlySummary[];
}

export async function createMonthlySummary(
  summary: Omit<MonthlySummary, "id" | "user_id">,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("expense_monthly_summaries")
    .upsert({ ...summary, user_id: userId }, { onConflict: "user_id, month" })
    .select()
    .single();

  if (error) {
    console.error("Error creating/updating summary:", error);
    throw new Error(`Error creating/updating summary: ${error.message}`);
  }

  return data as MonthlySummary;
}
