"use client";

import Dashboard from "@/components/dashboard/dashboard";

export default function DashboardPage() {
  return (
    <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-y-auto px-3 pb-[max(2.75rem,calc(env(safe-area-inset-bottom)+1.5rem))] pt-3 sm:px-4 sm:pb-10 sm:pt-4 lg:p-8">
      <Dashboard />
    </div>
  );
}
