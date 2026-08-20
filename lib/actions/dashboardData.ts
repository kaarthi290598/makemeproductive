"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";

export interface DashboardData {
  todos: {
    items: {
      id: number;
      name: string;
      isCompleted: boolean;
      deadline?: string | null;
      category?: { id: number; category: string } | null;
    }[];
    pendingCount: number;
    completedCount: number;
  };
  expenses: {
    transactions: {
      id: string;
      amount: number;
      type: "income" | "expense";
      date: string;
      note?: string | null;
      category?: { name: string; color: string } | null;
    }[];
    totalBudget: number;
    totalSpentThisMonth: number;
    totalIncomeThisMonth: number;
  };
  portfolio: {
    investments: {
      id: string;
      name: string;
      category: string;
      totalInvested: number;
      currentValue: number;
    }[];
    debts: {
      id: string;
      name: string;
      category: string;
      totalAmount: number;
      remainingAmount: number;
      interestRate?: number | null;
      dueDate?: string | null;
    }[];
    totalInvested: number;
    totalCurrentValue: number;
    totalDebt: number;
    totalDebtRemaining: number;
  };
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthStart = `${currentMonth}-01`;
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthEnd = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}-01`;

  // Run all queries in parallel
  const [
    todosResult,
    pendingCountResult,
    completedCountResult,
    transactionsResult,
    monthlyTransactionsResult,
    categoriesResult,
    investmentsResult,
    contributionsResult,
    debtsResult,
  ] = await Promise.all([
    supabase
      .from("todos")
      .select("id, name, isCompleted, deadline, category(id, category)")
      .eq("user_Id", userId)
      .eq("isCompleted", false)
      .order("order", { ascending: true })
      .limit(8),

    supabase
      .from("todos")
      .select("id", { count: "exact", head: true })
      .eq("user_Id", userId)
      .eq("isCompleted", false),

    supabase
      .from("todos")
      .select("id", { count: "exact", head: true })
      .eq("user_Id", userId)
      .eq("isCompleted", true),

    // Expense transactions (recent 10 for display)
    supabase
      .from("expense_transactions")
      .select("id, amount, type, date, note, expense_categories(name, color)")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10),

    // All transactions for the current month (for accurate totals)
    supabase
      .from("expense_transactions")
      .select("amount, type")
      .eq("user_id", userId)
      .gte("date", monthStart)
      .lt("date", monthEnd),

    // Expense categories (for budget totals)
    supabase
      .from("expense_categories")
      .select("monthly_budget, spent")
      .eq("user_id", userId),

    // Portfolio investments
    supabase
      .from("portfolio_investments")
      .select("id, name, category")
      .eq("user_id", userId),

    // Portfolio contributions
    supabase
      .from("portfolio_contributions")
      .select("investment_id, amount, current_value, date")
      .eq("user_id", userId),

    // Portfolio debts
    supabase
      .from("portfolio_debts")
      .select("id, name, category, total_amount, remaining_amount, interest_rate, due_date")
      .eq("user_id", userId),
  ]);

  const todos = {
    items: (todosResult.data || []).map((t) => {
      const joined = t.category as
        | { id: number; category: string }
        | { id: number; category: string }[]
        | null;
      const category = Array.isArray(joined) ? joined[0] ?? null : joined;
      return {
        id: Number(t.id),
        name: String(t.name),
        isCompleted: Boolean(t.isCompleted),
        deadline: (t.deadline as string | null) ?? null,
        category: category ?? null,
      };
    }),
    pendingCount: pendingCountResult.count ?? 0,
    completedCount: completedCountResult.count ?? 0,
  };

  const transactions = (transactionsResult.data || []).map((t) => {
    const joined = t.expense_categories as
      | { name: string; color: string }
      | { name: string; color: string }[]
      | null;
    const category = Array.isArray(joined) ? joined[0] : joined;
    return {
      id: t.id,
      amount: Number(t.amount),
      type: t.type as "income" | "expense",
      date: t.date,
      note: t.note,
      category: category
        ? { name: category.name, color: category.color }
        : null,
    };
  });

  const totalBudget = (categoriesResult.data || []).reduce(
    (sum, c) => sum + Number(c.monthly_budget || 0),
    0,
  );

  const totalSpentThisMonth = (monthlyTransactionsResult.data || [])
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalIncomeThisMonth = (monthlyTransactionsResult.data || [])
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Process investments with contributions
  const contributionsByInvestment = new Map<
    string,
    { totalInvested: number; currentValue: number; latestDate: string }
  >();
  for (const c of contributionsResult.data || []) {
    const existing = contributionsByInvestment.get(c.investment_id) || {
      totalInvested: 0,
      currentValue: 0,
      latestDate: "",
    };
    existing.totalInvested += Number(c.amount);
    if (!existing.latestDate || c.date > existing.latestDate) {
      existing.latestDate = c.date;
      existing.currentValue = Number(c.current_value);
    }
    contributionsByInvestment.set(c.investment_id, existing);
  }

  const investments = (investmentsResult.data || []).map((inv) => {
    const contribs = contributionsByInvestment.get(inv.id) || {
      totalInvested: 0,
      currentValue: 0,
      latestDate: "",
    };
    return {
      id: inv.id,
      name: inv.name,
      category: inv.category,
      totalInvested: contribs.totalInvested,
      currentValue: contribs.currentValue,
    };
  });

  const totalInvested = investments.reduce(
    (sum, i) => sum + i.totalInvested,
    0,
  );
  const totalCurrentValue = investments.reduce(
    (sum, i) => sum + i.currentValue,
    0,
  );

  const debts = (debtsResult.data || []).map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category,
    totalAmount: Number(d.total_amount),
    remainingAmount: Number(d.remaining_amount),
    interestRate: d.interest_rate != null ? Number(d.interest_rate) : null,
    dueDate: d.due_date || null,
  }));

  const totalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalDebtRemaining = debts.reduce(
    (sum, d) => sum + d.remainingAmount,
    0,
  );

  return {
    todos,
    expenses: {
      transactions,
      totalBudget,
      totalSpentThisMonth,
      totalIncomeThisMonth,
    },
    portfolio: {
      investments,
      debts,
      totalInvested,
      totalCurrentValue,
      totalDebt,
      totalDebtRemaining,
    },
  };
}
