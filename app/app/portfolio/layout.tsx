"use client";

import React, { useEffect, useState } from "react";
import { usePortfolioStore } from "@/hooks/use-portfolio-store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ModuleSkeleton } from "@/components/module-skeleton";
import { PlusCircle, MinusCircle } from "lucide-react";
import { AddEditInvestmentDialog, AddEditDebtDialog } from "@/components/portfolio/add-edit-dialogs";

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initialize, loading, error } = usePortfolioStore();
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
    <div className="flex h-full w-full flex-col gap-4 overflow-y-auto p-3 lg:gap-6 lg:p-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">
            Portfolio & Net Worth
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground lg:text-sm">
            Track assets, coordinate debt payoff, and analyze net worth in real-time
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {!loading && !error && (
            <>
              <Button
                size="sm"
                onClick={() => setAddInvOpen(true)}
                className="h-9 gap-1.5 rounded-lg bg-emerald-600 px-3 hover:bg-emerald-700 text-white"
              >
                <PlusCircle className="size-4" />
                <span>Add Investment</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setAddDebtOpen(true)}
                className="h-9 gap-1.5 rounded-lg bg-destructive px-3 hover:bg-destructive/90 text-white"
              >
                <MinusCircle className="size-4" />
                <span>Add Liability</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs list */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full space-y-4"
      >
        <TabsList className="bg-muted/50 p-1 rounded-xl h-10 w-full sm:w-auto sm:inline-flex flex">
          <TabsTrigger
            value="overview"
            className="rounded-lg px-4 py-1.5 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="investments"
            className="rounded-lg px-4 py-1.5 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none"
          >
            Investments
          </TabsTrigger>
          <TabsTrigger
            value="debts"
            className="rounded-lg px-4 py-1.5 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-none"
          >
            Debts
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 min-h-[400px]">
          {loading ? (
            <div className="w-full">
              <ModuleSkeleton />
            </div>
          ) : error ? (
            <div className="flex h-[400px] w-full items-center justify-center text-destructive font-medium">
              Error: {error}
            </div>
          ) : (
            children
          )}
        </div>
      </Tabs>

      {/* Add Dialogs */}
      <AddEditInvestmentDialog open={addInvOpen} setOpen={setAddInvOpen} />
      <AddEditDebtDialog open={addDebtOpen} setOpen={setAddDebtOpen} />
    </div>
  );
}
