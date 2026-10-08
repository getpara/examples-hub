"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Environment, ParaProvider as ParaSDKProvider } from "@getpara/react-sdk-lite";
import { PARA_API_KEY, PARA_ENVIRONMENT_NAME } from "@/lib/environment";

const ENVIRONMENT = PARA_ENVIRONMENT_NAME as Environment;

if (!PARA_API_KEY) {
  console.warn("NEXT_PUBLIC_PARA_API_KEY is not set. Para authentication will not work.");
}

const queryClient = new QueryClient();

export function ParaProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
        paraClientConfig={{
          apiKey: PARA_API_KEY,
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
