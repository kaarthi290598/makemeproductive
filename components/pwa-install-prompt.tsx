"use client";

import React, { useState, useEffect } from "react";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("pwa-prompt-dismissed");
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300 md:bottom-6 md:right-6 md:left-auto">
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-xl dark:border-emerald-500/30 dark:bg-slate-950/95">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-2 text-white shadow-md shadow-emerald-600/20">
          <Smartphone className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-slate-100">Install ToolCity App</h4>
          <p className="truncate text-[11px] text-slate-400">
            Fast access right from your home screen
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            size="sm"
            onClick={() => promptInstall()}
            className="h-8 gap-1 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white shadow-sm shadow-emerald-600/25 hover:bg-emerald-500 active:scale-95"
          >
            <Download className="size-3.5" />
            <span>Install</span>
          </Button>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
