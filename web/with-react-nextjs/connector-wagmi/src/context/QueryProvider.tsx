"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
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
