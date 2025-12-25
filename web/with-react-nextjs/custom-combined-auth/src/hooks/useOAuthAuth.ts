import { useState, useRef, useCallback } from "react";
import {
  useVerifyOAuth,
  useVerifyFarcaster,
  useWaitForLogin,
  useWaitForWalletCreation,
  type TOAuthMethod,
} from "@getpara/react-sdk";

export interface UseOAuthAuthReturn {
  // State
  activeProvider: TOAuthMethod | null;
  error: string | null;
  isPending: boolean;

  // Actions
  authenticate: (method: TOAuthMethod) => void;
  cancel: () => void;
}

export function useOAuthAuth(): UseOAuthAuthReturn {
  const [activeProvider, setActiveProvider] = useState<TOAuthMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { verifyOAuth, isPending: isVerifyingOAuth } = useVerifyOAuth();
  const { verifyFarcaster, isPending: isVerifyingFarcaster } = useVerifyFarcaster();
  const { waitForLogin, isPending: isWaitingForLogin } = useWaitForLogin();
  const { waitForWalletCreation, isPending: isWaitingForWallet } = useWaitForWalletCreation();

  const popupWindow = useRef<Window | null>(null);
  const shouldCancel = useRef(false);

  // Reset state
  const resetState = useCallback(() => {
    setActiveProvider(null);
  }, []);

  // Handle post-auth completion (new user vs returning user)
  const handleAuthComplete = useCallback(
    (isNewUser: boolean) => {
      shouldCancel.current = false;

      if (isNewUser) {
        waitForWalletCreation(
          { isCanceled: () => shouldCancel.current },
          {
            onSuccess: () => resetState(),
            onError: (err) => {
              setError(err.message || "Wallet creation failed");
              resetState();
            },
          }
        );
      } else {
        waitForLogin(
          { isCanceled: () => shouldCancel.current },
          {
            onSuccess: () => resetState(),
            onError: (err) => {
              setError(err.message || "Login failed");
              resetState();
            },
          }
        );
      }
    },
    [waitForLogin, waitForWalletCreation, resetState]
  );

  // Authenticate with OAuth provider
  const authenticate = useCallback(
    (method: TOAuthMethod) => {
      setError(null);
      setActiveProvider(method);
      shouldCancel.current = false;

      if (method === "FARCASTER") {
        verifyFarcaster(
          {
            onConnectUri: (uri) => {
              popupWindow.current = window.open(uri, "farcaster", "popup=true");
            },
            isCanceled: () => shouldCancel.current || !!popupWindow.current?.closed,
          },
          {
            onSuccess: (authState) => {
              if (authState.stage === "done") {
                handleAuthComplete(authState.isNewUser);
              }
            },
            onError: (err) => {
              setError(err.message);
              resetState();
            },
          }
        );
      } else if (method !== "TELEGRAM") {
        verifyOAuth(
          {
            method: method as Exclude<TOAuthMethod, "TELEGRAM" | "FARCASTER">,
            onOAuthUrl: (url) => {
              popupWindow.current = window.open(url, "oauth", "popup=true");
            },
            isCanceled: () => shouldCancel.current || !!popupWindow.current?.closed,
          },
          {
            onSuccess: (authState) => {
              if (authState.stage === "done") {
                handleAuthComplete(authState.isNewUser);
              }
            },
            onError: (err) => {
              setError(err.message);
              resetState();
            },
          }
        );
      }
    },
    [verifyOAuth, verifyFarcaster, handleAuthComplete, resetState]
  );

  // Cancel authentication
  const cancel = useCallback(() => {
    shouldCancel.current = true;
    popupWindow.current?.close();
    resetState();
    setError(null);
  }, [resetState]);

  const isPending = isVerifyingOAuth || isVerifyingFarcaster || isWaitingForLogin || isWaitingForWallet;

  return {
    activeProvider,
    error,
    isPending,
    authenticate,
    cancel,
  };
}
