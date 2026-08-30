"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, Check, ArrowDown, Sparkles } from "lucide-react";
import { useExpenseStore } from "@/hooks/use-expense-store";
import { usePortfolioStore } from "@/hooks/use-portfolio-store";
import { useCreditDuesStore } from "@/hooks/use-credit-dues-store";
import { useSubscriptionsStore } from "@/hooks/use-subscriptions-store";
import { usePasswordsStore } from "@/hooks/use-passwords-store";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  children: React.ReactNode;
  className?: string;
}

const PULL_THRESHOLD = 75; // px needed to trigger refresh
const MAX_PULL = 120; // maximum pull height cap
const RESISTANCE = 0.45; // drag resistance factor

export function PullToRefresh({ children, className }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [status, setStatus] = useState<"idle" | "pulling" | "ready" | "refreshing" | "success">("idle");
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);
  const hasTriggeredHaptic = useRef(false);

  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const handleRefreshData = useCallback(async () => {
    setStatus("refreshing");
    try {
      // 1. Invalidate all TanStack Query caches (dashboard, analytics, etc.)
      const queryPromise = queryClient.invalidateQueries();

      // 2. Refresh active module stores based on current path
      const storePromises: Promise<unknown>[] = [];

      if (pathname === "/app" || pathname === "/app/") {
        storePromises.push(useExpenseStore.getState().initialize({ force: true, quiet: true }));
        storePromises.push(usePortfolioStore.getState().initialize({ force: true }));
        storePromises.push(useCreditDuesStore.getState().loadCreditDues());
        storePromises.push(useSubscriptionsStore.getState().loadSubscriptions());
      } else if (pathname.startsWith("/app/expense-tracker")) {
        storePromises.push(useExpenseStore.getState().initialize({ force: true, quiet: true }));
      } else if (pathname.startsWith("/app/portfolio")) {
        storePromises.push(usePortfolioStore.getState().initialize({ force: true }));
      } else if (pathname.startsWith("/app/credit-dues")) {
        storePromises.push(useCreditDuesStore.getState().loadCreditDues());
      } else if (pathname.startsWith("/app/subscriptions")) {
        storePromises.push(useSubscriptionsStore.getState().loadSubscriptions());
      } else if (pathname.startsWith("/app/passwords")) {
        storePromises.push(usePasswordsStore.getState().loadPasswords());
      }

      // 3. Server component / RSC route refresh
      router.refresh();

      // Wait for queries and stores with 800ms minimum for clean feedback animation
      await Promise.allSettled([
        queryPromise,
        ...storePromises,
        new Promise((res) => setTimeout(res, 700)),
      ]);

      setStatus("success");

      // Haptic confirmation
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.([15, 40, 20]);
      }

      setTimeout(() => {
        setStatus("idle");
        setPullDistance(0);
      }, 500);
    } catch {
      setStatus("idle");
      setPullDistance(0);
    }
  }, [queryClient, router, pathname]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start pull if at the very top of scroll container
      if (container.scrollTop <= 0 && status === "idle") {
        touchStartY.current = e.touches[0].clientY;
        isDragging.current = true;
        hasTriggeredHaptic.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || status === "refreshing" || status === "success") return;

      const currentY = e.touches[0].clientY;
      const rawDiff = currentY - touchStartY.current;

      // Only pull down when at top
      if (rawDiff > 0 && container.scrollTop <= 0) {
        // Prevent default native scroll bouncy-bar collision
        if (e.cancelable && rawDiff > 10) {
          e.preventDefault();
        }

        const distance = Math.min(MAX_PULL, rawDiff * RESISTANCE);
        setPullDistance(distance);

        if (distance >= PULL_THRESHOLD) {
          setStatus("ready");
          if (!hasTriggeredHaptic.current) {
            hasTriggeredHaptic.current = true;
            if (typeof window !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate?.(12);
            }
          }
        } else {
          setStatus("pulling");
          hasTriggeredHaptic.current = false;
        }
      } else {
        setPullDistance(0);
        setStatus("idle");
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;

      if (pullDistance >= PULL_THRESHOLD && status === "ready") {
        handleRefreshData();
      } else if (status !== "refreshing" && status !== "success") {
        setPullDistance(0);
        setStatus("idle");
      }
    };

    const handleTouchCancel = () => {
      isDragging.current = false;
      if (status !== "refreshing" && status !== "success") {
        setPullDistance(0);
        setStatus("idle");
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [status, pullDistance, handleRefreshData]);

  const progress = Math.min(1, pullDistance / PULL_THRESHOLD);
  const isVisible = pullDistance > 8 || status === "refreshing" || status === "success";

  return (
    <div
      ref={containerRef}
      className={cn("relative min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden", className)}
    >
      {/* Floating Glassmorphic Refresh Indicator */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: 1,
              y: status === "refreshing" || status === "success" ? 16 : pullDistance * 0.75,
            }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.25 } }}
            className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-center pt-2"
          >
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border px-3.5 py-1.5 shadow-xl backdrop-blur-xl transition-all duration-200",
                status === "ready"
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-700 shadow-emerald-500/20 dark:bg-emerald-950/80 dark:text-emerald-300"
                  : status === "refreshing"
                  ? "border-emerald-500/60 bg-white/95 text-emerald-600 shadow-emerald-600/25 dark:bg-slate-900/95 dark:text-emerald-400"
                  : status === "success"
                  ? "border-emerald-500 bg-emerald-600 text-white shadow-emerald-600/30"
                  : "border-slate-200/90 bg-white/90 text-slate-700 shadow-slate-900/10 dark:border-slate-800/80 dark:bg-slate-900/90 dark:text-slate-200"
              )}
            >
              {status === "refreshing" ? (
                <RotateCw className="size-4 animate-spin text-emerald-600 dark:text-emerald-400" />
              ) : status === "success" ? (
                <Check className="size-4 animate-in zoom-in-75 duration-200 text-white" />
              ) : (
                <div
                  className="transition-transform duration-100"
                  style={{
                    transform: `rotate(${progress * 180}deg)`,
                  }}
                >
                  {status === "ready" ? (
                    <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <ArrowDown className="size-4 text-slate-500 dark:text-slate-400" />
                  )}
                </div>
              )}

              <span className="text-xs font-bold tracking-tight">
                {status === "ready"
                  ? "Release to refresh"
                  : status === "refreshing"
                  ? "Refreshing..."
                  : status === "success"
                  ? "Updated!"
                  : "Pull to refresh"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content wrapper with slight spring bounce offset during pull */}
      <div
        className="transition-transform duration-75"
        style={{
          transform:
            status === "refreshing"
              ? "translateY(36px)"
              : pullDistance > 0
              ? `translateY(${pullDistance * 0.35}px)`
              : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
