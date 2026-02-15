"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";
import { Category, Transaction, Person, MonthlySummary } from "@/types/expense";

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

  revalidatePath("/app/expense-tracker");
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

  revalidatePath("/app/expense-tracker");
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

  revalidatePath("/app/expense-tracker");
  return { success: true };
}

/**
 * TRANSACTIONS ACTIONS
 */

export async function fetchExpenseTransactions() {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("expense_transactions")
    .select("*, expense_categories(*)")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
    throw new Error(`Error fetching transactions: ${error.message}`);
  }

  return data;
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

  // Update category spent amount automatically via a database trigger would be better,
  // but for now we can do it here or just revalidate.
  // Revalidate ensures the client gets the latest state including updated spent values.
  revalidatePath("/app/expense-tracker");
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

  revalidatePath("/app/expense-tracker");
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

  revalidatePath("/app/expense-tracker");
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

  revalidatePath("/app/expense-tracker");
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

  revalidatePath("/app/expense-tracker");
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

  revalidatePath("/app/expense-tracker");
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

  revalidatePath("/app/expense-tracker");
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

  revalidatePath("/app/expense-tracker");
  return data as MonthlySummary;
}
