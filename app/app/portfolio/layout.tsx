"use client";

import { useEffect, useState } from "react";
import { usePortfolioStore } from "@/hooks/use-portfolio-store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ModuleSkeleton } from "@/components/module-skeleton";
import { Plus, Minus } from "lucide-react";
import {
  AddEditInvestmentDialog,
  AddEditDebtDialog,
} from "@/components/portfolio/add-edit-dialogs";
import {
  FinancePageHeader,
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
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto p-4 lg:gap-6 lg:p-8">
      <FinancePageHeader
        title="Investments"
        subtitle="Net worth, assets, and liabilities in one place"
        actions={
          !loading && !error ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAddDebtOpen(true)}
                className="h-10 gap-1.5 rounded-full border-rose-500/30 bg-rose-500/10 px-4 text-rose-700 hover:bg-rose-500/15 dark:text-rose-400"
              >
                <Minus className="size-4" />
                Add debt
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAddInvOpen(true)}
                className="h-10 gap-1.5 rounded-full border-emerald-500/30 bg-emerald-500/10 px-4 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400"
              >
                <Plus className="size-4" />
                Add asset
              </Button>
            </>
          ) : undefined
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex min-h-0 w-full flex-1 flex-col"
      >
        <TabsList className={tabListClassName()}>
          <TabsTrigger value="overview" className={tabTriggerClassName()}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="investments" className={tabTriggerClassName()}>
            Assets
          </TabsTrigger>
          <TabsTrigger value="debts" className={tabTriggerClassName()}>
            Debts
          </TabsTrigger>
        </TabsList>

        <div className="mt-5 min-h-[400px] flex-1">
          {loading ? (
            <ModuleSkeleton />
          ) : error ? (
            <div className="flex h-[320px] w-full items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 text-sm font-medium text-destructive">
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
