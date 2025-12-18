"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Environment,
  ParaProvider as ParaSDKProvider,
} from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
const ENVIRONMENT =
  (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY) {
  throw new Error(
    "NEXT_PUBLIC_PARA_API_KEY is not defined. Please set it in your .env file."
  );
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
      </ParaSDKProvider>
    </QueryClientProvider>
  );
}
