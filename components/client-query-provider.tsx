"use client";

import React, { useEffect, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import * as idbKeyval from "idb-keyval";

const asyncStoragePersister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => {
      if (typeof window === "undefined") return null;
      return await idbKeyval.get(key);
    },
    setItem: async (key, value) => {
      if (typeof window === "undefined") return;
      await idbKeyval.set(key, value);
    },
    removeItem: async (key) => {
      if (typeof window === "undefined") return;
      await idbKeyval.del(key);
    },
  },
});

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function ClientQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(makeQueryClient);

  useEffect(() => {
    // Remove the legacy browser-wide credit due snapshot now that the module
    // fetches user-scoped data from the server on entry.
    try {
      window.localStorage.removeItem("credit-dues-store");
    } catch {
      // The store no longer reads this key; continue if browser storage is blocked.
    }

    const invalidateDashboard = () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    };
    window.addEventListener("credit-dues:updated", invalidateDashboard);
    return () => window.removeEventListener("credit-dues:updated", invalidateDashboard);
  }, [queryClient]);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
