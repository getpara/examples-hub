'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParaProvider as ParaSDKProvider, Environment } from '@getpara/react-sdk';
import { fetchPregenWalletsOverride } from '@/lib/para/fetchPregenWalletsOverride';

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? '';

if (!API_KEY) {
  throw new Error('API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.');
}

const queryClient = new QueryClient();

export function ParaProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
        paraClientConfig={{
          env: Environment.BETA,
          apiKey: API_KEY,
          opts: {
            fetchPregenWalletsOverride: fetchPregenWalletsOverride,
          },
        }}
        config={{ appName: 'Para Pregen Claim' }}
        paraModalConfig={{
          disableEmailLogin: false,
          disablePhoneLogin: false,
          authLayout: ['AUTH:FULL', 'EXTERNAL:FULL'],
          oAuthMethods: ['APPLE', 'DISCORD', 'FACEBOOK', 'FARCASTER', 'GOOGLE', 'TWITTER'],
          onRampTestMode: true,
          theme: {
            foregroundColor: '#222222',
            backgroundColor: '#FFFFFF',
            accentColor: '#888888',
            mode: 'light',
            borderRadius: 'none',
            font: 'Inter',
          },
          logo: '/para.svg',
          recoverySecretStepEnabled: true,
          twoFactorAuthEnabled: false,
        }}
      >
        {children}
      </ParaSDKProvider>
    </QueryClientProvider>
  );
}
