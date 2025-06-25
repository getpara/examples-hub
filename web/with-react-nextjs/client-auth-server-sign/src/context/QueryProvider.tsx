"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a single shared QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    },
  },
});

export function QueryProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
