"use client";

import { ParaProvider as ParaSDKProvider, AuthLayout, OAuthMethod } from "@getpara/react-sdk";
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
      config={{ appName: "Squid Router Integration" }}
      paraModalConfig={{
        disableEmailLogin: false,
        disablePhoneLogin: false,
        authLayout: [AuthLayout.AUTH_FULL],
        oAuthMethods: [
          OAuthMethod.APPLE,
          OAuthMethod.DISCORD,
          OAuthMethod.FACEBOOK,
          OAuthMethod.FARCASTER,
          OAuthMethod.GOOGLE,
          OAuthMethod.TWITTER,
        ],
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