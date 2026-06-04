'use client';

import { ParaProvider as ParaSDKProvider } from '@getpara/react-sdk';
import { API_KEY, ENVIRONMENT } from '@/config/constants';

export function ParaProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
  );
}
