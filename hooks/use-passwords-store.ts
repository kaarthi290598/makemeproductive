import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchPasswords,
  createPassword,
  updatePassword,
  deletePassword,
  deleteMultiplePasswords,
} from "@/lib/actions/passwordsData";
import { PasswordItem, PasswordInput } from "@/types/password";
import { toast } from "sonner";

interface PasswordsStore {
  passwords: PasswordItem[];
  loading: boolean;
  searchQuery: string;
  selectedCategory: string;
  selectedIds: string[];
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  toggleSelectId: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  loadPasswords: () => Promise<void>;
  addPassword: (payload: PasswordInput) => Promise<void>;
  editPassword: (id: string, payload: Partial<PasswordInput>) => Promise<void>;
  removePassword: (id: string) => Promise<void>;
  removeMultiplePasswords: (ids: string[]) => Promise<void>;
}

export const usePasswordsStore = create<PasswordsStore>()(
  persist(
    (set, get) => ({
      passwords: [],
      loading: false,
      searchQuery: "",
      selectedCategory: "All",
      selectedIds: [],

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedCategory: (category: string) => set({ selectedCategory: category }),

  setSelectedIds: (updater) => {
    if (typeof updater === "function") {
      set((state) => ({ selectedIds: updater(state.selectedIds) }));
    } else {
      set({ selectedIds: updater });
    }
  },

  toggleSelectId: (id: string) => {
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id],
    }));
  },

  selectAll: () => {
    const { passwords, searchQuery, selectedCategory } = get();
    const q = searchQuery.toLowerCase().trim();
    const filtered = passwords.filter((item) => {
      const matchCat =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.username.toLowerCase().includes(q) ||
        (item.account_number && item.account_number.toLowerCase().includes(q)) ||
        (item.ifsc_code && item.ifsc_code.toLowerCase().includes(q)) ||
        (item.customer_id && item.customer_id.toLowerCase().includes(q)) ||
        (item.branch_name && item.branch_name.toLowerCase().includes(q)) ||
        (item.website_url && item.website_url.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
    set({ selectedIds: filtered.map((p) => p.id) });
  },

  clearSelection: () => set({ selectedIds: [] }),

  loadPasswords: async () => {
    set({ loading: true });
    try {
      const data = await fetchPasswords();
      set({ passwords: data, loading: false });
    } catch (err: any) {
      console.error("Failed to load passwords:", err);
      toast.error(err.message || "Failed to load credentials");
      set({ loading: false });
    }
  },

  addPassword: async (payload: PasswordInput) => {
    try {
      const created = await createPassword(payload);
      set((state) => ({
        passwords: [created, ...state.passwords].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      }));
      toast.success(`Saved credentials for ${created.name}`);
    } catch (err: any) {
      console.error("Failed to add password:", err);
      toast.error(err.message || "Failed to save password");
      throw err;
    }
  },

  editPassword: async (id: string, payload: Partial<PasswordInput>) => {
    try {
      const updated = await updatePassword(id, payload);
      set((state) => ({
        passwords: state.passwords
          .map((p) => (p.id === id ? updated : p))
          .sort((a, b) => a.name.localeCompare(b.name)),
      }));
      toast.success(`Updated credentials for ${updated.name}`);
    } catch (err: any) {
      console.error("Failed to update password:", err);
      toast.error(err.message || "Failed to update password");
      throw err;
    }
  },

  removePassword: async (id: string) => {
    const prev = get().passwords;
    const target = prev.find((p) => p.id === id);
    // Optimistic delete
    set((state) => ({
      passwords: state.passwords.filter((p) => p.id !== id),
      selectedIds: state.selectedIds.filter((item) => item !== id),
    }));

    try {
      await deletePassword(id);
      toast.success(`Deleted ${target?.name || "credential"}`);
    } catch (err: any) {
      console.error("Failed to delete password:", err);
      set({ passwords: prev });
      toast.error(err.message || "Failed to delete password");
      throw err;
    }
  },

  removeMultiplePasswords: async (ids: string[]) => {
    const prev = get().passwords;
    const count = ids.length;
    // Optimistic delete
    set((state) => ({
      passwords: state.passwords.filter((p) => !ids.includes(p.id)),
      selectedIds: [],
    }));

    try {
      await deleteMultiplePasswords(ids);
      toast.success(`Deleted ${count} credentials`);
    } catch (err: any) {
      console.error("Failed to bulk delete passwords:", err);
      set({ passwords: prev });
      toast.error(err.message || "Failed to delete selected passwords");
      throw err;
    }
  },
  }),
  {
    name: "passwords-store",
    partialize: (state) => ({
      passwords: state.passwords,
    }),
  },
));
