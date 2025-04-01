"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthLayout, OAuthMethod, ParaProvider } from "@getpara/react-sdk";
import { para } from "@/client/para";
import { ParaSignerProvider } from "@/components/ParaSignerProvider";

const queryClient = new QueryClient();

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={para}
        config={{ appName: "Para Modal Example" }}
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
            foregroundColor: "#2D3648",
            backgroundColor: "#FFFFFF",
            accentColor: "#0066CC",
            darkForegroundColor: "#E8EBF2",
            darkBackgroundColor: "#1A1F2B",
            darkAccentColor: "#4D9FFF",
            mode: "light",
            borderRadius: "none",
            font: "Inter",
          },
          logo: "/para.svg",
          recoverySecretStepEnabled: true,
          twoFactorAuthEnabled: false,
        }}
      >
        <ParaSignerProvider>{children}</ParaSignerProvider>
      </ParaProvider>
    </QueryClientProvider>
  );
}
