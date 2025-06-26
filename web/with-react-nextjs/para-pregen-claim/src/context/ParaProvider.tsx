"use client";

import { ParaProvider as ParaProviderBase } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "@/config/constants";

export function ParaProvider({ children }: { children: React.ReactNode }) {
  return (
    <ParaProviderBase
      paraClientConfig={{
        apiKey: API_KEY,
        env: ENVIRONMENT,
      }}
      config={{ appName: "Para Pregen Claim" }}
      paraModalConfig={{
        disableEmailLogin: false,
        disablePhoneLogin: false,
        authLayout: ["EXTERNAL:FULL"],
        oAuthMethods: ["APPLE", "DISCORD", "FACEBOOK", "FARCASTER", "GOOGLE", "TWITTER"],
        onRampTestMode: true,
        theme: {
          foregroundColor: "#222222",
          backgroundColor: "#FFFFFF",
          accentColor: "#888888",
          darkForegroundColor: "#EEEEEE",
          darkBackgroundColor: "#111111",
          darkAccentColor: "#AAAAAA",
          mode: "light",
          borderRadius: "none",
          font: "Inter",
        },
        logo: "/para.svg",
        recoverySecretStepEnabled: true,
        twoFactorAuthEnabled: false,
      }}>
      {children}
    </ParaProviderBase>
  );
}