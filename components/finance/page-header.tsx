import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ConsoleHeader({
  icon,
  title,
  subtitle,
  actions,
}: {
  icon?: ReactNode;
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center gap-2">
          {icon}
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-xl">
            {title}
          </h1>
        </div>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function FinancePageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return <ConsoleHeader title={title} subtitle={subtitle} actions={actions} />;
}

export function tabListClassName(className?: string) {
  return cn(
    "h-auto w-max max-w-full justify-start gap-1 overflow-x-auto rounded-xl border border-slate-200/60 bg-slate-100 p-1 dark:border-slate-700/60 dark:bg-slate-800 sm:gap-1.5",
    className,
  );
}

export function tabTriggerClassName(className?: string) {
  return cn(
    "h-auto shrink-0 gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-600 shadow-none sm:gap-1.5 sm:px-3.5 sm:text-xs dark:text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white",
    className,
  );
}

export const primaryActionClass =
  "h-10 gap-1.5 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-500";

export const dangerActionClass =
  "h-10 gap-1.5 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-sm shadow-rose-600/20 hover:bg-rose-500";

export const toolbarInputClass =
  "h-9 rounded-lg border-slate-200 bg-slate-50 pl-9 text-sm shadow-none dark:border-slate-700 dark:bg-slate-900";

export const toolbarSelectClass =
  "h-9 rounded-lg border-slate-200 bg-white text-xs font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900";

export const surfaceCardClass =
  "overflow-hidden rounded-xl border-slate-200 shadow-sm dark:border-slate-800";

export const consoleDialogClass =
  "flex max-h-[min(92dvh,40rem)] w-[min(calc(100vw-1rem),40rem)] max-w-none flex-col gap-0 overflow-y-auto overflow-x-hidden rounded-2xl border-slate-200/80 p-0 shadow-2xl dark:border-slate-800 sm:max-w-[40rem]";

export const consoleDialogFormClass =
  "flex h-auto w-full flex-col overflow-visible";

export const consoleDialogBodyClass =
  "grid grid-cols-1 items-start gap-3 px-4 py-3 sm:grid-cols-2 sm:gap-4 sm:px-5 sm:py-3.5";

