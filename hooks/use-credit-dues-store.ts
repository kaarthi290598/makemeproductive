import { create } from "zustand";
import { CreditDueInput, CreditDueItem, calculateRemainingDue, calculateUtilization } from "@/types/credit-due";
import {
  fetchCreditDues,
  createCreditDue,
  updateCreditDue,
  recordCreditPayment,
  deleteCreditDue,
  deleteMultipleCreditDues,
} from "@/lib/actions/creditDuesData";
import { toast } from "sonner";

interface CreditDuesState {
  creditDues: CreditDueItem[];
  loading: boolean;
  searchQuery: string;
  filterStatus: "all" | "unpaid" | "paid" | "high_utilization";
  selectedIds: string[];

  // Filter setters
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: "all" | "unpaid" | "paid" | "high_utilization") => void;

  // Selection
  toggleSelectId: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // Actions
  loadCreditDues: () => Promise<void>;
  addCreditDue: (payload: CreditDueInput) => Promise<CreditDueItem | null>;
  editCreditDue: (
    id: string,
    payload: Partial<CreditDueInput>,
  ) => Promise<CreditDueItem | null>;
  payCreditDue: (id: string, amountPaid: number) => Promise<CreditDueItem | null>;
  removeCreditDue: (id: string) => Promise<boolean>;
  removeMultipleCreditDues: (ids: string[]) => Promise<boolean>;
}

export const useCreditDuesStore = create<CreditDuesState>((set, get) => ({
  creditDues: [],
  loading: false,
  searchQuery: "",
  filterStatus: "all",
  selectedIds: [],

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setFilterStatus: (status) => set({ filterStatus: status }),

  toggleSelectId: (id: string) => {
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id],
    }));
  },

  selectAll: () => {
    const { creditDues, searchQuery, filterStatus } = get();
    const q = searchQuery.toLowerCase().trim();
    const filtered = creditDues.filter((item) => {
      const remainingDue = calculateRemainingDue(item);
      const utilization = calculateUtilization(item);

      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "unpaid" && remainingDue > 0) ||
        (filterStatus === "paid" && remainingDue === 0) ||
        (filterStatus === "high_utilization" && utilization > 30);

      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
    set({ selectedIds: filtered.map((c) => c.id) });
  },

  clearSelection: () => set({ selectedIds: [] }),

  loadCreditDues: async () => {
    set({ loading: true });
    try {
      const data = await fetchCreditDues();
      set({ creditDues: data });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load credit accounts.");
    } finally {
      set({ loading: false });
    }
  },

  addCreditDue: async (payload: CreditDueInput) => {
    try {
      const created = await createCreditDue(payload);
      set((state) => ({
        creditDues: [...state.creditDues, created].sort(
          (a, b) =>
            new Date(a.due_date || "9999-12-31").getTime() -
            new Date(b.due_date || "9999-12-31").getTime(),
        ),
      }));
      toast.success(`Account "${created.name}" added successfully`);
      return created;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add account";
      toast.error(msg);
      return null;
    }
  },

  editCreditDue: async (id: string, payload: Partial<CreditDueInput>) => {
    try {
      const updated = await updateCreditDue(id, payload);
      set((state) => ({
        creditDues: state.creditDues
          .map((item) => (item.id === id ? updated : item))
          .sort(
            (a, b) =>
              new Date(a.due_date || "9999-12-31").getTime() -
              new Date(b.due_date || "9999-12-31").getTime(),
          ),
      }));
      toast.success(`Updated "${updated.name}"`);
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update account";
      toast.error(msg);
      return null;
    }
  },

  payCreditDue: async (id: string, amountPaid: number) => {
    try {
      const updated = await recordCreditPayment(id, amountPaid);
      set((state) => ({
        creditDues: state.creditDues.map((item) =>
          item.id === id ? updated : item,
        ),
      }));
      toast.success(`Payment recorded for "${updated.name}"`);
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record payment";
      toast.error(msg);
      return null;
    }
  },

  removeCreditDue: async (id: string) => {
    const prev = get().creditDues;
    const target = prev.find((item) => item.id === id);

    set((state) => ({
      creditDues: state.creditDues.filter((item) => item.id !== id),
      selectedIds: state.selectedIds.filter((item) => item !== id),
    }));

    try {
      await deleteCreditDue(id);
      toast.success(`Deleted "${target?.name || "Account"}"`);
      return true;
    } catch (err: unknown) {
      set({ creditDues: prev });
      const msg = err instanceof Error ? err.message : "Failed to delete account";
      toast.error(msg);
      return false;
    }
  },

  removeMultipleCreditDues: async (ids: string[]) => {
    if (ids.length === 0) return true;
    const prev = get().creditDues;

    set((state) => ({
      creditDues: state.creditDues.filter((item) => !ids.includes(item.id)),
      selectedIds: [],
    }));

    try {
      await deleteMultipleCreditDues(ids);
      toast.success(`Deleted ${ids.length} credit accounts`);
      return true;
    } catch (err: unknown) {
      set({ creditDues: prev });
      const msg = err instanceof Error ? err.message : "Failed to bulk delete";
      toast.error(msg);
      return false;
    }
  },
}));
