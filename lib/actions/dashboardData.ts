"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";

export interface DashboardData {
  todos: {
    id: number;
    name: string;
    isCompleted: boolean;
    deadline?: string | null;
    category?: { id: number; category: string } | null;
  }[];
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
    transactionsResult,
    monthlyTransactionsResult,
    categoriesResult,
    investmentsResult,
    contributionsResult,
    debtsResult,
  ] = await Promise.all([
    // Todos
    supabase
      .from("todos")
      .select("id, name, isCompleted, deadline, category(id, category)")
      .eq("user_Id", userId)
      .order("order", { ascending: true }),

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
      .select("investment_id, amount, current_value")
      .eq("user_id", userId),

    // Portfolio debts
    supabase
      .from("portfolio_debts")
      .select("id, name, category, total_amount, remaining_amount, interest_rate, due_date")
      .eq("user_id", userId),
  ]);

  // Process todos
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const todos = (todosResult.data || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    isCompleted: t.isCompleted,
    deadline: t.deadline,
    category: t.category,
  }));

  // Process recent expenses (for display)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transactions = (transactionsResult.data || []).map((t: any) => ({
    id: t.id,
    amount: Number(t.amount),
    type: t.type as "income" | "expense",
    date: t.date,
    note: t.note,
    category: t.expense_categories
      ? { name: t.expense_categories.name, color: t.expense_categories.color }
      : null,
  }));

  const totalBudget = (categoriesResult.data || []).reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum: number, c: any) => sum + Number(c.monthly_budget || 0),
    0,
  );

  // Calculate this month's totals from ALL current-month transactions
  const totalSpentThisMonth = (monthlyTransactionsResult.data || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((t: any) => t.type === "expense")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const totalIncomeThisMonth = (monthlyTransactionsResult.data || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((t: any) => t.type === "income")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  // Process investments with contributions
  const contributionsByInvestment = new Map<
    string,
    { totalInvested: number; currentValue: number }
  >();
  for (const c of contributionsResult.data || []) {
    const existing = contributionsByInvestment.get(c.investment_id) || {
      totalInvested: 0,
      currentValue: 0,
    };
    existing.totalInvested += Number(c.amount);
    existing.currentValue += Number(c.current_value);
    contributionsByInvestment.set(c.investment_id, existing);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const investments = (investmentsResult.data || []).map((inv: any) => {
    const contribs = contributionsByInvestment.get(inv.id) || {
      totalInvested: 0,
      currentValue: 0,
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

  // Process debts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debts = (debtsResult.data || []).map((d: any) => ({
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
