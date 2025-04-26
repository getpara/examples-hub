"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthLayout, OAuthMethod, ParaModal, ParaProvider } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "@/constants";

const queryClient = new QueryClient();

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          apiKey: API_KEY,
          env: ENVIRONMENT,
        }}>
        {children}
        <ParaModal
          disableEmailLogin={false}
          disablePhoneLogin={true}
          authLayout={[AuthLayout.AUTH_FULL]}
          oAuthMethods={[OAuthMethod.TWITTER]}
          onRampTestMode={true}
          theme={{
            foregroundColor: "#2D3648",
            backgroundColor: "#FFFFFF",
            accentColor: "#0066CC",
            darkForegroundColor: "#E8EBF2",
            darkBackgroundColor: "#1A1F2B",
            darkAccentColor: "#4D9FFF",
            mode: "light",
            borderRadius: "none",
            font: "Inter",
          }}
          appName="Para Pregen Example"
          logo="/para.svg"
          recoverySecretStepEnabled={true}
          twoFactorAuthEnabled={false}
        />
      </ParaProvider>
    </QueryClientProvider>
  );
}
