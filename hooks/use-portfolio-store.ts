import { create } from "zustand";
import {
  fetchPortfolioInvestments,
  createPortfolioInvestment,
  updatePortfolioInvestment,
  deletePortfolioInvestment,
  createPortfolioContribution,
  updatePortfolioContribution,
  deletePortfolioContribution,
  fetchPortfolioDebts,
  createPortfolioDebt,
  updatePortfolioDebt,
  deletePortfolioDebt,
} from "@/lib/actions/portfolioData";

export interface InvestmentContribution {
  id: string;
  amount: number; // Invested amount
  currentValue: number; // Current value of this contribution
  date: string;
  note?: string;
}

export interface Investment {
  id: string;
  name: string;
  category: "Stocks" | "Mutual Funds" | "Crypto" | "Real Estate" | "Gold" | "Other";
  note?: string;
  contributions: InvestmentContribution[];
}

export interface Debt {
  id: string;
  name: string;
  category: "Home Loan" | "Personal Loan" | "Credit Card" | "Car Loan" | "Student Loan" | "Other";
  totalAmount: number;
  remainingAmount: number;
  interestRate: number; // in %
  monthlyPayment: number; // EMI
  dueDate?: string;
  note?: string;
}

interface PortfolioStore {
  investments: Investment[];
  debts: Debt[];
  loading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  addInvestment: (
    inv: Omit<Investment, "id" | "contributions">,
    amount: number,
    currentValue: number,
    date: string,
    note?: string
  ) => Promise<void>;
  updateInvestmentName: (id: string, name: string, category: Investment["category"], note?: string) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  
  // Contribution Actions
  addContribution: (investmentId: string, contrib: Omit<InvestmentContribution, "id">) => Promise<void>;
  updateContribution: (investmentId: string, contribId: string, updates: Partial<InvestmentContribution>) => Promise<void>;
  deleteContribution: (investmentId: string, contribId: string) => Promise<void>;

  addDebt: (debt: Omit<Debt, "id">) => Promise<void>;
  updateDebt: (id: string, updates: Partial<Debt>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  payDebt: (id: string, amount: number) => Promise<void>;
  resetStore: () => void;
}

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  investments: [],
  debts: [],
  loading: false,
  error: null,

  initialize: async () => {
    set({ loading: true, error: null });
    try {
      const [investments, debts] = await Promise.all([
        fetchPortfolioInvestments(),
        fetchPortfolioDebts(),
      ]);

      // Assert types correctly after fetching
      set({
        investments: investments as Investment[],
        debts: debts as Debt[],
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addInvestment: async (inv, amount, currentValue, date, note) => {
    try {
      const newInv = await createPortfolioInvestment(
        inv,
        amount,
        currentValue,
        date,
        note
      );
      set((state) => ({ investments: [newInv as Investment, ...state.investments] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateInvestmentName: async (id, name, category, note) => {
    try {
      const updated = await updatePortfolioInvestment(id, { name, category, note });
      set((state) => ({
        investments: state.investments.map((inv) =>
          inv.id === id ? { ...inv, ...updated } : inv
        ),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteInvestment: async (id) => {
    try {
      await deletePortfolioInvestment(id);
      set((state) => ({
        investments: state.investments.filter((inv) => inv.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  addContribution: async (investmentId, contrib) => {
    try {
      const newContrib = await createPortfolioContribution(investmentId, contrib);
      set((state) => ({
        investments: state.investments.map((inv) => {
          if (inv.id === investmentId) {
            return {
              ...inv,
              contributions: [newContrib as InvestmentContribution, ...inv.contributions],
            };
          }
          return inv;
        }),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateContribution: async (investmentId, contribId, updates) => {
    try {
      const updated = await updatePortfolioContribution(contribId, updates);
      set((state) => ({
        investments: state.investments.map((inv) => {
          if (inv.id === investmentId) {
            return {
              ...inv,
              contributions: inv.contributions.map((c) =>
                c.id === contribId ? { ...c, ...updated } : c
              ),
            };
          }
          return inv;
        }),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteContribution: async (investmentId, contribId) => {
    try {
      await deletePortfolioContribution(contribId);
      set((state) => ({
        investments: state.investments.map((inv) => {
          if (inv.id === investmentId) {
            return {
              ...inv,
              contributions: inv.contributions.filter((c) => c.id !== contribId),
            };
          }
          return inv;
        }),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  addDebt: async (d) => {
    try {
      const newDebt = await createPortfolioDebt(d);
      set((state) => ({ debts: [newDebt as Debt, ...state.debts] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateDebt: async (id, updates) => {
    try {
      const updated = await updatePortfolioDebt(id, updates);
      set((state) => ({
        debts: state.debts.map((d) => (d.id === id ? { ...d, ...updated } : d)),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteDebt: async (id) => {
    try {
      await deletePortfolioDebt(id);
      set((state) => ({
        debts: state.debts.filter((d) => d.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  payDebt: async (id, amount) => {
    try {
      const debt = get().debts.find((d) => d.id === id);
      if (!debt) return;
      
      const remaining = Math.max(0, debt.remainingAmount - amount);
      const updated = await updatePortfolioDebt(id, { remainingAmount: remaining });
      
      set((state) => ({
        debts: state.debts.map((d) => (d.id === id ? { ...d, ...updated } : d)),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  resetStore: () => {
    set({ investments: [], debts: [] });
  },
}));
