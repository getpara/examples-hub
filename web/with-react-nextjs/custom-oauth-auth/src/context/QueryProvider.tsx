"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => queryClient);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}