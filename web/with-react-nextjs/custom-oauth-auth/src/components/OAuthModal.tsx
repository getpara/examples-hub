"use client";

import { useState, useRef, useEffect } from "react";
import { TOAuthMethod } from "@getpara/web-sdk";
import { Modal } from "@/components/ui/Modal";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { useModal } from "@/context/ModalContext";
import { useParaOAuth } from "@/hooks/useParaOAuth";
import { useParaAccount } from "@/hooks/useParaAccount";
import { queryClient } from "@/context/QueryProvider";

interface OAuthOption {
  method: TOAuthMethod;
  label: string;
  icon: string;
}

const oAuthOptions: OAuthOption[] = [
  {
    method: "GOOGLE",
    label: "Continue with Google",
    icon: "/google.svg",
  },
  {
    method: "TWITTER",
    label: "Continue with Twitter",
    icon: "/twitter.svg",
  },
  {
    method: "APPLE",
    label: "Continue with Apple",
    icon: "/apple.svg",
  },
  {
    method: "DISCORD",
    label: "Continue with Discord",
    icon: "/discord.svg",
  },
  {
    method: "FACEBOOK",
    label: "Continue with Facebook",
    icon: "/facebook.svg",
  },
  {
    method: "FARCASTER",
    label: "Continue with Farcaster",
    icon: "/farcaster.svg",
  },
];

export function OAuthModal() {
  const { isOpen, closeModal } = useModal();
  const { isConnected, address } = useParaAccount();
  const [error, setError] = useState("");
  const [authenticatingMethod, setAuthenticatingMethod] = useState<TOAuthMethod | null>(null);
  
  const popupWindow = useRef<Window | null>(null);
  
  const {
    verifyOAuthAsync,
    verifyFarcasterAsync,
    handleAuthStateAsync,
    logoutAsync,
    isLoggingOut,
  } = useParaOAuth();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError("");
      setAuthenticatingMethod(null);
      popupWindow.current?.close();
    }
  }, [isOpen]);

  // Close modal after successful authentication
  const [wasConnected, setWasConnected] = useState(isConnected);
  
  useEffect(() => {
    if (!wasConnected && isConnected && isOpen) {
      closeModal();
    }
    setWasConnected(isConnected);
  }, [isConnected, wasConnected, isOpen, closeModal]);

  const openPopup = (url: string, name: string, features: string) => {
    popupWindow.current?.close();
    popupWindow.current = window.open(url, name, features);
    return popupWindow.current;
  };

  const handleOAuthAuthentication = async (method: TOAuthMethod) => {
    setError("");
    setAuthenticatingMethod(method);

    try {
      if (method === "TELEGRAM") {
        throw new Error("Telegram authentication is not supported in this example.");
      }

      let authState;

      if (method === "FARCASTER") {
        authState = await verifyFarcasterAsync({
          onConnectUri: (connectUri: string) => {
            openPopup(connectUri, "farcasterConnectPopup", "popup=true");
          },
          isCanceled: () => Boolean(popupWindow.current?.closed),
        });
      } else {
        authState = await verifyOAuthAsync({
          method,
          onOAuthUrl: (oAuthUrl: string) => {
            openPopup(oAuthUrl, "oAuthPopup", "popup=true");
          },
          isCanceled: () => Boolean(popupWindow.current?.closed),
        });
      }

      await handleAuthStateAsync({ 
        authState, 
        openPopup,
        popupWindow 
      });

      // Force immediate query refresh
      await queryClient.invalidateQueries({ queryKey: ["paraAccount"] });
      
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setAuthenticatingMethod(null);
    }
  };

  const handleLogout = async () => {
    setError("");
    
    try {
      await logoutAsync();
      closeModal();
    } catch (err: any) {
      setError(err.message || "Failed to logout");
    }
  };

  const isAuthenticating = authenticatingMethod !== null;

  return (
    <Modal isOpen={isOpen} onClose={closeModal}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">
          {isConnected ? "Account Settings" : "Connect with OAuth"}
        </h2>

        {isConnected ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-none border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Connected Account</p>
              <p className="text-sm font-mono text-gray-900">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-none hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {oAuthOptions.map(({ method, label, icon }) => {
                const isCurrentlyAuthenticating = authenticatingMethod === method;
                const isDisabled = isAuthenticating || isLoggingOut;
                
                return (
                  <button
                    key={method}
                    onClick={() => handleOAuthAuthentication(method)}
                    disabled={isDisabled}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-none hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <img
                      src={icon}
                      alt=""
                      className="w-5 h-5"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium">
                      {isCurrentlyAuthenticating ? "Loading..." : label}
                    </span>
                  </button>
                );
              })}
            </div>

            <StatusAlert
              show={!!error}
              type="error"
              message={error}
            />
          </>
        )}

        <button
          onClick={closeModal}
          className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
          Cancel
        </button>
      </div>
    </Modal>
  );
}