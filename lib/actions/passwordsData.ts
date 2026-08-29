"use server";

import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";
import { PasswordItem, PasswordInput } from "@/types/password";

/**
 * Fetch all passwords for the authenticated user
 */
export async function fetchPasswords(): Promise<PasswordItem[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("passwords")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching passwords:", error);
    throw new Error(`Error fetching passwords: ${error.message}`);
  }

  return (data as PasswordItem[]) || [];
}

/**
 * Create a new password entry
 */
export async function createPassword(
  payload: PasswordInput,
): Promise<PasswordItem> {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { data, error } = await supabase
    .from("passwords")
    .insert({
      user_id: userId,
      name: payload.name.trim(),
      username: payload.username.trim(),
      password: payload.password,
      website_url: payload.website_url?.trim() || null,
      category: payload.category || "General",
      notes: payload.notes?.trim() || null,
      account_number: payload.account_number?.trim() || null,
      ifsc_code: payload.ifsc_code?.trim()?.toUpperCase() || null,
      account_type: payload.account_type?.trim() || null,
      customer_id: payload.customer_id?.trim() || null,
      account_holder_name: payload.account_holder_name?.trim() || null,
      branch_name: payload.branch_name?.trim() || null,
      atm_pin: payload.atm_pin?.trim() || null,
      mpin: payload.mpin?.trim() || null,
      transaction_password: payload.transaction_password?.trim() || null,
      registered_phone: payload.registered_phone?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating password:", error);
    throw new Error(`Error creating password: ${error.message}`);
  }

  return data as PasswordItem;
}

/**
 * Update an existing password entry
 */
export async function updatePassword(
  id: string,
  payload: Partial<PasswordInput>,
): Promise<PasswordItem> {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (payload.name !== undefined) updates.name = payload.name.trim();
  if (payload.username !== undefined) updates.username = payload.username.trim();
  if (payload.password !== undefined) updates.password = payload.password;
  if (payload.website_url !== undefined)
    updates.website_url = payload.website_url?.trim() || null;
  if (payload.category !== undefined) updates.category = payload.category;
  if (payload.notes !== undefined)
    updates.notes = payload.notes?.trim() || null;

  // Banking fields
  if (payload.account_number !== undefined)
    updates.account_number = payload.account_number?.trim() || null;
  if (payload.ifsc_code !== undefined)
    updates.ifsc_code = payload.ifsc_code?.trim()?.toUpperCase() || null;
  if (payload.account_type !== undefined)
    updates.account_type = payload.account_type?.trim() || null;
  if (payload.customer_id !== undefined)
    updates.customer_id = payload.customer_id?.trim() || null;
  if (payload.account_holder_name !== undefined)
    updates.account_holder_name = payload.account_holder_name?.trim() || null;
  if (payload.branch_name !== undefined)
    updates.branch_name = payload.branch_name?.trim() || null;
  if (payload.atm_pin !== undefined)
    updates.atm_pin = payload.atm_pin?.trim() || null;
  if (payload.mpin !== undefined) updates.mpin = payload.mpin?.trim() || null;
  if (payload.transaction_password !== undefined)
    updates.transaction_password = payload.transaction_password?.trim() || null;
  if (payload.registered_phone !== undefined)
    updates.registered_phone = payload.registered_phone?.trim() || null;

  const { data, error } = await supabase
    .from("passwords")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating password:", error);
    throw new Error(`Error updating password: ${error.message}`);
  }

  return data as PasswordItem;
}

/**
 * Delete a single password entry
 */
export async function deletePassword(id: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");

  const { error } = await supabase
    .from("passwords")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting password:", error);
    throw new Error(`Error deleting password: ${error.message}`);
  }

  return true;
}

/**
 * Bulk delete multiple password entries
 */
export async function deleteMultiplePasswords(
  ids: string[],
): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) throw new Error("User is not authenticated.");
  if (!ids.length) return true;

  const { error } = await supabase
    .from("passwords")
    .delete()
    .in("id", ids)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting multiple passwords:", error);
    throw new Error(`Error deleting multiple passwords: ${error.message}`);
  }

  return true;
}
