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
      config={{ appName: "Para Bulk Wallet Generator" }}
      paraModalConfig={{
        disableEmailLogin: false,
        disablePhoneLogin: true,
        authLayout: ["AUTH:FULL"],
        oAuthMethods: ["TWITTER"],
        onRampTestMode: true,
        theme: {
          backgroundColor: "#FFFFFF",
          foregroundColor: "#0066CC",
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