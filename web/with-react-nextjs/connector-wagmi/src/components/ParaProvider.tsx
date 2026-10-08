"use client";

import { ParaWeb } from "@getpara/react-sdk-lite";
import { paraConnector } from "@getpara/wagmi-v2-integration";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cookieStorage, createConfig, createStorage, http, WagmiProvider, type CreateConfigParameters } from "wagmi";
import { sepolia } from "wagmi/chains";
import { SEPOLIA } from "@/lib/chain";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";

if (!API_KEY) {
  console.warn("NEXT_PUBLIC_PARA_API_KEY is not set. Para authentication will not work.");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    },
  },
});

const para = typeof window !== "undefined" && API_KEY ? new ParaWeb(API_KEY) : null;

const connector = para
  ? paraConnector({
      appName: "Para Wagmi Example",
      chains: [sepolia],
      onRampTestMode: true,
      options: {},
      para,
      queryClient,
      recoverySecretStepEnabled: true,
    })
  : null;

const config = {
  chains: [sepolia],
  connectors: connector ? [connector] : [],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [sepolia.id]: http(SEPOLIA.rpcUrl),
  },
} as CreateConfigParameters;

const wagmiConfig = createConfig(config);

export function ParaProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
