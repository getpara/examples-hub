"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";
import React, { type ReactNode } from "react";

// Set up queryClient
const queryClient = new QueryClient();

function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          apiKey: process.env.NEXT_PUBLIC_PARA_API_KEY as string,
          env: "BETA" as any,
        }}
        config={{
          appName: "Global Wallet Demo",
        }}
        paraModalConfig={{
          disableEmailLogin: false,
          disablePhoneLogin: true,
          authLayout: ["AUTH:FULL"],
          oAuthMethods: [],
          onRampTestMode: true,
          theme: {
            foregroundColor: "#2D3648",
            backgroundColor: "#FFFFFF",
            accentColor: "#0066CC",
            darkForegroundColor: "#E8EBF2",
            darkBackgroundColor: "#1A1F2B",
            darkAccentColor: "#4D9FFF",
            mode: "light",
            borderRadius: "lg",
            font: "Inter",
          },
          recoverySecretStepEnabled: true,
          twoFactorAuthEnabled: false,
        }}
      >
        {children}
      </ParaProvider>
    </QueryClientProvider>
  );
}

export default ContextProvider;
