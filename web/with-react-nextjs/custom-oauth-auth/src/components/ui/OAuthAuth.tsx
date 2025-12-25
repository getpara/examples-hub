"use client";

import { useState, useRef, useCallback } from "react";
import {
  useAccount,
  useVerifyOAuth,
  useVerifyFarcaster,
  useWaitForLogin,
  useWaitForWalletCreation,
  type TOAuthMethod,
} from "@getpara/react-sdk";

const OAUTH_PROVIDERS: { method: TOAuthMethod; label: string; icon: string }[] = [
  { method: "GOOGLE", label: "Google", icon: "/google.svg" },
  { method: "APPLE", label: "Apple", icon: "/apple.svg" },
  { method: "DISCORD", label: "Discord", icon: "/discord.svg" },
  { method: "TWITTER", label: "X (Twitter)", icon: "/twitter.svg" },
  { method: "FACEBOOK", label: "Facebook", icon: "/facebook.svg" },
  { method: "FARCASTER", label: "Farcaster", icon: "/farcaster.svg" },
];

export function OAuthAuth() {
  const { isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  const { verifyOAuth, isPending: isVerifyingOAuth } = useVerifyOAuth();
  const { verifyFarcaster, isPending: isVerifyingFarcaster } = useVerifyFarcaster();
  const { waitForLogin, isPending: isWaitingLogin } = useWaitForLogin();
  const { waitForWalletCreation, isPending: isWaitingWallet } = useWaitForWalletCreation();

  const popupWindow = useRef<Window | null>(null);
  const shouldCancel = useRef(false);

  const handleAuthComplete = useCallback(
    (isNewUser: boolean) => {
      shouldCancel.current = false;

      if (isNewUser) {
        // New user - wait for wallet creation
        waitForWalletCreation(
          { isCanceled: () => shouldCancel.current },
          {
            onSuccess: () => setActiveProvider(null),
            onError: (err) => {
              setError(err.message);
              setActiveProvider(null);
            },
          }
        );
      } else {
        // Returning user - wait for login
        waitForLogin(
          { isCanceled: () => shouldCancel.current },
          {
            onSuccess: () => setActiveProvider(null),
            onError: (err) => {
              setError(err.message);
              setActiveProvider(null);
            },
          }
        );
      }
    },
    [waitForLogin, waitForWalletCreation]
  );

  const handleOAuth = (method: TOAuthMethod) => {
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
            setActiveProvider(null);
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
            setActiveProvider(null);
          },
        }
      );
    }
  };

  const handleCancel = () => {
    shouldCancel.current = true;
    popupWindow.current?.close();
    setActiveProvider(null);
    setError(null);
  };

  if (isConnected) return null;

  const isPending = isVerifyingOAuth || isVerifyingFarcaster || isWaitingLogin || isWaitingWallet;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-none border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Sign in with OAuth</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <div className="space-y-3">
          {OAUTH_PROVIDERS.map(({ method, label, icon }) => (
            <button
              key={method}
              onClick={() => handleOAuth(method)}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-none hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <img src={icon} alt="" className="w-5 h-5" />
              <span className="text-sm font-medium">
                {activeProvider === method ? "Loading..." : `Continue with ${label}`}
              </span>
            </button>
          ))}
        </div>

        {isPending && (
          <div className="mt-4 space-y-3">
            <div className="text-center text-sm text-gray-500">
              {(isVerifyingOAuth || isVerifyingFarcaster) && "Waiting for authentication..."}
              {isWaitingWallet && "Creating wallet..."}
              {isWaitingLogin && "Completing login..."}
            </div>
            <button
              onClick={handleCancel}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-none hover:bg-gray-50 transition-colors font-medium">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
