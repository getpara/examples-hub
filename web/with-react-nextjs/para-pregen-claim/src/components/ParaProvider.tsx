"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Environment, ParaProvider as ParaSDKProvider, type PregenAuth } from "@getpara/react-sdk-lite";
import type { GetWalletShareResponse } from "@/lib/pregenWalletApi";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY) {
  console.warn("NEXT_PUBLIC_PARA_API_KEY is not set. Para authentication will not work.");
}

const queryClient = new QueryClient();

async function fetchPregenWalletsOverride({ pregenId }: { pregenId: PregenAuth }) {
  const email = "email" in pregenId ? pregenId.email : null;

  if (!email) {
    return { userShare: undefined };
  }

  try {
    const response = await fetch("/api/wallet/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data: GetWalletShareResponse = await response.json();

    if (data.success && data.userShare) {
      return { userShare: data.userShare };
    }
  } catch {
    return { userShare: undefined };
  }

  return { userShare: undefined };
}

export function ParaProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
        paraClientConfig={{
          apiKey: API_KEY,
          env: ENVIRONMENT,
          opts: {
            fetchPregenWalletsOverride,
          },
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
