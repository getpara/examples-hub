"use client";

import { useRef, useState, useEffect } from "react";
import {
  AuthState,
  useAccount,
  useWaitForWalletCreation,
  useLogout,
  useSignUpOrLogIn,
  useWaitForLogin,
  getPortalBaseURL,
  useClient,
} from "@getpara/react-sdk";
import { Modal } from "@/components/ui/Modal";
import { useModal } from "@/context/CustomModalProvider";
import { EmailInput } from "@/components/EmailInput";
import { AuthButton } from "@/components/AuthButton";

export function AuthModal() {
  const { isOpen, closeModal } = useModal();
  const { signUpOrLogIn, isPending: isSigningUpOrLoggingIn } = useSignUpOrLogIn();
  const { waitForLogin } = useWaitForLogin();
  const { waitForWalletCreation } = useWaitForWalletCreation();
  const { isConnected, embedded } = useAccount();
  const address = embedded?.wallets?.[0]?.address;
  const { logout, isPending: isLoggingOut } = useLogout();
  const [email, setEmail] = useState("");
  const [authState, setAuthState] = useState<AuthState>();
  const [iFrameState, setIFrameState] = useState("closed");
  const paraClient = useClient();

  const shouldCancelPolling = useRef(false);

  const isIframeLoading = iFrameState === "loading";

  const resetState = () => {
    shouldCancelPolling.current = true;
    setAuthState(undefined);
    setEmail("");
    setIFrameState("closed");
  };

  // Reset auth flow state when modal closes (only if not connected)
  useEffect(() => {
    if (!isOpen && !isConnected) {
      resetState();
    }
  }, [isOpen, isConnected]);

  const pollLogin = () => {
    shouldCancelPolling.current = false;
    waitForLogin(
      { isCanceled: () => shouldCancelPolling.current },
      {
        onSuccess: ({ needsWallet }) => {
          if (needsWallet) {
            waitForWalletCreation({ isCanceled: () => shouldCancelPolling.current }, { onSuccess: () => {} });
          }
        },
      }
    );
  };

  const pollSignUp = () => {
    shouldCancelPolling.current = false;
    waitForWalletCreation({ isCanceled: () => shouldCancelPolling.current }, { onSuccess: () => {} });
  };

  const setupIframeListener = () => {
    const handleMessage = (event: MessageEvent) => {
      if (!paraClient) return;

      const portalBase = getPortalBaseURL(paraClient.ctx);
      if (!event.origin.startsWith(portalBase)) return;

      if (event.data) {
        if (event.data.type === "LOADED") {
          setIFrameState("loaded");
        }
        if (event.data?.type === "CLOSE_WINDOW") {
          if (event.data.success) {
            setIFrameState("closed");
          }
          window.removeEventListener("message", handleMessage);
        }
      }
    };
    window.addEventListener("message", handleMessage);
  };

  const onSubmitEmail = () => {
    signUpOrLogIn(
      { auth: { email } },
      {
        onSuccess: (authState) => {
          switch (authState?.stage) {
            case "verify":
              if (authState.loginUrl) {
                setIFrameState("loading");
                setupIframeListener();

                if (authState.nextStage === "signup") {
                  pollSignUp();
                } else if (authState.nextStage === "login") {
                  pollLogin();
                }
              }
              break;
          }
          setAuthState(authState);
        },
        onError: (error) => {
          console.error("Auth error:", error);
        },
      }
    );
  };

  const handleOpenWindowClick = (url: string) => () => {
    window.open(url, "_blank", "noopener,noreferrer");

    switch (authState?.stage) {
      case "signup":
        pollSignUp();
        break;
      case "login":
        pollLogin();
        break;
    }
  };

  const handleLogout = async () => {
    shouldCancelPolling.current = true;
    await logout();
    setAuthState(undefined);
    closeModal();
  };

  const handleCancel = () => {
    resetState();
    closeModal();
  };

  if (isConnected) {
    return (
      <Modal isOpen={isOpen} onClose={closeModal} data-testid="auth-modal">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Account Settings</h2>
          <div className="bg-gray-50 p-4 rounded-none border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Connected Account</p>
            <p className="text-sm font-mono text-gray-900">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            data-testid="auth-logout-button"
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-none hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </Modal>
    );
  }

  // Verify step - clean iframe view with just back button
  if (authState?.stage === "verify" && authState.loginUrl) {
    return (
      <Modal isOpen={isOpen} onClose={handleCancel} data-testid="auth-modal">
        <div className="space-y-4">
          <button
            onClick={resetState}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm">
            ← Back
          </button>
          <div className="relative" style={{ height: 400 }}>
            {isIframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            )}
            <iframe
              src={authState.loginUrl}
              className="absolute inset-0"
              style={{
                border: "none",
                width: "100%",
                height: "100%",
                opacity: isIframeLoading ? 0 : 1,
                transition: "opacity 150ms ease-in-out",
              }}
              title="Para Verification"
              allow="publickey-credentials-get *; publickey-credentials-create *"
            />
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} data-testid="auth-modal">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">
          {!authState
            ? "Connect with Email"
            : authState.stage === "login"
              ? "Welcome Back"
              : authState.stage === "signup"
                ? "Complete Signup"
                : "Connect with Email"}
        </h2>

        {!authState ? (
          <>
            <EmailInput
              disabled={isSigningUpOrLoggingIn}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="auth-email-input"
            />
            <AuthButton
              isLoading={isSigningUpOrLoggingIn}
              disabled={!email}
              onClick={onSubmitEmail}
              data-testid="auth-submit-button">
              Continue
            </AuthButton>
          </>
        ) : authState.stage === "login" ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Choose how to log in:</p>
            {authState.passkeyUrl && (
              <button
                onClick={handleOpenWindowClick(authState.passkeyUrl)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-none hover:bg-gray-900 transition-colors font-medium">
                Login with Passkey
              </button>
            )}
            {authState.passwordUrl && (
              <button
                onClick={handleOpenWindowClick(authState.passwordUrl)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-none hover:bg-gray-900 transition-colors font-medium">
                Login with Password
              </button>
            )}
            {authState.pinUrl && (
              <button
                onClick={handleOpenWindowClick(authState.pinUrl)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-none hover:bg-gray-900 transition-colors font-medium">
                Login with PIN
              </button>
            )}
          </div>
        ) : authState.stage === "signup" ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Choose how to sign up:</p>
            {authState.passkeyUrl && (
              <button
                onClick={handleOpenWindowClick(authState.passkeyUrl)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-none hover:bg-gray-900 transition-colors font-medium">
                Signup with Passkey
              </button>
            )}
            {authState.passwordUrl && (
              <button
                onClick={handleOpenWindowClick(authState.passwordUrl)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-none hover:bg-gray-900 transition-colors font-medium">
                Signup with Password
              </button>
            )}
            {authState.pinUrl && (
              <button
                onClick={handleOpenWindowClick(authState.pinUrl)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-none hover:bg-gray-900 transition-colors font-medium">
                Signup with PIN
              </button>
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
