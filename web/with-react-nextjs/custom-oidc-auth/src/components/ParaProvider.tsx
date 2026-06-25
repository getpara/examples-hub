"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider as ParaSDKProvider } from "@getpara/react-sdk";
import { PARA_API_KEY, PARA_ENVIRONMENT } from "@/lib/para";

if (!PARA_API_KEY) {
  console.warn("NEXT_PUBLIC_PARA_API_KEY is not set. Para authentication will not work.");
}

const queryClient = new QueryClient();

// Embedded-only OIDC demo: no externalWalletConfig — the ethers signer is backed by
// the user's Para MPC wallet, not an external connector.
export function ParaProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
        paraClientConfig={{
          apiKey: PARA_API_KEY,
          env: PARA_ENVIRONMENT,
        }}>
        {children}
      </ParaSDKProvider>
    </QueryClientProvider>
  );
}
