export interface CreditDueItem {
  id: string;
  user_id: string;
  name: string; // e.g. HDFC Regalia, ICICI Amazon Pay, Slice (Mandatory)
  credit_limit: number; // Mandatory
  total_outstanding: number; // Mandatory
  statement_amount?: number | null; // Optional
  minimum_due?: number | null; // Optional
  amount_paid?: number | null; // Optional
  due_date?: string | null; // Optional (YYYY-MM-DD)
  notes?: string | null; // Optional
  created_at?: string;
  updated_at?: string;
}

export type CreditDueInput = Omit<
  CreditDueItem,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export const CREDIT_ACCOUNT_TYPES = [
  "Credit Card",
  "BNPL / PayLater",
  "Line of Credit / Overdraft",
  "Loan / EMI Due",
  "Other",
] as const;

/**
 * Calculate Remaining Due: Statement Amount (or Total Outstanding) - Amount Paid
 */
export function calculateRemainingDue(item: CreditDueItem | CreditDueInput): number {
  const base =
    item.statement_amount != null && item.statement_amount > 0
      ? item.statement_amount
      : item.total_outstanding || 0;
  return Math.max(0, base - (item.amount_paid || 0));
}

/**
 * Calculate Credit Utilization Percentage: (Total Outstanding / Credit Limit) * 100
 */
export function calculateUtilization(item: CreditDueItem | CreditDueInput): number {
  if (!item.credit_limit || item.credit_limit <= 0) return 0;
  return Math.min(100, Math.max(0, (item.total_outstanding / item.credit_limit) * 100));
}

/**
 * Calculate Available Credit Limit: Credit Limit - Total Outstanding
 */
export function calculateAvailableCredit(item: CreditDueItem | CreditDueInput): number {
  if (!item.credit_limit || item.credit_limit <= 0) return 0;
  return Math.max(0, item.credit_limit - (item.total_outstanding || 0));
}

/**
 * Utilization health status styling and thresholds
 */
export function getUtilizationHealth(utilization: number): {
  label: string;
  color: string;
  barColor: string;
  bg: string;
} {
  if (utilization <= 30) {
    return {
      label: "Safe (<30%)",
      color: "text-emerald-700 dark:text-emerald-300",
      barColor: "bg-emerald-500",
      bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900/60",
    };
  }
  if (utilization <= 70) {
    return {
      label: "Moderate (30-70%)",
      color: "text-amber-700 dark:text-amber-300",
      barColor: "bg-amber-500",
      bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-900/60",
    };
  }
  return {
    label: "High (>70%)",
    color: "text-rose-700 dark:text-rose-300",
    barColor: "bg-rose-500",
    bg: "bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:border-rose-900/60",
  };
}
