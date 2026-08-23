"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

const ExpenseTabReadyContext = createContext<{
  setTabReady: (ready: boolean) => void;
} | null>(null);

export function ExpenseTabReadyProvider({
  children,
  onReadyChange,
}: {
  children: React.ReactNode;
  onReadyChange: (ready: boolean) => void;
}) {
  const setTabReady = useCallback(
    (ready: boolean) => {
      onReadyChange(ready);
    },
    [onReadyChange],
  );

  const value = useMemo(() => ({ setTabReady }), [setTabReady]);

  return (
    <ExpenseTabReadyContext.Provider value={value}>
      {children}
    </ExpenseTabReadyContext.Provider>
  );
}

export function useReportTabReady(isReady: boolean) {
  const ctx = useContext(ExpenseTabReadyContext);

  useEffect(() => {
    if (!ctx) return;
    ctx.setTabReady(isReady);
  }, [ctx, isReady]);
}

/** Marks the tab ready after the first successful load, so later filter refetches keep in-page skeletons. */
export function useReportTabReadyAfterFirstLoad(isLoading: boolean) {
  const hasLoaded = useRef(!isLoading);
  if (!isLoading) hasLoaded.current = true;
  useReportTabReady(hasLoaded.current);
}
