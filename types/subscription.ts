export type BillingFrequency =
  | "monthly"
  | "yearly"
  | "half-yearly"
  | "quarterly"
  | "weekly";
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
  { value: "monthly", label: "Monthly (1 Month)", shortLabel: "/mo" },
  { value: "quarterly", label: "Quarterly (3 Months)", shortLabel: "/qtr" },
  { value: "half-yearly", label: "Half-Yearly (6 Months)", shortLabel: "/6mo" },
  { value: "yearly", label: "Yearly (12 Months)", shortLabel: "/yr" },
  { value: "weekly", label: "Weekly (1 Week)", shortLabel: "/wk" },
];

/**
 * Formats a billing frequency value into a readable label
 */
export function formatBillingFrequency(
  frequency: BillingFrequency | string,
): string {
  switch (frequency) {
    case "weekly":
      return "Weekly";
    case "quarterly":
      return "Quarterly";
    case "half-yearly":
    case "6months":
      return "Half-Yearly (6 Mo)";
    case "yearly":
      return "Yearly";
    case "monthly":
    default:
      return "Monthly";
  }
}

/**
 * Returns the short suffix (e.g. /mo, /6mo, /yr) for a billing frequency
 */
export function getBillingFrequencyShortLabel(
  frequency: BillingFrequency | string,
): string {
  switch (frequency) {
    case "weekly":
      return "/wk";
    case "quarterly":
      return "/qtr";
    case "half-yearly":
    case "6months":
      return "/6mo";
    case "yearly":
      return "/yr";
    case "monthly":
    default:
      return "/mo";
  }
}

/**
 * Calculates monthly equivalent cost
 */
export function calculateMonthlyEquivalent(
  amount: number,
  frequency: BillingFrequency | string,
): number {
  switch (frequency) {
    case "weekly":
      return (amount * 52) / 12;
    case "quarterly":
      return amount / 3;
    case "half-yearly":
    case "6months":
      return amount / 6;
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
  frequency: BillingFrequency | string,
): number {
  switch (frequency) {
    case "weekly":
      return amount * 52;
    case "monthly":
      return amount * 12;
    case "quarterly":
      return amount * 4;
    case "half-yearly":
    case "6months":
      return amount * 2;
    case "yearly":
    default:
      return amount;
  }
}
