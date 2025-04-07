"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthLayout, OAuthMethod, ParaProvider } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "@/constants";

const queryClient = new QueryClient();

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          apiKey: API_KEY,
          env: ENVIRONMENT,
        }}>
        {children}
      </ParaProvider>
    </QueryClientProvider>
  );
}
