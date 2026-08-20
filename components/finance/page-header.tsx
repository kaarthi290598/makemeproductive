import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FinancePageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-[28px]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function tabListClassName(className?: string) {
  return cn(
    "h-11 w-full rounded-full bg-muted/70 p-1 sm:w-auto sm:inline-flex",
    className,
  );
}

export function tabTriggerClassName(className?: string) {
  return cn(
    "flex-1 rounded-full px-4 py-2 text-xs font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm sm:flex-none",
    className,
  );
}
