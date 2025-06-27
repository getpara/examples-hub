"use client";

import { ParaProvider as ParaProviderBase } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "@/config/constants";

export function ParaProvider({ children }: { children: React.ReactNode }) {
  const fetchPregenWalletsOverride = async (opts: { pregenId: any }) => {
    // Check if we have a stored pregen UUID from step 1
    const storedUuid = typeof window !== 'undefined' ? localStorage.getItem('pregenUuid') : null;
    
    if (!storedUuid) {
      return { userShare: undefined };
    }

    try {
      // Fetch the wallet data from our API
      const response = await fetch(`/api/wallet/${storedUuid}`);
      const data = await response.json();
      
      if (data.success && data.userShare) {
        // Clear the UUID after successful fetch
        localStorage.removeItem('pregenUuid');
        return { userShare: data.userShare };
      }
    } catch (error) {
      console.error('Failed to fetch pregen wallet:', error);
    }
    
    return { userShare: undefined };
  };

  return (
    <ParaProviderBase
      paraClientConfig={{
        apiKey: API_KEY,
        env: ENVIRONMENT,
        opts: {
          fetchPregenWalletsOverride,
        },
      }}
     config={{ appName: "Para Pregen Claim" }}
      paraModalConfig={{
        disableEmailLogin: false,
        disablePhoneLogin: false,
        authLayout: ["AUTH:FULL", "EXTERNAL:FULL"],
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
