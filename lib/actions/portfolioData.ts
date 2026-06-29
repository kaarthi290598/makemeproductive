"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

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
  contributions: InvestmentContribution[];
}

export interface Debt {
  id: string;
  name: string;
  category: "Home Loan" | "Personal Loan" | "Credit Card" | "Car Loan" | "Student Loan" | "Other";
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  monthlyPayment: number;
  dueDate?: string;
  note?: string;
}

/**
 * ----------------------------
 * INVESTMENTS & CONTRIBUTIONS
 * ----------------------------
 */

export async function fetchPortfolioInvestments() {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  // Fetch investments
  const { data: investmentsData, error: investmentsError } = await supabase
    .from("portfolio_investments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (investmentsError) throw new Error(`Error fetching investments: ${investmentsError.message}`);

  // Fetch all contributions for this user
  const { data: contributionsData, error: contribsError } = await supabase
    .from("portfolio_contributions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (contribsError) throw new Error(`Error fetching contributions: ${contribsError.message}`);

  // Map contributions into their parent investments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mappedInvestments: Investment[] = (investmentsData || []).map((inv: any) => {
    const invContribs = (contributionsData || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((c: any) => c.investment_id === inv.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any) => ({
        id: c.id,
        amount: Number(c.amount),
        currentValue: Number(c.current_value),
        date: c.date,
        note: c.note || undefined,
      }));

    return {
      id: inv.id,
      name: inv.name,
      category: inv.category,
      note: inv.note || undefined,
      contributions: invContribs,
    };
  });

  return mappedInvestments;
}

export async function createPortfolioInvestment(
  inv: Omit<Investment, "id" | "contributions">,
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

  revalidatePath("/app/portfolio");
  
  return {
    id: newInv.id,
    name: newInv.name,
    category: newInv.category,
    note: newInv.note || undefined,
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
  revalidatePath("/app/portfolio");
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
  revalidatePath("/app/portfolio");
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
  revalidatePath("/app/portfolio");
  
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
  revalidatePath("/app/portfolio");
  
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
  revalidatePath("/app/portfolio");
}

/**
 * ----------------------------
 * DEBTS
 * ----------------------------
 */

export async function fetchPortfolioDebts() {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("portfolio_debts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Error fetching debts: ${error.message}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((d: any) => ({
    id: d.id,
    name: d.name,
    category: d.category,
    totalAmount: Number(d.total_amount),
    remainingAmount: Number(d.remaining_amount),
    interestRate: Number(d.interest_rate),
    monthlyPayment: Number(d.monthly_payment),
    dueDate: d.due_date || undefined,
    note: d.note || undefined,
  })) as Debt[];
}

export async function createPortfolioDebt(debt: Omit<Debt, "id">) {
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
    })
    .select()
    .single();

  if (error) throw new Error(`Error creating debt: ${error.message}`);
  revalidatePath("/app/portfolio");
  
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    totalAmount: Number(data.total_amount),
    remainingAmount: Number(data.remaining_amount),
    interestRate: Number(data.interest_rate),
    monthlyPayment: Number(data.monthly_payment),
    dueDate: data.due_date || undefined,
    note: data.note || undefined,
  } as Debt;
}

export async function updatePortfolioDebt(id: string, updates: Partial<Omit<Debt, "id">>) {
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

  const { data, error } = await supabase
    .from("portfolio_debts")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(`Error updating debt: ${error.message}`);
  revalidatePath("/app/portfolio");

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    totalAmount: Number(data.total_amount),
    remainingAmount: Number(data.remaining_amount),
    interestRate: Number(data.interest_rate),
    monthlyPayment: Number(data.monthly_payment),
    dueDate: data.due_date || undefined,
    note: data.note || undefined,
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
  revalidatePath("/app/portfolio");
}
