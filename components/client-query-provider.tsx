"use client";

import React, { useState } from "react";
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

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
