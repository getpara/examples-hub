import { useState, useRef, useCallback } from "react";
import {
  useVerifyOAuth,
  useWaitForLogin,
  useWaitForWalletCreation,
  type TOAuthMethod,
} from "@getpara/react-sdk";
import type { OAuthProviderMethod } from "@/types/auth";

export interface UseOAuthAuthReturn {
  activeProvider: OAuthProviderMethod | null;
  error: string | null;
  isPending: boolean;
  authenticate: (method: OAuthProviderMethod) => void;
  cancel: () => void;
}

interface OAuthDoneState {
  stage: "done";
  isNewUser: boolean;
}

export function useOAuthAuth(): UseOAuthAuthReturn {
  const [activeProvider, setActiveProvider] = useState<OAuthProviderMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { verifyOAuth, isPending: isVerifyingOAuth } = useVerifyOAuth();
  const { waitForLogin, isPending: isWaitingForLogin } = useWaitForLogin();
  const { waitForWalletCreation, isPending: isWaitingForWallet } = useWaitForWalletCreation();

  const popupWindow = useRef<Window | null>(null);
  const shouldCancel = useRef(false);

  const resetState = useCallback(() => {
    setActiveProvider(null);
  }, []);

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

  const authenticate = useCallback(
    (method: OAuthProviderMethod) => {
      setError(null);
      setActiveProvider(method);
      shouldCancel.current = false;

      verifyOAuth(
        {
          method: method as Exclude<TOAuthMethod, "TELEGRAM" | "FARCASTER">,
          onOAuthUrl: (url: string) => {
            popupWindow.current = window.open(url, "oauth", "popup=true");
          },
          isCanceled: () => shouldCancel.current || !!popupWindow.current?.closed,
        },
        {
          onSuccess: (authState: OAuthDoneState) => {
            if (authState.stage === "done") {
              handleAuthComplete(authState.isNewUser);
            }
          },
          onError: (err: Error) => {
            setError(err.message);
            resetState();
          },
        }
      );
    },
    [verifyOAuth, handleAuthComplete, resetState]
  );

  const cancel = useCallback(() => {
    shouldCancel.current = true;
    popupWindow.current?.close();
    resetState();
    setError(null);
  }, [resetState]);

  const isPending = isVerifyingOAuth || isWaitingForLogin || isWaitingForWallet;

  return {
    activeProvider,
    error,
    isPending,
    authenticate,
    cancel,
  };
}
