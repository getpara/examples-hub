'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Environment, ParaProvider as ParaSDKProvider } from '@getpara/react-sdk-lite';

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? '';
const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

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
