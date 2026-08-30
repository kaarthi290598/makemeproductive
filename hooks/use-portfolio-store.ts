import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchPortfolioInvestments,
  fetchInvestmentContributions,
  fetchDebtPayments,
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
  createDebtPayment,
  updateDebtPayment,
  deleteDebtPayment,
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
  investedAmount: number;
  currentValue: number;
  contributionCount: number;
  historyLoaded?: boolean;
  contributions: InvestmentContribution[];
}

export interface DebtPayment {
  id: string;
  principalAmount: number;
  interestAmount: number;
  date: string;
  note?: string;
}

export interface Debt {
  id: string;
  name: string;
  category: "Home Loan" | "Personal Loan" | "Credit Card" | "Car Loan" | "Student Loan" | "Other";
  totalAmount: number;
  remainingAmount: number;
  interestRate?: number | null; // in %
  monthlyPayment?: number | null; // EMI
  dueDate?: string | null;
  note?: string | null;
  interestAmount?: number | null;
  remainingInterestAmount?: number | null;
  paymentsLoaded?: boolean;
  payments: DebtPayment[];
}

interface PortfolioStore {
  investments: Investment[];
  debts: Debt[];
  loading: boolean;
  error: string | null;
  loadedAt: number | null;

  initialize: (options?: { force?: boolean }) => Promise<void>;
  loadInvestmentHistory: (investmentId: string) => Promise<void>;
  loadDebtPayments: (debtId: string) => Promise<void>;
  addInvestment: (
    inv: Pick<Investment, "name" | "category" | "note">,
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

  addDebt: (debt: Omit<Debt, "id" | "payments">) => Promise<void>;
  updateDebt: (id: string, updates: Partial<Omit<Debt, "payments">>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  
  // Debt Payment Actions
  addDebtPayment: (debtId: string, payment: Omit<DebtPayment, "id">) => Promise<void>;
  updateDebtPayment: (debtId: string, paymentId: string, updates: Partial<DebtPayment>) => Promise<void>;
  deleteDebtPayment: (debtId: string, paymentId: string) => Promise<void>;
  
  resetStore: () => void;
}

const INIT_TTL_MS = 60_000;
let initializePromise: Promise<void> | null = null;

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      investments: [],
      debts: [],
      loading: false,
      error: null,
      loadedAt: null,

  initialize: async (options = {}) => {
    const { force = false } = options;
    const { loadedAt } = get();
    if (!force && loadedAt && Date.now() - loadedAt < INIT_TTL_MS) {
      return;
    }
    if (initializePromise) return initializePromise;

    initializePromise = (async () => {
      set({ loading: true, error: null });
      try {
        const [investments, debts] = await Promise.all([
          fetchPortfolioInvestments(),
          fetchPortfolioDebts(),
        ]);
        set({
          investments: investments as Investment[],
          debts: debts as Debt[],
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

  loadInvestmentHistory: async (investmentId) => {
    const current = get().investments.find((inv) => inv.id === investmentId);
    if (current?.historyLoaded) return;
    try {
      const contributions = await fetchInvestmentContributions(investmentId);
      set((state) => ({
        investments: state.investments.map((inv) =>
          inv.id === investmentId
            ? { ...inv, contributions, historyLoaded: true, contributionCount: contributions.length }
            : inv,
        ),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load history";
      set({ error: message });
    }
  },

  loadDebtPayments: async (debtId) => {
    const current = get().debts.find((d) => d.id === debtId);
    if (current?.paymentsLoaded) return;
    try {
      const payments = await fetchDebtPayments(debtId);
      set((state) => ({
        debts: state.debts.map((d) =>
          d.id === debtId ? { ...d, payments, paymentsLoaded: true } : d,
        ),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load payments";
      set({ error: message });
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
          if (inv.id !== investmentId) return inv;
          const contributions = inv.historyLoaded
            ? [newContrib as InvestmentContribution, ...inv.contributions]
            : inv.contributions;
          const latest = contributions.length
            ? [...contributions].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
              )[0]
            : (newContrib as InvestmentContribution);
          return {
            ...inv,
            contributions,
            contributionCount: inv.contributionCount + 1,
            investedAmount: inv.investedAmount + newContrib.amount,
            currentValue: latest.currentValue,
          };
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
          if (inv.id !== investmentId) return inv;
          const contributions = inv.contributions.map((c) =>
            c.id === contribId ? { ...c, ...updated } : c,
          );
          const investedAmount = inv.historyLoaded
            ? contributions.reduce((sum, c) => sum + c.amount, 0)
            : inv.investedAmount;
          const latest = contributions.length
            ? [...contributions].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
              )[0]
            : null;
          return {
            ...inv,
            contributions,
            investedAmount,
            currentValue: latest ? latest.currentValue : inv.currentValue,
          };
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
          if (inv.id !== investmentId) return inv;
          const removed = inv.contributions.find((c) => c.id === contribId);
          const contributions = inv.contributions.filter((c) => c.id !== contribId);
          const latest = contributions.length
            ? [...contributions].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
              )[0]
            : null;
          return {
            ...inv,
            contributions,
            contributionCount: Math.max(0, inv.contributionCount - 1),
            investedAmount: removed
              ? inv.investedAmount - removed.amount
              : inv.investedAmount,
            currentValue: latest ? latest.currentValue : 0,
          };
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

  addDebtPayment: async (debtId, payment) => {
    try {
      const debt = get().debts.find((d) => d.id === debtId);
      if (!debt) return;

      const newPayment = await createDebtPayment(debtId, payment);
      
      // Also update the parent debt balances in DB
      const payload: Partial<Debt> = {};
      if (payment.principalAmount > 0) {
        payload.remainingAmount = Math.max(0, debt.remainingAmount - payment.principalAmount);
      }
      if (payment.interestAmount > 0) {
        payload.interestAmount = (debt.interestAmount || 0) + payment.interestAmount;
      }
      
      let updatedDebt = debt;
      if (Object.keys(payload).length > 0) {
        updatedDebt = await updatePortfolioDebt(debtId, payload) as Debt;
      }
      
      set((state) => ({
        debts: state.debts.map((d) => {
          if (d.id === debtId) {
            return {
              ...d,
              ...payload,
              payments: [newPayment as DebtPayment, ...(d.payments || [])],
            };
          }
          return d;
        }),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateDebtPayment: async (debtId, paymentId, updates) => {
    try {
      const debt = get().debts.find((d) => d.id === debtId);
      if (!debt) return;
      
      const oldPayment = (debt.payments || []).find(p => p.id === paymentId);
      if (!oldPayment) return;

      const updatedPayment = await updateDebtPayment(paymentId, updates);
      
      // Calculate diff to adjust parent debt
      const principalDiff = (updates.principalAmount !== undefined ? updates.principalAmount : oldPayment.principalAmount) - oldPayment.principalAmount;
      const interestDiff = (updates.interestAmount !== undefined ? updates.interestAmount : oldPayment.interestAmount) - oldPayment.interestAmount;
      
      const payload: Partial<Debt> = {};
      if (principalDiff !== 0) {
        payload.remainingAmount = Math.max(0, debt.remainingAmount - principalDiff);
      }
      if (interestDiff !== 0) {
        payload.interestAmount = Math.max(0, (debt.interestAmount || 0) + interestDiff);
      }

      if (Object.keys(payload).length > 0) {
        await updatePortfolioDebt(debtId, payload);
      }
      
      set((state) => ({
        debts: state.debts.map((d) => {
          if (d.id === debtId) {
            return {
              ...d,
              ...payload,
              payments: (d.payments || []).map((p) =>
                p.id === paymentId ? { ...p, ...updatedPayment } : p
              ),
            };
          }
          return d;
        }),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteDebtPayment: async (debtId, paymentId) => {
    try {
      const debt = get().debts.find((d) => d.id === debtId);
      if (!debt) return;
      
      const paymentToDelete = (debt.payments || []).find(p => p.id === paymentId);
      if (!paymentToDelete) return;

      await deleteDebtPayment(paymentId);
      
      // Revert parent debt balances
      const payload: Partial<Debt> = {};
      if (paymentToDelete.principalAmount > 0) {
        payload.remainingAmount = debt.remainingAmount + paymentToDelete.principalAmount;
      }
      if (paymentToDelete.interestAmount > 0) {
        payload.interestAmount = Math.max(0, (debt.interestAmount || 0) - paymentToDelete.interestAmount);
      }

      if (Object.keys(payload).length > 0) {
        await updatePortfolioDebt(debtId, payload);
      }
      
      set((state) => ({
        debts: state.debts.map((d) => {
          if (d.id === debtId) {
            return {
              ...d,
              ...payload,
              payments: (d.payments || []).filter((p) => p.id !== paymentId),
            };
          }
          return d;
        }),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

    resetStore: () => {
      set({ investments: [], debts: [], loadedAt: null });
    },
  }),
  {
    name: "portfolio-store",
    partialize: (state) => ({
      investments: state.investments,
      debts: state.debts,
      loadedAt: state.loadedAt,
    }),
  },
));
