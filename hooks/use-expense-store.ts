import { create } from "zustand";
import { Category, Transaction, MonthlySummary, Person } from "@/types/expense";
import {
  fetchExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  createExpenseTransaction,
  updateExpenseTransaction,
  deleteExpenseTransaction,
  toggleTransactionSettlement,
  fetchExpensePersons,
  createExpensePerson,
  updateExpensePerson,
  deleteExpensePerson,
  createMonthlySummary,
  fetchExpenseStats,
} from "@/lib/actions/expenseData";

const INIT_TTL_MS = 60_000;
let initializePromise: Promise<void> | null = null;

interface ExpenseStore {
  categories: Category[];
  monthlySummaries: MonthlySummary[];
  persons: Person[];
  loading: boolean;
  error: string | null;
  loadedAt: number | null;

  initialize: (options?: { quiet?: boolean; force?: boolean }) => Promise<void>;
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

async function refreshCategories(
  set: (partial: Partial<ExpenseStore>) => void,
) {
  try {
    const categories = await fetchExpenseCategories();
    set({ categories });
  } catch {
    // keep existing categories
  }
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  categories: [],
  monthlySummaries: [],
  persons: [],
  loading: false,
  error: null,
  loadedAt: null,

  initialize: async (options = {}) => {
    const { quiet = false, force = false } = options;
    const { loadedAt } = get();
    if (!force && loadedAt && Date.now() - loadedAt < INIT_TTL_MS) {
      return;
    }

    if (initializePromise) {
      return initializePromise;
    }

    initializePromise = (async () => {
      if (!quiet) set({ loading: true });
      set({ error: null });
      try {
        const [categories, persons] = await Promise.all([
          fetchExpenseCategories(),
          fetchExpensePersons(),
        ]);
        set({
          categories,
          persons,
          loading: false,
          loadedAt: Date.now(),
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load";
        set({ error: message, loading: false });
      } finally {
        initializePromise = null;
      }
    })();

    return initializePromise;
  },

  addTransaction: async (transaction) => {
    set({ error: null });
    try {
      await createExpenseTransaction(transaction);
      await refreshCategories(set);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add";
      set({ error: message });
      throw err;
    }
  },

  updateTransaction: async (id, updates) => {
    set({ error: null });
    try {
      await updateExpenseTransaction(id, updates);
      await refreshCategories(set);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update";
      set({ error: message });
      throw err;
    }
  },

  toggleSettlement: async (id, needsSettlement) => {
    set({ error: null });
    try {
      await toggleTransactionSettlement(id, needsSettlement);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update";
      set({ error: message });
      throw err;
    }
  },

  deleteTransaction: async (id) => {
    set({ error: null });
    try {
      await deleteExpenseTransaction(id);
      await refreshCategories(set);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      set({ error: message });
      throw err;
    }
  },

  addCategory: async (category) => {
    set({ error: null });
    try {
      const created = await createExpenseCategory(category);
      set((state) => ({
        categories: [...state.categories, created].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add";
      set({ error: message });
      throw err;
    }
  },

  updateCategory: async (id, updates) => {
    set({ error: null });
    try {
      const updated = await updateExpenseCategory(id, updates);
      set((state) => ({
        categories: state.categories
          .map((c) => (c.id === id ? { ...c, ...updated } : c))
          .sort((a, b) => a.name.localeCompare(b.name)),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update";
      set({ error: message });
      throw err;
    }
  },

  deleteCategory: async (id) => {
    set({ error: null });
    try {
      await deleteExpenseCategory(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      set({ error: message });
      throw err;
    }
  },

  addPerson: async (name) => {
    set({ error: null });
    try {
      const created = await createExpensePerson(name);
      set((state) => ({
        persons: [...state.persons, created].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add";
      set({ error: message });
      throw err;
    }
  },

  updatePerson: async (id, name) => {
    set({ error: null });
    try {
      const updated = await updateExpensePerson(id, name);
      set((state) => ({
        persons: state.persons
          .map((p) => (p.id === id ? { ...p, ...updated } : p))
          .sort((a, b) => a.name.localeCompare(b.name)),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update";
      set({ error: message });
      throw err;
    }
  },

  deletePerson: async (id) => {
    set({ error: null });
    try {
      await deleteExpensePerson(id);
      set((state) => ({
        persons: state.persons.filter((p) => p.id !== id),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      set({ error: message });
      throw err;
    }
  },

  reconcileBudget: async (month) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const totalBudget = state.categories.reduce(
        (acc, cat) => acc + cat.monthly_budget,
        0,
      );
      const totalSpent = state.categories.reduce(
        (acc, cat) => acc + cat.spent,
        0,
      );
      const savings = Math.max(0, totalBudget - totalSpent);

      const stats = await fetchExpenseStats({
        dateFilterType: "month",
        selectedDates: [month],
      });

      const summary: Omit<MonthlySummary, "id" | "user_id"> = {
        month,
        total_income: stats.totalIncome,
        total_expense: stats.totalExpense,
        carry_over: savings,
      };

      await createMonthlySummary(summary);

      for (const cat of state.categories) {
        const remaining = Math.max(0, cat.monthly_budget - cat.spent);
        await updateExpenseCategory(cat.id, {
          monthly_budget: cat.monthly_budget + remaining,
          spent: 0,
        });
      }

      await get().initialize({ force: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reconcile";
      set({ error: message, loading: false });
    }
  },

  resetData: async () => {
    set({
      categories: [],
      persons: [],
      monthlySummaries: [],
      loadedAt: null,
    });
  },
}));
