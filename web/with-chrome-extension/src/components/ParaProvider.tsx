import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider as ParaSDKProvider } from "@getpara/react-sdk";
import { initializeRequiredStorageKeys } from "@/lib/chromeStorage";
import { para } from "@/lib/para";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    },
  },
});

export function ParaProvider({ children }: { children: ReactNode }) {
  const [isStorageReady, setIsStorageReady] = useState(false);

  useEffect(() => {
    void initializeRequiredStorageKeys().finally(() => setIsStorageReady(true));
  }, []);

  if (!isStorageReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
        paraClientConfig={para}
        paraModalConfig={{
          onRampTestMode: true,
          recoverySecretStepEnabled: true,
        }}>
        {children}
      </ParaSDKProvider>
    </QueryClientProvider>
  );
}
