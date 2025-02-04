"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { ParaModal, AuthLayout, OAuthMethod } from "@getpara/react-sdk";
import { para } from "@/client/para";
import "@getpara/react-sdk/styles.css";

interface ParaContextType {
  isConnected: boolean;
  address: string | null;
  walletId: string | null;
  isLoading: boolean;
  error: string | null;
  sessionStatus: "active" | "expiring" | "expired";
  timeUntilExpiry: number | null;
  openModal: () => void;
  closeModal: () => void;
  refreshAuth: () => Promise<void>;
  handleSessionRefresh: () => Promise<void>;
}

const ParaContext = createContext<ParaContextType | undefined>(undefined);

const SESSION_CHECK_INTERVAL = 60000;
const SESSION_REFRESH_THRESHOLD = 300000;

export function ParaProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<"active" | "expiring" | "expired">("active");
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);

  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const sessionExpiryTimeout = useRef<NodeJS.Timeout | null>(null);

  const getSessionExpiry = async (): Promise<Date | null> => {
    try {
      const sessionCookie = await para.retrieveSessionCookie();
      if (!sessionCookie) return null;

      const expiresMatch = sessionCookie.match(/Expires=([^;]+)/);
      return expiresMatch ? new Date(expiresMatch[1]) : null;
    } catch (err) {
      console.error("Error retrieving session cookie:", err);
      return null;
    }
  };

  const checkAuthentication = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const isAuthenticated = await para.isFullyLoggedIn();
      setIsConnected(isAuthenticated);

      if (isAuthenticated) {
        const wallets = Object.values(await para.getWallets());
        if (wallets?.length) {
          setAddress(wallets[0].address || null);
          setWalletId(wallets[0].id || null);
        }
        setupSessionMonitoring();
      } else {
        clearSessionMonitoring();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
      clearSessionMonitoring();
    }
    setIsLoading(false);
  };

  const setupSessionMonitoring = () => {
    clearSessionMonitoring();

    sessionCheckInterval.current = setInterval(async () => {
      const expiry = await getSessionExpiry();
      if (!expiry) {
        await checkAuthentication();
        return;
      }

      const timeUntilExpiry = expiry.getTime() - Date.now();

      if (timeUntilExpiry <= 0) {
        setIsConnected(false);
        clearSessionMonitoring();
        return;
      }

      setTimeUntilExpiry(timeUntilExpiry);

      if (timeUntilExpiry <= SESSION_REFRESH_THRESHOLD && timeUntilExpiry > 0) {
        setSessionStatus("expiring");
        try {
          await para.keepSessionAlive();
          setSessionStatus("active");
          setupSessionMonitoring();
        } catch (err) {
          console.error("Failed to keep session alive:", err);
        }
      } else if (timeUntilExpiry <= 0) {
        setSessionStatus("expired");
        setIsConnected(false);
        setAddress(null);
        setWalletId(null);
      } else {
        setSessionStatus("active");
      }
    }, SESSION_CHECK_INTERVAL);
  };

  const clearSessionMonitoring = () => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }
    if (sessionExpiryTimeout.current) {
      clearTimeout(sessionExpiryTimeout.current);
    }
  };

  const refreshAuth = async () => {
    ``;
    await checkAuthentication();
  };

  const handleSessionRefresh = async () => {
    try {
      await para.refreshSession({ shouldOpenPopup: true });
      await checkAuthentication();
    } catch (err) {
      console.error("Failed to refresh session:", err);
      setError("Failed to refresh session");
    }
  };

  useEffect(() => {
    checkAuthentication();
    return () => clearSessionMonitoring();
  }, []);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(async () => {
    await checkAuthentication();
    setIsOpen(false);
  }, []);

  return (
    <ParaContext.Provider
      value={{
        isConnected,
        address,
        walletId,
        isLoading,
        error,
        openModal,
        closeModal,
        refreshAuth,
        handleSessionRefresh,
        sessionStatus,
        timeUntilExpiry,
      }}>
      {children}
      <ParaModal
        para={para}
        isOpen={isOpen}
        onClose={closeModal}
        disableEmailLogin={false}
        disablePhoneLogin={false}
        authLayout={[AuthLayout.AUTH_FULL]}
        oAuthMethods={[
          OAuthMethod.APPLE,
          OAuthMethod.DISCORD,
          OAuthMethod.FACEBOOK,
          OAuthMethod.FARCASTER,
          OAuthMethod.GOOGLE,
          OAuthMethod.TWITTER,
        ]}
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
        appName="Para Modal Example"
        logo="/para.svg"
        recoverySecretStepEnabled={true}
        twoFactorAuthEnabled={false}
      />
    </ParaContext.Provider>
  );
}

export function usePara() {
  const context = useContext(ParaContext);
  if (context === undefined) {
    throw new Error("usePara must be used within a ParaProvider");
  }
  return context;
}
