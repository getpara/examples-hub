"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Environment, ParaProvider as ParaSDKProvider } from "@getpara/react-sdk";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY && typeof window !== "undefined") {
  throw new Error("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    },
  },
});

export function ParaProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
        paraClientConfig={{
          apiKey: API_KEY,
          env: ENVIRONMENT,
        }}
        paraModalConfig={{
          onRampTestMode: true,
          recoverySecretStepEnabled: true,
        }}>
        {children}
      </ParaSDKProvider>
    </QueryClientProvider>
  );
}
