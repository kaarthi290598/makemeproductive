export interface PasswordItem {
  id: string;
  user_id: string;
  name: string; // App/Website name or Bank Name
  username: string; // Username/Email or Netbanking User ID
  password: string; // Login Password
  website_url?: string | null;
  category: string;
  notes?: string | null;

  // Bank Specific Details
  account_number?: string | null;
  ifsc_code?: string | null;
  account_type?: string | null;
  customer_id?: string | null;
  account_holder_name?: string | null;
  branch_name?: string | null;
  atm_pin?: string | null;
  mpin?: string | null;
  transaction_password?: string | null;
  registered_phone?: string | null;

  created_at?: string;
  updated_at?: string;
}

export type PasswordInput = Omit<
  PasswordItem,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export const PASSWORD_CATEGORIES = [
  "General",
  "Bank",
  "Work",
  "Personal",
  "Finance",
  "Entertainment",
  "Social",
  "Other",
] as const;

export const ACCOUNT_TYPES = [
  "Savings",
  "Current",
  "Salary",
  "Fixed Deposit",
  "Recurring Deposit",
  "NRI Account",
  "Other",
] as const;

