'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParaProvider as ParaSDKProvider } from '@getpara/react-sdk';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import type { ComponentProps } from 'react';
import { API_KEY, DEVNET_RPC_URL, ENVIRONMENT } from '@/config/constants';

// Solana network configuration
const solanaNetwork = WalletAdapterNetwork.Devnet;
type SolanaConnectorConfig = NonNullable<
  NonNullable<ComponentProps<typeof ParaSDKProvider>['externalWalletConfig']>['solanaConnector']
>['config'];
const solanaConnectorConfig = {
  endpoint: DEVNET_RPC_URL,
  chain: solanaNetwork,
} as unknown as SolanaConnectorConfig;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

export function ParaProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
        paraClientConfig={{
          apiKey: API_KEY,
          env: ENVIRONMENT,
        }}
        externalWalletConfig={{
          solanaConnector: {
            config: solanaConnectorConfig,
          },
        }}
        paraModalConfig={{
          onRampTestMode: true,
          recoverySecretStepEnabled: true,
        }}
      >
        {children}
      </ParaSDKProvider>
    </QueryClientProvider>
  );
}
