import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  LayoutDashboard,
  Wallet,
  Landmark,
  CreditCard,
  CalendarSync,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

export type AppModuleId =
  | "dashboard"
  | "expense-tracker"
  | "portfolio"
  | "credit-dues"
  | "subscriptions"
  | "passwords";

export interface AppModuleConfig {
  id: AppModuleId;
  name: string;
  shortName: string;
  tagline: string;
  url: string;
  description: string;
  icon: LucideIcon;
  badge: string;
  gradient: string;
  colorClass: string;
}

export const APP_MODULES: AppModuleConfig[] = [
  {
    id: "dashboard",
    name: "Dashboard (Overview)",
    shortName: "Dashboard",
    tagline: "Unified Command Center",
    url: "/app?view=dashboard",
    description:
      "All-in-one financial overview, recent activities, net worth snapshot, and quick actions across all tools.",
    icon: LayoutDashboard,
    badge: "Recommended",
    gradient: "from-emerald-500/20 to-teal-500/10 dark:from-emerald-500/30 dark:to-teal-500/15",
    colorClass: "text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  {
    id: "expense-tracker",
    name: "Expense Tracker",
    shortName: "Expenses",
    tagline: "Spend & Budget Management",
    url: "/app/expense-tracker/overview",
    description:
      "Track daily debits and credits, manage category budgets, tag people, and analyze spending breakdowns.",
    icon: Wallet,
    badge: "Budgeting",
    gradient: "from-blue-500/20 to-cyan-500/10 dark:from-blue-500/30 dark:to-cyan-500/15",
    colorClass: "text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  {
    id: "portfolio",
    name: "Investments & Debts",
    shortName: "Portfolio",
    tagline: "Net Worth & Assets",
    url: "/app/portfolio/overview",
    description:
      "Stocks, mutual funds, gold, real estate, personal liabilities, and overall asset growth trajectory.",
    icon: Landmark,
    badge: "Wealth",
    gradient: "from-amber-500/20 to-orange-500/10 dark:from-amber-500/30 dark:to-orange-500/15",
    colorClass: "text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  {
    id: "credit-dues",
    name: "Credit Cards & Dues",
    shortName: "Credit",
    tagline: "Card Limits & Due Dates",
    url: "/app/credit-dues",
    description:
      "Credit card balances, utilization percentages, statement cycle dates, and due payment reminders.",
    icon: CreditCard,
    badge: "Credit Health",
    gradient: "from-violet-500/20 to-purple-500/10 dark:from-violet-500/30 dark:to-purple-500/15",
    colorClass: "text-violet-600 dark:text-violet-400 border-violet-500/30",
  },
  {
    id: "subscriptions",
    name: "Recurring Subscriptions",
    shortName: "Subscriptions",
    tagline: "Active Bills & Renewals",
    url: "/app/subscriptions",
    description:
      "Manage streaming, cloud, and monthly services with renewal alerts, yearly spend projections, and cycle tags.",
    icon: CalendarSync,
    badge: "Recurring",
    gradient: "from-rose-500/20 to-pink-500/10 dark:from-rose-500/30 dark:to-pink-500/15",
    colorClass: "text-rose-600 dark:text-rose-400 border-rose-500/30",
  },
  {
    id: "passwords",
    name: "Password Manager & Vault",
    shortName: "Vault",
    tagline: "Zero-Knowledge Credentials",
    url: "/app/passwords",
    description:
      "Encrypted vault for logins, financial pins, security notes, and credential generators with security scores.",
    icon: KeyRound,
    badge: "Encrypted",
    gradient: "from-indigo-500/20 to-blue-500/10 dark:from-indigo-500/30 dark:to-blue-500/15",
    colorClass: "text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  },
];

interface AppSettingsState {
  defaultModule: AppModuleId;
  hasHydrated: boolean;
  setDefaultModule: (module: AppModuleId) => void;
  setHasHydrated: (state: boolean) => void;
  resetSettings: () => void;
}

export const useAppSettings = create<AppSettingsState>()(
  persist(
    (set) => ({
      defaultModule: "dashboard",
      hasHydrated: false,
      setDefaultModule: (module: AppModuleId) => {
        set({ defaultModule: module });
      },
      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
      resetSettings: () => {
        set({ defaultModule: "dashboard" });
      },
    }),
    {
      name: "toolcity_app_settings",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function getModuleConfig(id: AppModuleId): AppModuleConfig {
  const found = APP_MODULES.find((m) => m.id === id);
  return found || APP_MODULES[0];
}
