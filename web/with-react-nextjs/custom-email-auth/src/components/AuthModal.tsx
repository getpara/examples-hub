"use client";

import { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { useModal } from "@/context/ModalContext";
import { useParaAuth } from "@/hooks/useParaAuth";
import { useParaWallet } from "@/hooks/useParaWallet";
import { useParaAccount } from "@/hooks/useParaAccount";
import { EmailInput } from "@/components/EmailInput";
import { OTPInput } from "@/components/OTPInput";
import { AuthButton } from "@/components/AuthButton";
import { queryClient } from "@/context/QueryProvider";

type AuthStep = "email" | "verify" | "login";

export function AuthModal() {
  const { isOpen, closeModal } = useModal();
  const { isConnected, address } = useParaAccount();
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  
  const popupWindow = useRef<Window | null>(null);
  
  const {
    signUpOrLoginAsync,
    isSigningUpOrLoggingIn,
    verifyAccountAsync,
    isVerifying,
    waitForLoginAsync,
    isWaitingForLogin,
    logoutAsync,
    isLoggingOut,
  } = useParaAuth();
  
  const {
    createWalletAsync,
    waitForWalletCreationAsync,
  } = useParaWallet();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep("email");
      setEmail("");
      setVerificationCode("");
      setError("");
      popupWindow.current?.close();
    }
  }, [isOpen]);

  // Close modal after successful authentication (but not when already connected)
  const [wasConnected, setWasConnected] = useState(isConnected);
  
  useEffect(() => {
    // If we transitioned from not connected to connected, close the modal
    if (!wasConnected && isConnected && isOpen) {
      closeModal();
    }
    setWasConnected(isConnected);
  }, [isConnected, wasConnected, isOpen, closeModal]);

  const openPopup = (...args: Parameters<typeof window.open>) => {
    popupWindow.current?.close();
    return (popupWindow.current = window?.open(...args));
  };

  const handleEmailSubmit = async () => {
    setError("");
    
    try {
      const authState = await signUpOrLoginAsync({ email });
      
      if (authState.stage === "verify") {
        setStep("verify");
      } else if (authState.stage === "login") {
        setStep("login");
        openPopup(authState.passkeyUrl, "loginPopup", "popup=true");
        
        const { needsWallet } = await waitForLoginAsync({
          isCanceled: () => popupWindow.current?.closed ?? true,
        });
        
        if (needsWallet) {
          await createWalletAsync({ skipDistribute: false });
        }
        
        // Force immediate query refresh
        await queryClient.invalidateQueries({ queryKey: ["paraAccount"] });
        
        // The connection state change will close the modal
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  const handleVerification = async () => {
    setError("");
    
    try {
      const authState = await verifyAccountAsync({ verificationCode });
      openPopup(authState.passkeyUrl, "signUpPopup", "popup=true");
      
      await waitForWalletCreationAsync({
        isCanceled: () => Boolean(popupWindow.current?.closed),
      });
      
      // Force immediate query refresh
      await queryClient.invalidateQueries({ queryKey: ["paraAccount"] });
      
      // The connection state change will close the modal
    } catch (err: any) {
      setError(
        err.message === "Invalid verification code"
          ? "Verification code incorrect or expired"
          : err.message || "Verification failed"
      );
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

  const isLoading = isSigningUpOrLoggingIn || isVerifying || isWaitingForLogin || isLoggingOut;

  return (
    <Modal isOpen={isOpen} onClose={closeModal} data-testid="auth-modal">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">
          {isConnected ? "Account Settings" : 
            step === "email" ? "Connect with Email" :
            step === "verify" ? "Verify Your Email" :
            "Logging In..."
          }
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
              data-testid="auth-logout-button"
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-none hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        ) : (
          <>
            {step === "email" && (
              <>
                <EmailInput
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="auth-email-input"
                />
                <AuthButton
                  isLoading={isLoading}
                  disabled={!email}
                  onClick={handleEmailSubmit}
                  data-testid="auth-submit-button">
                  Continue
                </AuthButton>
              </>
            )}

            {step === "verify" && (
              <>
                <p className="text-sm text-gray-600">
                  We sent a verification code to {email}
                </p>
                <OTPInput
                  disabled={isLoading}
                  value={verificationCode}
                  onChange={setVerificationCode}
                />
                <AuthButton
                  isLoading={isLoading}
                  disabled={!verificationCode}
                  onClick={handleVerification}
                  loadingText="Verifying..."
                  data-testid="auth-verify-button">
                  Verify & Create Wallet
                </AuthButton>
              </>
            )}

            {step === "login" && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Completing login...</p>
              </div>
            )}

            <StatusAlert
              show={!!error}
              type="error"
              message={error}
            />
          </>
        )}

        <button
          onClick={closeModal}
          data-testid="modal-close-button"
          className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
          Cancel
        </button>
      </div>
    </Modal>
  );
}