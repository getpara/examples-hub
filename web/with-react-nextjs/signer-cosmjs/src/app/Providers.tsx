"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ParaProvider } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "@/config/constants";
import Header from "@/components/layout/Header";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          apiKey: API_KEY!,
          env: ENVIRONMENT,
        }}
        config={{
          appName: "Para + CosmJS Demo",
        }}>
        <Header />
        <main className="min-h-screen">{children}</main>
      </ParaProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}