'use client';

import { useEffect, useState } from 'react';
import { para } from '@/lib/para/client';
import { ParaProvider as ParaSDKProvider } from '@getpara/react-sdk';

export function ParaProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Initialize required storage keys to prevent SDK errors
        const requiredKeys = ['@CAPSULE/wallets', '@CAPSULE/ed25519Wallets'];

        const localResult = await chrome.storage.local.get(requiredKeys);
        const updates: Record<string, string> = {};

        for (const key of requiredKeys) {
          if (!(key in localResult) || localResult[key] === null || localResult[key] === undefined) {
            updates[key] = '{}';
          }
        }

        if (Object.keys(updates).length > 0) {
          await chrome.storage.local.set(updates);
        }
      } catch (error) {
        console.error('[ParaProvider] Error initializing storage:', error);
      } finally {
        setIsReady(true);
      }
    };

    initializeStorage();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <ParaSDKProvider
      paraClientConfig={para}
      paraModalConfig={{
        onRampTestMode: true,
        recoverySecretStepEnabled: true,
      }}
    >
      {children}
    </ParaSDKProvider>
  );
}
