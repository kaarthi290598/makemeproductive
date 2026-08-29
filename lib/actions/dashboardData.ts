"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";
import { calculateMonthlyEquivalent, calculateYearlyEquivalent } from "@/types/subscription";
import { calculateRemainingDue, calculateUtilization } from "@/types/credit-due";

export interface DashboardData {
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
  subscriptions: {
    totalCount: number;
    activeCount: number;
    totalMonthlySpend: number;
    totalYearlySpend: number;
    upcomingRenewals: {
      id: string;
      name: string;
      amount: number;
      billingFrequency: string;
      nextPaymentDate: string;
      category: string;
    }[];
  };
  creditDues: {
    totalAccounts: number;
    totalCreditLimit: number;
    totalOutstanding: number;
    totalRemainingDue: number;
    overallUtilization: number;
    items: {
      id: string;
      name: string;
      creditLimit: number;
      totalOutstanding: number;
      remainingDue: number;
      dueDate: string;
      amountPaid: number;
    }[];
    upcomingDues: {
      id: string;
      name: string;
      remainingDue: number;
      dueDate: string;
    }[];
  };
  passwords: {
    totalCount: number;
    bankAccountsCount: number;
    webAccountsCount: number;
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
    transactionsResult,
    monthlyTransactionsResult,
    categoriesResult,
    investmentsResult,
    contributionsResult,
    debtsResult,
    subscriptionsResult,
    creditDuesResult,
    passwordsResult,
  ] = await Promise.all([
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

    // Subscriptions
    supabase
      .from("subscriptions")
      .select("id, name, amount, billing_frequency, next_payment_date, status, category")
      .eq("user_id", userId)
      .order("next_payment_date", { ascending: true }),

    // Credit Dues
    supabase
      .from("credit_dues")
      .select("id, name, credit_limit, statement_amount, total_outstanding, amount_paid, due_date")
      .eq("user_id", userId)
      .order("due_date", { ascending: true }),

    // Passwords
    supabase
      .from("passwords")
      .select("id, name, category")
      .eq("user_id", userId),
  ]);

  // Process Expense Transactions
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

  // Process Portfolio Investments
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

  // Process Subscriptions
  const rawSubs = subscriptionsResult.data || [];
  const activeSubs = rawSubs.filter((s) => s.status === "active");
  const totalMonthlySpend = activeSubs.reduce(
    (acc, s) => acc + calculateMonthlyEquivalent(Number(s.amount), s.billing_frequency),
    0,
  );
  const totalYearlySpend = activeSubs.reduce(
    (acc, s) => acc + calculateYearlyEquivalent(Number(s.amount), s.billing_frequency),
    0,
  );

  const upcomingRenewals = activeSubs.slice(0, 5).map((s) => ({
    id: s.id,
    name: s.name,
    amount: Number(s.amount),
    billingFrequency: s.billing_frequency,
    nextPaymentDate: s.next_payment_date,
    category: s.category,
  }));

  // Process Credit Dues
  const rawCreditDues = creditDuesResult.data || [];
  const creditDuesItems = rawCreditDues.map((c) => {
    const item = {
      id: c.id,
      user_id: userId,
      name: c.name,
      credit_limit: Number(c.credit_limit || 0),
      statement_amount: Number(c.statement_amount || 0),
      total_outstanding: Number(c.total_outstanding || 0),
      amount_paid: Number(c.amount_paid || 0),
      minimum_due: null,
      due_date: c.due_date,
      created_at: "",
      updated_at: "",
    };
    const remainingDue = calculateRemainingDue(item);
    return {
      id: c.id,
      name: c.name,
      creditLimit: Number(c.credit_limit || 0),
      totalOutstanding: Number(c.total_outstanding || 0),
      remainingDue,
      dueDate: c.due_date,
      amountPaid: Number(c.amount_paid || 0),
    };
  });

  const totalCreditLimit = creditDuesItems.reduce((acc, c) => acc + c.creditLimit, 0);
  const totalOutstanding = creditDuesItems.reduce((acc, c) => acc + c.totalOutstanding, 0);
  const totalRemainingDue = creditDuesItems.reduce((acc, c) => acc + c.remainingDue, 0);
  const overallUtilization = totalCreditLimit > 0 ? (totalOutstanding / totalCreditLimit) * 100 : 0;

  const upcomingDues = creditDuesItems
    .filter((c) => c.remainingDue > 0 && !!c.dueDate)
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      name: c.name,
      remainingDue: c.remainingDue,
      dueDate: c.dueDate as string,
    }));

  // Process Passwords
  const rawPasswords = passwordsResult.data || [];
  const bankAccountsCount = rawPasswords.filter((p) => p.category === "Bank").length;
  const webAccountsCount = rawPasswords.filter(
    (p) => p.category === "Social" || p.category === "Work" || p.category === "Entertainment",
  ).length;

  return {
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
    subscriptions: {
      totalCount: rawSubs.length,
      activeCount: activeSubs.length,
      totalMonthlySpend,
      totalYearlySpend,
      upcomingRenewals,
    },
    creditDues: {
      totalAccounts: creditDuesItems.length,
      totalCreditLimit,
      totalOutstanding,
      totalRemainingDue,
      overallUtilization,
      items: creditDuesItems,
      upcomingDues,
    },
    passwords: {
      totalCount: rawPasswords.length,
      bankAccountsCount,
      webAccountsCount,
    },
  };
}
