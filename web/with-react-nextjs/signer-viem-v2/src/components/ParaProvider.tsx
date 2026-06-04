'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParaProvider as ParaSDKProvider } from '@getpara/react-sdk';
import { sepolia } from 'wagmi/chains';
import { API_KEY, ENVIRONMENT } from '@/config/constants';
import '@getpara/react-sdk/styles.css';

if (!API_KEY) {
  console.warn('NEXT_PUBLIC_PARA_API_KEY is not set. Para authentication will not work.');
}

const queryClient = new QueryClient();

export function ParaProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
        paraClientConfig={{
          apiKey: API_KEY,
          env: ENVIRONMENT,
        }}
        externalWalletConfig={{
          evmConnector: {
            config: {
              chains: [sepolia],
            },
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
