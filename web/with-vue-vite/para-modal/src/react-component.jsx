import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthLayout, OAuthMethod, ParaProvider } from "@getpara/react-sdk";
import { para } from "./client/para";
import "@getpara/react-sdk/styles.css";

const queryClient = new QueryClient();

export function ReactComponent({ onClose, isOpen }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={para}
        config={{ appName: "Para Modal Example" }}
        paraModalConfig={{
          isOpen,
          onClose: () => {
            onClose?.();
          },
          logo: "/para.svg",
          disableEmailLogin: false,
          disablePhoneLogin: false,
          authLayout: [AuthLayout.AUTH_FULL],
          oAuthMethods: [
            "APPLE",
            "DISCORD",
            "FACEBOOK",
            "FARCASTER",
            "GOOGLE",
            "TWITTER",
          ],
          onRampTestMode: true,
          recoverySecretStepEnabled: true,
          twoFactorAuthEnabled: false,
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
        }}
      />
    </QueryClientProvider>
  );
}
