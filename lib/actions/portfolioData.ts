"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";

// Type references from store
export interface InvestmentContribution {
  id: string;
  amount: number;
  currentValue: number;
  date: string;
  note?: string;
}

export interface Investment {
  id: string;
  name: string;
  category: "Stocks" | "Mutual Funds" | "Crypto" | "Real Estate" | "Gold" | "Other";
  note?: string;
  investedAmount: number;
  currentValue: number;
  contributionCount: number;
  historyLoaded?: boolean;
  contributions: InvestmentContribution[];
}

export interface DebtPayment {
  id: string;
  principalAmount: number;
  interestAmount: number;
  date: string;
  note?: string;
}

export interface Debt {
  id: string;
  name: string;
  category: "Home Loan" | "Personal Loan" | "Credit Card" | "Car Loan" | "Student Loan" | "Other";
  totalAmount: number;
  remainingAmount: number;
  interestRate?: number | null;
  monthlyPayment?: number | null;
  dueDate?: string | null;
  note?: string | null;
  interestAmount?: number | null;
  remainingInterestAmount?: number | null;
  paymentsLoaded?: boolean;
  payments: DebtPayment[];
}

/**
 * ----------------------------
 * INVESTMENTS & CONTRIBUTIONS
 * ----------------------------
 */

export async function fetchPortfolioInvestments() {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data: investmentsData, error: investmentsError } = await supabase
    .from("portfolio_investments")
    .select("id, name, category, note")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (investmentsError) throw new Error(`Error fetching investments: ${investmentsError.message}`);

  const { data: contributionsData, error: contribsError } = await supabase
    .from("portfolio_contributions")
    .select("investment_id, amount, current_value, date")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (contribsError) throw new Error(`Error fetching contributions: ${contribsError.message}`);

  const totals = new Map<
    string,
    { investedAmount: number; currentValue: number; contributionCount: number }
  >();
  for (const c of contributionsData || []) {
    const existing = totals.get(c.investment_id) || {
      investedAmount: 0,
      currentValue: 0,
      contributionCount: 0,
    };
    existing.investedAmount += Number(c.amount);
    existing.contributionCount += 1;
    if (existing.contributionCount === 1) {
      existing.currentValue = Number(c.current_value);
    }
    totals.set(c.investment_id, existing);
  }

  return (investmentsData || []).map((inv) => {
    const computed = totals.get(inv.id) || {
      investedAmount: 0,
      currentValue: 0,
      contributionCount: 0,
    };
    return {
      id: inv.id,
      name: inv.name,
      category: inv.category,
      note: inv.note || undefined,
      investedAmount: computed.investedAmount,
      currentValue: computed.currentValue,
      contributionCount: computed.contributionCount,
      historyLoaded: false,
      contributions: [],
    } as Investment;
  });
}

export async function fetchInvestmentContributions(investmentId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("portfolio_contributions")
    .select("*")
    .eq("user_id", userId)
    .eq("investment_id", investmentId)
    .order("date", { ascending: false });

  if (error) throw new Error(`Error fetching contributions: ${error.message}`);

  return (data || []).map((c) => ({
    id: c.id,
    amount: Number(c.amount),
    currentValue: Number(c.current_value),
    date: c.date,
    note: c.note || undefined,
  })) as InvestmentContribution[];
}

export async function createPortfolioInvestment(
  inv: Pick<Investment, "name" | "category" | "note">,
  initialAmount: number,
  initialCurrentValue: number,
  date: string,
  note?: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  // 1. Create the investment parent
  const { data: newInv, error: invError } = await supabase
    .from("portfolio_investments")
    .insert({
      user_id: userId,
      name: inv.name,
      category: inv.category,
      note: inv.note,
    })
    .select()
    .single();

  if (invError) throw new Error(`Error creating investment: ${invError.message}`);

  // 2. Create the initial contribution log
  const { data: newContrib, error: contribError } = await supabase
    .from("portfolio_contributions")
    .insert({
      user_id: userId,
      investment_id: newInv.id,
      amount: initialAmount,
      current_value: initialCurrentValue,
      date,
      note,
    })
    .select()
    .single();

  if (contribError) {
    // Attempt rollback for consistency, though RLS/Cascade might not need it if handled carefully
    await supabase.from("portfolio_investments").delete().eq("id", newInv.id);
    throw new Error(`Error creating initial contribution: ${contribError.message}`);
  }

  return {
    id: newInv.id,
    name: newInv.name,
    category: newInv.category,
    note: newInv.note || undefined,
    investedAmount: Number(newContrib.amount),
    currentValue: Number(newContrib.current_value),
    contributionCount: 1,
    historyLoaded: true,
    contributions: [
      {
        id: newContrib.id,
        amount: Number(newContrib.amount),
        currentValue: Number(newContrib.current_value),
        date: newContrib.date,
        note: newContrib.note || undefined,
      }
    ]
  } as Investment;
}

