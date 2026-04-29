"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ParaWeb, { Environment, ParaProvider as ParaSDKProvider } from "@getpara/react-sdk";
import { fetchPregenWalletsOverride } from "@/lib/para/fetchPregenWalletsOverride";
import "@getpara/react-sdk/styles.css";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY) {
  throw new Error("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

const queryClient = new QueryClient();

export function ParaProvider({ children }: { children: React.ReactNode }) {
  const [para, setPara] = useState<ParaWeb | null>(null);

  useEffect(() => {
    setPara(
      new ParaWeb(ENVIRONMENT, API_KEY, {
        fetchPregenWalletsOverride,
      }),
    );
  }, []);

  if (!para) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
        paraClientConfig={para}
        config={{ appName: "Para Pregen Claim" }}
        paraModalConfig={{
          disableEmailLogin: false,
          disablePhoneLogin: false,
          authLayout: ["AUTH:FULL", "EXTERNAL:FULL"],
          oAuthMethods: ["APPLE", "DISCORD", "FACEBOOK", "FARCASTER", "GOOGLE", "TWITTER"],
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
