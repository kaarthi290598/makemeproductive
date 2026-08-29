"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical,
  Monitor,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PWAInstallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PWAInstallDialog({
  open,
  onOpenChange,
}: PWAInstallDialogProps) {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">(
    "desktop",
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setPlatform("ios");
      } else if (/android/.test(ua)) {
        setPlatform("android");
      } else {
        setPlatform("desktop");
      }
    }
  }, []);

  const handleNativeInstall = async () => {
    const success = await promptInstall();
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-full sm:w-[min(calc(100vw-1.5rem),30rem)] sm:max-w-md max-h-[92dvh] overflow-y-auto rounded-t-3xl rounded-b-none sm:rounded-3xl border-slate-200/90 p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        {/* Header */}
        <div className="relative border-b border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-transparent px-5 py-4 dark:border-emerald-950/60 dark:from-emerald-950/30 sm:px-6">
          <DialogHeader className="space-y-0.5 text-left">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
                <Smartphone className="size-5" />
              </span>
              <div>
                <DialogTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  Install ToolCity App
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Add to home screen for full app experience
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="space-y-4 px-5 py-4 sm:px-6">
          {/* Native Install Button if available */}
          {isInstallable && !isInstalled && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-center">
              <p className="mb-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Direct browser installation ready:
              </p>
              <Button
                onClick={handleNativeInstall}
                className="h-10 w-full gap-2 rounded-xl bg-emerald-600 font-bold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-500"
              >
                <Download className="size-4" />
                <span>Install ToolCity App</span>
              </Button>
            </div>
          )}

          {isInstalled && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>ToolCity is already installed on this device!</span>
            </div>
          )}

          {/* Platform Switcher Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Installation Instructions
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-slate-200/80 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setPlatform("android")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all",
                  platform === "android"
                    ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                )}
              >
                <Smartphone className="size-3.5" />
                <span>Android</span>
              </button>

              <button
                type="button"
                onClick={() => setPlatform("ios")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all",
                  platform === "ios"
                    ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                )}
              >
                <Share className="size-3.5" />
                <span>iPhone</span>
              </button>

              <button
                type="button"
                onClick={() => setPlatform("desktop")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all",
                  platform === "desktop"
                    ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                )}
              >
                <Monitor className="size-3.5" />
                <span>Desktop</span>
              </button>
            </div>
          </div>

          {/* Step by Step Guides */}
          {platform === "android" && (
            <div className="space-y-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                  1
                </span>
                <p>
                  In Chrome, tap the <strong>Menu (⋮)</strong> icon in the top
                  right corner.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                  2
                </span>
                <p>
                  Select <strong>&quot;Install app&quot;</strong> or{" "}
                  <strong>&quot;Add to Home screen&quot;</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                  3
                </span>
                <p>
                  Confirm and launch ToolCity directly from your home screen
                  like a native app!
                </p>
              </div>
            </div>
          )}

          {platform === "ios" && (
            <div className="space-y-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                  1
                </span>
                <p>
                  In Safari, tap the <strong>Share button</strong> (the box with
                  an upward arrow <Share className="inline size-3.5" />) at the
                  bottom.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                  2
                </span>
                <p>
                  Scroll down and tap{" "}
                  <strong>
                    <PlusSquare className="inline size-3.5" /> Add to Home Screen
                  </strong>
                  .
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                  3
                </span>
                <p>
                  Tap <strong>Add</strong> in the top right. ToolCity is now on
                  your home screen!
                </p>
              </div>
            </div>
          )}

          {platform === "desktop" && (
            <div className="space-y-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                  1
                </span>
                <p>
                  In Chrome or Edge, look at the right side of the{" "}
                  <strong>Address Bar</strong> (next to the bookmark star).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                  2
                </span>
                <p>
                  Click the <strong>Install icon (📥 / ⊕)</strong> or open the
                  browser menu (⋮) and select <strong>&quot;Install ToolCity&quot;</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:px-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 w-full rounded-xl text-xs font-bold"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
