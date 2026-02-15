import { create } from "zustand";
import { Category, Transaction, MonthlySummary, Person } from "@/types/expense";
import {
  fetchExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  fetchExpenseTransactions,
  createExpenseTransaction,
  updateExpenseTransaction,
  deleteExpenseTransaction,
  toggleTransactionSettlement,
  fetchExpensePersons,
  createExpensePerson,
  updateExpensePerson,
  deleteExpensePerson,
  fetchMonthlySummaries,
  createMonthlySummary,
} from "@/lib/actions/expenseData";

interface ExpenseStore {
  categories: Category[];
  transactions: Transaction[];
  monthlySummaries: MonthlySummary[];
  persons: Person[];
  loading: boolean;
  error: string | null;

  // Actions
  initialize: (quiet?: boolean) => Promise<void>;
  addTransaction: (
    transaction: Omit<Transaction, "id" | "user_id">,
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    updates: Partial<Transaction>,
  ) => Promise<void>;
  toggleSettlement: (id: string, needsSettlement: boolean) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (
    category: Omit<Category, "id" | "user_id" | "spent">,
  ) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addPerson: (name: string) => Promise<void>;
  updatePerson: (id: string, name: string) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  reconcileBudget: (month: string) => Promise<void>;
  resetData: () => Promise<void>;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  categories: [],
  transactions: [],
  monthlySummaries: [],
  persons: [],
  loading: false,
  error: null,

  initialize: async (quiet = false) => {
    if (!quiet) set({ loading: true });
    set({ error: null });
    try {
      const [categories, transactions, persons, summaries] = await Promise.all([
        fetchExpenseCategories(),
        fetchExpenseTransactions(),
        fetchExpensePersons(),
        fetchMonthlySummaries(),
      ]);
      set({
        categories,
        transactions,
        persons,
        monthlySummaries: summaries,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addTransaction: async (transaction) => {
    set({ error: null });
    try {
      await createExpenseTransaction(transaction);
      await get().initialize(true);
    } catch (err: any) {
      set({ error: err.message });
      throw err; // Re-throw to handle loading in component
    }
  },

  updateTransaction: async (id, updates) => {
    set({ error: null });
    try {
      await updateExpenseTransaction(id, updates);
      await get().initialize(true);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  toggleSettlement: async (id, needsSettlement) => {
    set({ error: null });
    try {
      await toggleTransactionSettlement(id, needsSettlement);
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, needs_settlement: needsSettlement } : t,
        ),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteTransaction: async (id) => {
    set({ error: null });
    try {
      await deleteExpenseTransaction(id);
      await get().initialize(true);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  addCategory: async (category) => {
    set({ error: null });
    try {
      await createExpenseCategory(category);
      await get().initialize(true);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateCategory: async (id, updates) => {
    set({ error: null });
    try {
      await updateExpenseCategory(id, updates);
      await get().initialize(true);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteCategory: async (id) => {
    set({ error: null });
    try {
      await deleteExpenseCategory(id);
      await get().initialize(true);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  addPerson: async (name) => {
    set({ error: null });
    try {
      await createExpensePerson(name);
      await get().initialize(true);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updatePerson: async (id, name) => {
    set({ error: null });
    try {
      await updateExpensePerson(id, name);
      await get().initialize(true);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deletePerson: async (id) => {
    set({ error: null });
    try {
      await deleteExpensePerson(id);
      await get().initialize(true);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  reconcileBudget: async (month) => {
    set({ loading: true, error: null });
    try {
      const state = get();

      // Calculate total budget and spent for the month
      const totalBudget = state.categories.reduce(
        (acc, cat) => acc + cat.monthly_budget,
        0,
      );
      const totalSpent = state.categories.reduce(
        (acc, cat) => acc + cat.spent,
        0,
      );
      const savings = Math.max(0, totalBudget - totalSpent);

      // Record summary
      const income = state.transactions
        .filter((t) => t.type === "income" && t.date.startsWith(month))
        .reduce((acc, t) => acc + t.amount, 0);

      const expense = state.transactions
        .filter((t) => t.type === "expense" && t.date.startsWith(month))
        .reduce((acc, t) => acc + t.amount, 0);

      const summary: Omit<MonthlySummary, "id" | "user_id"> = {
        month,
        total_income: income,
        total_expense: expense,
        carry_over: savings,
      };

      await createMonthlySummary(summary);

      // Rollover budget and reset spent in the database
      // This part is complex for a server action loop,
      // ideally this would be a single transaction/RPC in Supabase.
      // But let's follow the implementation pattern for now.
      for (const cat of state.categories) {
        const remaining = Math.max(0, cat.monthly_budget - cat.spent);
        await updateExpenseCategory(cat.id, {
          monthly_budget: cat.monthly_budget + remaining,
          spent: 0,
        });
      }

      await get().initialize();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  resetData: async () => {
    // This action is destructive and might not be appropriate for production without strict confirmation
    // but we'll leave it as a placeholder that clears local state and could potentially clear DB
    set({
      categories: [],
      transactions: [],
      persons: [],
      monthlySummaries: [],
    });
  },
}));
