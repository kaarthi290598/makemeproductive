"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";
import { CreditDueInput, CreditDueItem } from "@/types/credit-due";

/**
 * Fetch all credit dues for the authenticated Clerk user
 */
export async function fetchCreditDues(): Promise<CreditDueItem[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("credit_dues")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching credit dues:", error);
    throw new Error(`Error fetching credit dues: ${error.message}`);
  }

  return (
    (data || []).map((row) => ({
      ...row,
      credit_limit: Number(row.credit_limit || 0),
      statement_amount: row.statement_amount != null ? Number(row.statement_amount) : 0,
      total_outstanding: Number(row.total_outstanding || 0),
      minimum_due: row.minimum_due != null ? Number(row.minimum_due) : null,
      amount_paid: Number(row.amount_paid || 0),
      due_date: row.due_date || null,
    })) as CreditDueItem[]
  );
}

/**
 * Create a new credit card / due entry
 */
export async function createCreditDue(
  payload: CreditDueInput,
): Promise<CreditDueItem> {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("credit_dues")
    .insert({
      user_id: userId,
      name: payload.name.trim(),
      credit_limit: Number(payload.credit_limit || 0),
      statement_amount:
        payload.statement_amount != null ? Number(payload.statement_amount) : 0,
      total_outstanding: Number(payload.total_outstanding || 0),
      minimum_due:
        payload.minimum_due != null ? Number(payload.minimum_due) : null,
      amount_paid: Number(payload.amount_paid || 0),
      due_date: payload.due_date || null,
      notes: payload.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating credit due:", error);
    throw new Error(`Error creating credit due: ${error.message}`);
  }

  revalidatePath("/app/credit-dues");
  return {
    ...data,
    credit_limit: Number(data.credit_limit || 0),
    statement_amount:
      data.statement_amount != null ? Number(data.statement_amount) : 0,
    total_outstanding: Number(data.total_outstanding || 0),
    minimum_due: data.minimum_due != null ? Number(data.minimum_due) : null,
    amount_paid: Number(data.amount_paid || 0),
    due_date: data.due_date || null,
  } as CreditDueItem;
}

/**
 * Update an existing credit card / due entry
 */
export async function updateCreditDue(
  id: string,
  payload: Partial<CreditDueInput>,
): Promise<CreditDueItem> {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (payload.name !== undefined) updates.name = payload.name.trim();
  if (payload.credit_limit !== undefined)
    updates.credit_limit = Number(payload.credit_limit);
  if (payload.statement_amount !== undefined)
    updates.statement_amount =
      payload.statement_amount != null ? Number(payload.statement_amount) : 0;
  if (payload.total_outstanding !== undefined)
    updates.total_outstanding = Number(payload.total_outstanding);
  if (payload.minimum_due !== undefined)
    updates.minimum_due =
      payload.minimum_due != null ? Number(payload.minimum_due) : null;
  if (payload.amount_paid !== undefined)
    updates.amount_paid = Number(payload.amount_paid);
  if (payload.due_date !== undefined)
    updates.due_date = payload.due_date || null;
  if (payload.notes !== undefined)
    updates.notes = payload.notes?.trim() || null;

  const { data, error } = await supabase
    .from("credit_dues")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating credit due:", error);
    throw new Error(`Error updating credit due: ${error.message}`);
  }

  revalidatePath("/app/credit-dues");
  return {
    ...data,
    credit_limit: Number(data.credit_limit || 0),
    statement_amount:
      data.statement_amount != null ? Number(data.statement_amount) : 0,
    total_outstanding: Number(data.total_outstanding || 0),
    minimum_due: data.minimum_due != null ? Number(data.minimum_due) : null,
    amount_paid: Number(data.amount_paid || 0),
    due_date: data.due_date || null,
  } as CreditDueItem;
}

/**
 * Record a payment towards a credit account
 */
export async function recordCreditPayment(
  id: string,
  amountPaid: number,
): Promise<CreditDueItem> {
  return updateCreditDue(id, { amount_paid: amountPaid });
}

/**
 * Delete a single credit due
 */
export async function deleteCreditDue(id: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { error } = await supabase
    .from("credit_dues")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting credit due:", error);
    throw new Error(`Error deleting credit due: ${error.message}`);
  }

  revalidatePath("/app/credit-dues");
  return true;
}

/**
 * Delete multiple credit dues in bulk
 */
export async function deleteMultipleCreditDues(
  ids: string[],
): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  if (!ids || ids.length === 0) return true;

  const { error } = await supabase
    .from("credit_dues")
    .delete()
    .in("id", ids)
    .eq("user_id", userId);

  if (error) {
    console.error("Error bulk deleting credit dues:", error);
    throw new Error(`Error bulk deleting credit dues: ${error.message}`);
  }

  revalidatePath("/app/credit-dues");
  return true;
}
