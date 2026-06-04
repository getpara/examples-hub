'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ParaWeb, { Environment, ParaProvider as ParaSDKProvider } from '@getpara/react-sdk';
import { fetchPregenWalletsOverride } from '@/lib/para/fetchPregenWalletsOverride';
import '@getpara/react-sdk/styles.css';

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? '';
const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY) {
  console.warn('NEXT_PUBLIC_PARA_API_KEY is not set. Para authentication will not work.');
}

const queryClient = new QueryClient();

export function ParaProvider({ children }: { children: React.ReactNode }) {
  const [para, setPara] = useState<ParaWeb | null>(null);

  useEffect(() => {
    setPara(
      new ParaWeb(ENVIRONMENT, API_KEY, {
        fetchPregenWalletsOverride,
      }),
    );
  }, []);

  if (!para) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
        paraClientConfig={para}
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
