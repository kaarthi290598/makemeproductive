import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SubscriptionInput,
  SubscriptionItem,
  SubscriptionStatus,
} from "@/types/subscription";
import {
  fetchSubscriptions,
  createSubscription,
  updateSubscription,
  setSubscriptionStatus,
  deleteSubscription,
  deleteMultipleSubscriptions,
} from "@/lib/actions/subscriptionsData";
import { toast } from "sonner";

interface SubscriptionsState {
  subscriptions: SubscriptionItem[];
  loading: boolean;
  searchQuery: string;
  selectedCategory: string;
  selectedStatus: string;
  selectedIds: string[];

  // Filter setters
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedStatus: (status: string) => void;

  // Selection
  toggleSelectId: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // Actions
  loadSubscriptions: () => Promise<void>;
  addSubscription: (payload: SubscriptionInput) => Promise<SubscriptionItem | null>;
  editSubscription: (
    id: string,
    payload: Partial<SubscriptionInput>,
  ) => Promise<SubscriptionItem | null>;
  changeStatus: (
    id: string,
    status: SubscriptionStatus,
  ) => Promise<void>;
  removeSubscription: (id: string) => Promise<boolean>;
  removeMultipleSubscriptions: (ids: string[]) => Promise<boolean>;
}

export const useSubscriptionsStore = create<SubscriptionsState>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      loading: false,
      searchQuery: "",
      selectedCategory: "All",
      selectedStatus: "all",
      selectedIds: [],

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedCategory: (category: string) => set({ selectedCategory: category }),
  setSelectedStatus: (status: string) => set({ selectedStatus: status }),

  toggleSelectId: (id: string) => {
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id],
    }));
  },

  selectAll: () => {
    const { subscriptions, searchQuery, selectedCategory, selectedStatus } = get();
    const q = searchQuery.toLowerCase().trim();
    const filtered = subscriptions.filter((item) => {
      const matchCat =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchStatus =
        selectedStatus === "all" || item.status === selectedStatus;
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.payment_method &&
          item.payment_method.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));
      return matchCat && matchStatus && matchSearch;
    });
    set({ selectedIds: filtered.map((s) => s.id) });
  },

  clearSelection: () => set({ selectedIds: [] }),

  loadSubscriptions: async () => {
    set({ loading: true });
    try {
      const data = await fetchSubscriptions();
      set({ subscriptions: data });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subscriptions.");
    } finally {
      set({ loading: false });
    }
  },

  addSubscription: async (payload: SubscriptionInput) => {
    try {
      const created = await createSubscription(payload);
      set((state) => ({
        subscriptions: [...state.subscriptions, created].sort(
          (a, b) =>
            new Date(a.next_payment_date).getTime() -
            new Date(b.next_payment_date).getTime(),
        ),
      }));
      toast.success(`Subscription "${created.name}" added successfully`);
      return created;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add subscription";
      toast.error(msg);
      return null;
    }
  },

  editSubscription: async (id: string, payload: Partial<SubscriptionInput>) => {
    try {
      const updated = await updateSubscription(id, payload);
      set((state) => ({
        subscriptions: state.subscriptions
          .map((item) => (item.id === id ? updated : item))
          .sort(
            (a, b) =>
              new Date(a.next_payment_date).getTime() -
              new Date(b.next_payment_date).getTime(),
          ),
      }));
      toast.success(`Updated "${updated.name}"`);
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update subscription";
      toast.error(msg);
      return null;
    }
  },

  changeStatus: async (id: string, status: SubscriptionStatus) => {
    const prev = get().subscriptions;
    // Optimistic update
    set((state) => ({
      subscriptions: state.subscriptions.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    }));

    try {
      await setSubscriptionStatus(id, status);
      toast.success(`Status updated to ${status}`);
    } catch (err: unknown) {
      set({ subscriptions: prev });
      const msg = err instanceof Error ? err.message : "Failed to update status";
      toast.error(msg);
    }
  },

  removeSubscription: async (id: string) => {
    const prev = get().subscriptions;
    const target = prev.find((item) => item.id === id);

    set((state) => ({
      subscriptions: state.subscriptions.filter((item) => item.id !== id),
      selectedIds: state.selectedIds.filter((item) => item !== id),
    }));

    try {
      await deleteSubscription(id);
      toast.success(`Deleted "${target?.name || "Subscription"}"`);
      return true;
    } catch (err: unknown) {
      set({ subscriptions: prev });
      const msg = err instanceof Error ? err.message : "Failed to delete";
      toast.error(msg);
      return false;
    }
  },

  removeMultipleSubscriptions: async (ids: string[]) => {
    if (ids.length === 0) return true;
    const prev = get().subscriptions;

    set((state) => ({
      subscriptions: state.subscriptions.filter((item) => !ids.includes(item.id)),
      selectedIds: [],
    }));

    try {
      await deleteMultipleSubscriptions(ids);
      toast.success(`Deleted ${ids.length} subscriptions`);
      return true;
    } catch (err: unknown) {
      set({ subscriptions: prev });
      const msg = err instanceof Error ? err.message : "Failed to bulk delete";
      toast.error(msg);
      return false;
    }
  },
  }),
  {
    name: "subscriptions-store",
    partialize: (state) => ({
      subscriptions: state.subscriptions,
    }),
  },
));
