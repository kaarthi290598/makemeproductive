"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";
import {
  SubscriptionInput,
  SubscriptionItem,
  SubscriptionStatus,
} from "@/types/subscription";

/**
 * Fetch all subscriptions for the authenticated Clerk user
 */
export async function fetchSubscriptions(): Promise<SubscriptionItem[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("next_payment_date", { ascending: true });

  if (error) {
    console.error("Error fetching subscriptions:", error);
    throw new Error(`Error fetching subscriptions: ${error.message}`);
  }

  return (
    (data || []).map((row) => ({
      ...row,
      amount: Number(row.amount),
    })) as SubscriptionItem[]
  );
}

/**
 * Create a new subscription entry
 */
export async function createSubscription(
  payload: SubscriptionInput,
): Promise<SubscriptionItem> {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: userId,
      name: payload.name.trim(),
      amount: Number(payload.amount),
      billing_frequency: payload.billing_frequency || "monthly",
      next_payment_date: payload.next_payment_date,
      category: payload.category || "General",
      payment_method: payload.payment_method?.trim() || null,
      status: payload.status || "active",
      notes: payload.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating subscription:", error);
    throw new Error(`Error creating subscription: ${error.message}`);
  }

  revalidatePath("/app/subscriptions");
  return {
    ...data,
    amount: Number(data.amount),
  } as SubscriptionItem;
}

/**
 * Update an existing subscription
 */
export async function updateSubscription(
  id: string,
  payload: Partial<SubscriptionInput>,
): Promise<SubscriptionItem> {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (payload.name !== undefined) updates.name = payload.name.trim();
  if (payload.amount !== undefined) updates.amount = Number(payload.amount);
  if (payload.billing_frequency !== undefined)
    updates.billing_frequency = payload.billing_frequency;
  if (payload.next_payment_date !== undefined)
    updates.next_payment_date = payload.next_payment_date;
  if (payload.category !== undefined) updates.category = payload.category;
  if (payload.payment_method !== undefined)
    updates.payment_method = payload.payment_method?.trim() || null;
  if (payload.status !== undefined) updates.status = payload.status;
  if (payload.notes !== undefined)
    updates.notes = payload.notes?.trim() || null;

  const { data, error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating subscription:", error);
    throw new Error(`Error updating subscription: ${error.message}`);
  }

  revalidatePath("/app/subscriptions");
  return {
    ...data,
    amount: Number(data.amount),
  } as SubscriptionItem;
}

/**
 * Toggle subscription status (active, paused, cancelled)
 */
export async function setSubscriptionStatus(
  id: string,
  status: SubscriptionStatus,
): Promise<SubscriptionItem> {
  return updateSubscription(id, { status });
}

/**
 * Delete a single subscription
 */
export async function deleteSubscription(id: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting subscription:", error);
    throw new Error(`Error deleting subscription: ${error.message}`);
  }

  revalidatePath("/app/subscriptions");
  return true;
}

/**
 * Delete multiple subscriptions in bulk
 */
export async function deleteMultipleSubscriptions(
  ids: string[],
): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  if (!ids || ids.length === 0) return true;

  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .in("id", ids)
    .eq("user_id", userId);

  if (error) {
    console.error("Error bulk deleting subscriptions:", error);
    throw new Error(`Error bulk deleting subscriptions: ${error.message}`);
  }

  revalidatePath("/app/subscriptions");
  return true;
}
