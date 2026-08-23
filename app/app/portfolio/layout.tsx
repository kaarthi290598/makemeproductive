"use client";

import { useEffect, useState } from "react";
import { usePortfolioStore } from "@/hooks/use-portfolio-store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ModuleSkeleton } from "@/components/module-skeleton";
import { Plus, Minus, LayoutDashboard, Coins, CreditCard } from "lucide-react";
import {
  AddEditInvestmentDialog,
  AddEditDebtDialog,
} from "@/components/portfolio/add-edit-dialogs";
import {
  tabListClassName,
  tabTriggerClassName,
} from "@/components/finance/page-header";

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialize = usePortfolioStore((s) => s.initialize);
  const loading = usePortfolioStore((s) => s.loading);
  const error = usePortfolioStore((s) => s.error);
  const pathname = usePathname();
  const router = useRouter();

  const [addInvOpen, setAddInvOpen] = useState(false);
  const [addDebtOpen, setAddDebtOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const activeTab = pathname.split("/").pop() || "overview";

  const handleTabChange = (value: string) => {
    router.push(`/app/portfolio/${value}`);
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full flex-col gap-4 overflow-y-auto px-3 pb-[max(2.75rem,calc(env(safe-area-inset-bottom)+1.5rem))] pt-3 sm:gap-5 sm:px-4 sm:pb-10 sm:pt-4 lg:p-8">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex min-h-0 w-full min-w-0 flex-1 flex-col"
      >
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <div className="min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className={tabListClassName()}>
              <TabsTrigger value="overview" className={tabTriggerClassName()}>
                <LayoutDashboard className="h-3.5 w-3.5 text-emerald-600" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="investments" className={tabTriggerClassName()}>
                <Coins className="h-3.5 w-3.5 text-blue-500" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="debts" className={tabTriggerClassName()}>
                <CreditCard className="h-3.5 w-3.5 text-rose-500" />
                Debts
              </TabsTrigger>
            </TabsList>
          </div>

          {!loading && !error && (
            <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
              <Button
                size="sm"
                onClick={() => setAddDebtOpen(true)}
                className="h-9 flex-1 gap-1.5 rounded-xl bg-rose-600 px-3 text-sm font-bold text-white shadow-sm shadow-rose-600/20 hover:bg-rose-500 sm:flex-none sm:px-3.5"
              >
                <Minus className="size-4" />
                <span className="sm:hidden">Debt</span>
                <span className="hidden sm:inline">Add debt</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setAddInvOpen(true)}
                className="h-9 flex-1 gap-1.5 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-500 sm:flex-none sm:px-3.5"
              >
                <Plus className="size-4" />
                <span className="sm:hidden">Asset</span>
                <span className="hidden sm:inline">Add asset</span>
              </Button>
            </div>
          )}
        </div>

        <div className="mt-5 min-h-[400px] flex-1">
          {loading ? (
            <ModuleSkeleton />
          ) : error ? (
            <div className="flex h-[320px] w-full items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </div>
          ) : (
            children
          )}
        </div>
      </Tabs>

      <AddEditInvestmentDialog open={addInvOpen} setOpen={setAddInvOpen} />
      <AddEditDebtDialog open={addDebtOpen} setOpen={setAddDebtOpen} />
    </div>
  );
}
