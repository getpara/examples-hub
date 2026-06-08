'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParaProvider as ParaSDKProvider } from '@getpara/react-sdk-lite';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import type { ComponentProps } from 'react';
import { API_KEY, ENVIRONMENT } from '@/config/constants';

const solanaNetwork = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(solanaNetwork);
type SolanaConnectorConfig = NonNullable<
  NonNullable<ComponentProps<typeof ParaSDKProvider>['externalWalletConfig']>['solanaConnector']
>['config'];
const solanaConnectorConfig = {
  endpoint,
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

if (!API_KEY) {
  console.warn('NEXT_PUBLIC_PARA_API_KEY is not set. Para authentication will not work.');
}

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
