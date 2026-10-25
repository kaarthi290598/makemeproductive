"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Dashboard from "@/components/dashboard/dashboard";
import { useAppSettings, getModuleConfig } from "@/hooks/use-app-settings";
import { Sparkles, ArrowRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { defaultModule, hasHydrated } = useAppSettings();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const isExplicitDashboard = searchParams?.get("view") === "dashboard";

  useEffect(() => {
    // Only perform default module redirect if store is hydrated and not explicitly requested
    if (hasHydrated && defaultModule !== "dashboard" && !isExplicitDashboard) {
      const targetConfig = getModuleConfig(defaultModule);
      setIsRedirecting(true);
      router.replace(targetConfig.url);
    }
  }, [hasHydrated, defaultModule, isExplicitDashboard, router]);

  if (isRedirecting) {
    const targetConfig = getModuleConfig(defaultModule);
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 animate-pulse">
          <targetConfig.icon className="size-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Opening your default workspace: {targetConfig.name}...
          </p>
          <p className="text-xs text-slate-400">Redirecting to {targetConfig.shortName}</p>
        </div>
      </div>
    );
  }

  const moduleConfig = getModuleConfig(defaultModule);

  return (
    <div className="min-h-0 min-w-0 w-full p-4 sm:p-6 lg:p-8">
      {/* Informative banner if user has non-dashboard default module */}
      {defaultModule !== "dashboard" && isExplicitDashboard && (
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-900 dark:text-emerald-200 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-emerald-600 shrink-0 dark:text-emerald-400" />
            <span>
              Your startup module is set to <strong>{moduleConfig.name}</strong>.
            </span>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Link
              href={moduleConfig.url}
              className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline dark:text-emerald-300"
            >
              <span>Go to {moduleConfig.shortName}</span>
              <ArrowRight className="size-3" />
            </Link>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <Link
              href="/app/settings"
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <Settings className="size-3" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      )}

      <Dashboard />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-0 min-w-0 w-full p-4 sm:p-6 lg:p-8">
          <Dashboard />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
