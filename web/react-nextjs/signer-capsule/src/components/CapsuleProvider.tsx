"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { CapsuleModal, AuthLayout, OAuthMethod } from "@usecapsule/react-sdk";
import { capsule } from "@/client/capsule";
import "@usecapsule/react-sdk/styles.css";

interface CapsuleContextType {
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

const CapsuleContext = createContext<CapsuleContextType | undefined>(undefined);

const SESSION_CHECK_INTERVAL = 60000;
const SESSION_REFRESH_THRESHOLD = 300000;

export function CapsuleProvider({ children }: { children: React.ReactNode }) {
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
      const sessionCookie = await capsule.retrieveSessionCookie();
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
      const isAuthenticated = await capsule.isFullyLoggedIn();
      setIsConnected(isAuthenticated);

      if (isAuthenticated) {
        const wallets = Object.values(await capsule.getWallets());
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
          await capsule.keepSessionAlive();
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
      await capsule.refreshSession(true);
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
    <CapsuleContext.Provider
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
      <CapsuleModal
        capsule={capsule}
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
        appName="Capsule Modal Example"
        logo="/capsule.svg"
        recoverySecretStepEnabled={true}
        twoFactorAuthEnabled={false}
      />
    </CapsuleContext.Provider>
  );
}

export function useCapsule() {
  const context = useContext(CapsuleContext);
  if (context === undefined) {
    throw new Error("useCapsule must be used within a CapsuleProvider");
  }
  return context;
}