export async function updatePortfolioInvestment(id: string, updates: Partial<Pick<Investment, "name" | "category" | "note">>) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("portfolio_investments")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(`Error updating investment: ${error.message}`);
  return data;
}

export async function deletePortfolioInvestment(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { error } = await supabase
    .from("portfolio_investments")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(`Error deleting investment: ${error.message}`);
}

export async function createPortfolioContribution(
  investmentId: string,
  contrib: Omit<InvestmentContribution, "id">
) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("portfolio_contributions")
    .insert({
      user_id: userId,
      investment_id: investmentId,
      amount: contrib.amount,
      current_value: contrib.currentValue,
      date: contrib.date,
      note: contrib.note,
    })
    .select()
    .single();

  if (error) throw new Error(`Error creating contribution: ${error.message}`);
  
  return {
    id: data.id,
    amount: Number(data.amount),
    currentValue: Number(data.current_value),
    date: data.date,
    note: data.note || undefined,
  } as InvestmentContribution;
}

export async function updatePortfolioContribution(
  id: string,
  updates: Partial<Omit<InvestmentContribution, "id">>
) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {};
  if (updates.amount !== undefined) payload.amount = updates.amount;
  if (updates.currentValue !== undefined) payload.current_value = updates.currentValue;
  if (updates.date !== undefined) payload.date = updates.date;
  if (updates.note !== undefined) payload.note = updates.note;

  const { data, error } = await supabase
    .from("portfolio_contributions")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(`Error updating contribution: ${error.message}`);
  
  return {
    id: data.id,
    amount: Number(data.amount),
    currentValue: Number(data.current_value),
    date: data.date,
    note: data.note || undefined,
  } as InvestmentContribution;
}

export async function deletePortfolioContribution(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { error } = await supabase
    .from("portfolio_contributions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(`Error deleting contribution: ${error.message}`);
}

/**
 * ----------------------------
 * DEBTS
 * ----------------------------
 */

export async function fetchPortfolioDebts() {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data: debtsData, error: debtsError } = await supabase
    .from("portfolio_debts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (debtsError) throw new Error(`Error fetching debts: ${debtsError.message}`);

  return (debtsData || []).map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category,
    totalAmount: Number(d.total_amount),
    remainingAmount: Number(d.remaining_amount),
    interestRate: d.interest_rate !== null && d.interest_rate !== undefined ? Number(d.interest_rate) : undefined,
    monthlyPayment: d.monthly_payment !== null && d.monthly_payment !== undefined ? Number(d.monthly_payment) : undefined,
    dueDate: d.due_date || undefined,
    note: d.note || undefined,
    interestAmount: d.interest_amount !== null && d.interest_amount !== undefined ? Number(d.interest_amount) : undefined,
    remainingInterestAmount: d.remaining_interest_amount !== null && d.remaining_interest_amount !== undefined ? Number(d.remaining_interest_amount) : undefined,
    paymentsLoaded: false,
    payments: [],
  })) as Debt[];
}

export async function fetchDebtPayments(debtId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("portfolio_debt_payments")
    .select("*")
    .eq("user_id", userId)
    .eq("debt_id", debtId)
    .order("date", { ascending: false });

  if (error) throw new Error(`Error fetching debt payments: ${error.message}`);

  return (data || []).map((p) => ({
    id: p.id,
    principalAmount: Number(p.principal_amount),
    interestAmount: Number(p.interest_amount),
    date: p.date,
    note: p.note || undefined,
  })) as DebtPayment[];
}

