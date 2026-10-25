import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-4 w-72 rounded-lg" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-96 rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  );
}
