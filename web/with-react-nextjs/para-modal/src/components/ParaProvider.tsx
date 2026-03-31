"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ParaWeb, { Environment, ParaProvider as ParaSDKProvider } from "@getpara/react-sdk";

// Para API configuration - set these in your .env file
const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY) {
  throw new Error("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

const queryClient = new QueryClient();

const para = new ParaWeb(ENVIRONMENT, API_KEY);

export function ParaProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
        paraClientConfig={para}
        config={{ appName: "Para Modal Example" }}
        paraModalConfig={{
          disableEmailLogin: false,
          disablePhoneLogin: false,
          isGuestModeEnabled: true,
          authLayout: ["AUTH:FULL", "EXTERNAL:FULL"],
          oAuthMethods: ["APPLE", "DISCORD", "FACEBOOK", "FARCASTER", "GOOGLE", "TWITTER"],
          onRampTestMode: true,
          theme: {
            foregroundColor: "#222222",
            backgroundColor: "#FFFFFF",
            accentColor: "#888888",
            mode: "light",
            borderRadius: "none",
            font: "Inter",
          },
          logo: "/para.svg",
          recoverySecretStepEnabled: true,
          twoFactorAuthEnabled: false,
        }}>
        {children}
      </ParaSDKProvider>
    </QueryClientProvider>
  );
}