export async function createPortfolioDebt(debt: Omit<Debt, "id" | "payments">) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("portfolio_debts")
    .insert({
      user_id: userId,
      name: debt.name,
      category: debt.category,
      total_amount: debt.totalAmount,
      remaining_amount: debt.remainingAmount,
      interest_rate: debt.interestRate,
      monthly_payment: debt.monthlyPayment,
      due_date: debt.dueDate,
      note: debt.note,
      interest_amount: debt.interestAmount,
      remaining_interest_amount: debt.remainingInterestAmount,
    })
    .select()
    .single();

  if (error) throw new Error(`Error creating debt: ${error.message}`);
  
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    totalAmount: Number(data.total_amount),
    remainingAmount: Number(data.remaining_amount),
    interestRate: data.interest_rate !== null && data.interest_rate !== undefined ? Number(data.interest_rate) : undefined,
    monthlyPayment: data.monthly_payment !== null && data.monthly_payment !== undefined ? Number(data.monthly_payment) : undefined,
    dueDate: data.due_date || undefined,
    note: data.note || undefined,
    interestAmount: data.interest_amount !== null && data.interest_amount !== undefined ? Number(data.interest_amount) : undefined,
    remainingInterestAmount: data.remaining_interest_amount !== null && data.remaining_interest_amount !== undefined ? Number(data.remaining_interest_amount) : undefined,
    paymentsLoaded: true,
    payments: [],
  } as Debt;
}

export async function updatePortfolioDebt(id: string, updates: Partial<Omit<Debt, "id" | "payments">>) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.totalAmount !== undefined) payload.total_amount = updates.totalAmount;
  if (updates.remainingAmount !== undefined) payload.remaining_amount = updates.remainingAmount;
  if (updates.interestRate !== undefined) payload.interest_rate = updates.interestRate;
  if (updates.monthlyPayment !== undefined) payload.monthly_payment = updates.monthlyPayment;
  if (updates.dueDate !== undefined) payload.due_date = updates.dueDate;
  if (updates.note !== undefined) payload.note = updates.note;
  if (updates.interestAmount !== undefined) payload.interest_amount = updates.interestAmount;
  if (updates.remainingInterestAmount !== undefined) payload.remaining_interest_amount = updates.remainingInterestAmount;

  const { data, error } = await supabase
    .from("portfolio_debts")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(`Error updating debt: ${error.message}`);

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    totalAmount: Number(data.total_amount),
    remainingAmount: Number(data.remaining_amount),
    interestRate: data.interest_rate !== null && data.interest_rate !== undefined ? Number(data.interest_rate) : undefined,
    monthlyPayment: data.monthly_payment !== null && data.monthly_payment !== undefined ? Number(data.monthly_payment) : undefined,
    dueDate: data.due_date || undefined,
    note: data.note || undefined,
    interestAmount: data.interest_amount !== null && data.interest_amount !== undefined ? Number(data.interest_amount) : undefined,
    remainingInterestAmount: data.remaining_interest_amount !== null && data.remaining_interest_amount !== undefined ? Number(data.remaining_interest_amount) : undefined,
  } as Debt;
}

export async function deletePortfolioDebt(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { error } = await supabase
    .from("portfolio_debts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(`Error deleting debt: ${error.message}`);
}

export async function createDebtPayment(
  debtId: string,
  payment: Omit<DebtPayment, "id">
) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("portfolio_debt_payments")
    .insert({
      user_id: userId,
      debt_id: debtId,
      principal_amount: payment.principalAmount,
      interest_amount: payment.interestAmount,
      date: payment.date,
      note: payment.note,
    })
    .select()
    .single();

  if (error) throw new Error(`Error creating debt payment: ${error.message}`);
  
  return {
    id: data.id,
    principalAmount: Number(data.principal_amount),
    interestAmount: Number(data.interest_amount),
    date: data.date,
    note: data.note || undefined,
  } as DebtPayment;
}

export async function updateDebtPayment(
  id: string,
  updates: Partial<Omit<DebtPayment, "id">>
) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {};
  if (updates.principalAmount !== undefined) payload.principal_amount = updates.principalAmount;
  if (updates.interestAmount !== undefined) payload.interest_amount = updates.interestAmount;
  if (updates.date !== undefined) payload.date = updates.date;
  if (updates.note !== undefined) payload.note = updates.note;

  const { data, error } = await supabase
    .from("portfolio_debt_payments")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(`Error updating debt payment: ${error.message}`);
  
  return {
    id: data.id,
    principalAmount: Number(data.principal_amount),
    interestAmount: Number(data.interest_amount),
    date: data.date,
    note: data.note || undefined,
  } as DebtPayment;
}

export async function deleteDebtPayment(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { error } = await supabase
    .from("portfolio_debt_payments")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(`Error deleting debt payment: ${error.message}`);
}

