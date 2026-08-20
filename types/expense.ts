export type TransactionType = "income" | "expense";

export interface Category {
  id: string; // UUID from Supabase
  user_id: string; // Clerk ID
  name: string;
  monthly_budget: number;
  spent: number;
  color: string;
  default_payer?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string; // UUID
  user_id: string;
  amount: number;
  type: TransactionType;
  category_id?: string;
  expense_categories?: Category; // Nested object from Supabase join
  date: string; // DATE string from Supabase
  note?: string;
  needs_settlement?: boolean;
  paid_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Person {
  id: string; // UUID
  user_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface MonthlySummary {
  id: string; // UUID
  user_id: string;
  month: string; // YYYY-MM
  total_income: number;
  total_expense: number;
  carry_over: number;
  created_at?: string;
  updated_at?: string;
}

export type DateFilterType = "all" | "month" | "year";

export interface ExpenseTransactionFilters {
  dateFilterType: DateFilterType;
  selectedDates: string[];
  searchTerm?: string;
  filterType?: "all" | "income" | "expense";
  filterCategory?: string;
  filterPaidBy?: string;
  filterSettlement?: "all" | "settlement";
  personFilter?: string;
}

export interface ExpenseStats {
  totalIncome: number;
  totalExpense: number;
  spentByCategory: Record<string, number>;
}

export interface ExpenseState {
  categories: Category[];
  monthlySummaries: MonthlySummary[];
  persons: Person[];
  loading: boolean;
  error: string | null;
}
