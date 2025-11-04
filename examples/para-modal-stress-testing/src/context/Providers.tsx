'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParaProvider as ParaSDKProvider } from '@getpara/react-sdk';
import { API_KEY } from '@/config/constants';

const queryClient = new QueryClient();

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
        paraClientConfig={{
          apiKey: API_KEY,
        }}
        config={{ appName: 'Para Modal Example' }}
        paraModalConfig={{
          disableEmailLogin: false,
          disablePhoneLogin: false,
          authLayout: ['AUTH:FULL'],
          oAuthMethods: [],
          onRampTestMode: true,
          theme: {
            foregroundColor: '#222222',
            backgroundColor: '#FFFFFF',
            accentColor: '#888888',
            darkForegroundColor: '#EEEEEE',
            darkBackgroundColor: '#111111',
            darkAccentColor: '#AAAAAA',
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
