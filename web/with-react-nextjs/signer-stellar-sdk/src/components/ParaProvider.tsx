'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParaProvider as ParaSDKProvider } from '@getpara/react-sdk';
import { API_KEY, ENVIRONMENT } from '@/config/constants';

const queryClient = new QueryClient();

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
