export type BillingFrequency = "monthly" | "yearly" | "quarterly" | "weekly";
export type SubscriptionStatus = "active" | "paused" | "cancelled";

export interface SubscriptionItem {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  billing_frequency: BillingFrequency;
  next_payment_date: string; // YYYY-MM-DD
  category: string;
  payment_method?: string | null;
  status: SubscriptionStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type SubscriptionInput = Omit<
  SubscriptionItem,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export const SUBSCRIPTION_CATEGORIES = [
  "Entertainment",
  "Work & Software",
  "Utilities",
  "Health & Fitness",
  "Education",
  "Finance & Insurance",
  "Shopping & Delivery",
  "Personal",
  "Other",
] as const;

export const PAYMENT_METHODS = [
  "Credit Card",
  "Debit Card",
  "UPI / Netbanking",
  "Auto-Debit / Mandate",
  "PayPal",
  "Apple Pay",
  "Google Pay",
  "Other",
] as const;

export const BILLING_FREQUENCIES: {
  value: BillingFrequency;
  label: string;
  shortLabel: string;
}[] = [
  { value: "monthly", label: "Monthly", shortLabel: "/mo" },
  { value: "yearly", label: "Yearly", shortLabel: "/yr" },
  { value: "quarterly", label: "Quarterly", shortLabel: "/qtr" },
  { value: "weekly", label: "Weekly", shortLabel: "/wk" },
];

/**
 * Calculates monthly equivalent cost
 */
export function calculateMonthlyEquivalent(
  amount: number,
  frequency: BillingFrequency,
): number {
  switch (frequency) {
    case "weekly":
      return (amount * 52) / 12;
    case "quarterly":
      return amount / 3;
    case "yearly":
      return amount / 12;
    case "monthly":
    default:
      return amount;
  }
}

/**
 * Calculates yearly equivalent cost
 */
export function calculateYearlyEquivalent(
  amount: number,
  frequency: BillingFrequency,
): number {
  switch (frequency) {
    case "weekly":
      return amount * 52;
    case "monthly":
      return amount * 12;
    case "quarterly":
      return amount * 4;
    case "yearly":
    default:
      return amount;
  }
}
