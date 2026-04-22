"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ParaWeb, { Environment, ParaProvider as ParaSDKProvider } from "@getpara/react-sdk";

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
        config={{ appName: "Signer Canton Network Example" }}
        paraModalConfig={{
          disableEmailLogin: false,
          disablePhoneLogin: false,
          authLayout: ["AUTH:FULL"],
          oAuthMethods: ["GOOGLE", "TWITTER", "APPLE", "DISCORD", "FACEBOOK", "FARCASTER"],
          onRampTestMode: true,
          theme: {
            foregroundColor: "#2E2926",
            backgroundColor: "#FFFFFF",
            accentColor: "#E8642B",
            mode: "light",
            borderRadius: "md",
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
