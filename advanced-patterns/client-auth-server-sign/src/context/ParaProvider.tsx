"use client";

import { ParaProvider as ParaSDKProvider } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "@/config/constants";

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
      config={{ appName: "Para Modal Example" }}
      paraModalConfig={{
        disableEmailLogin: false,
        disablePhoneLogin: false,
        authLayout: ["AUTH:FULL", "EXTERNAL:FULL"],
        oAuthMethods: ["APPLE", "DISCORD", "FACEBOOK", "FARCASTER", "GOOGLE", "TWITTER"],
        onRampTestMode: true,
        theme: {
          backgroundColor: "#FFFFFF",
          foregroundColor: "#888888",
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
  );
}
