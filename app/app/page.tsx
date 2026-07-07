"use client";

import Dashboard from "@/components/dashboard/dashboard";

export default function DashboardPage() {
  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-y-auto p-3 lg:gap-6 lg:p-6">
      <Dashboard />
    </div>
  );
}
