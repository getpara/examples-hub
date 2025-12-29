import { useState, useRef, useCallback, useEffect } from "react";
import {
  useClient,
  useSignUpOrLogIn,
  useWaitForLogin,
  useWaitForWalletCreation,
  getPortalBaseURL,
  type AuthStateVerify,
} from "@getpara/react-sdk";

export type EmailAuthStep = "input" | "verify";

export interface UseEmailAuthReturn {
  // State
  email: string;
  step: EmailAuthStep;
  verifyUrl: string | null;
  error: string | null;
  isPending: boolean;

  // Actions
  setEmail: (email: string) => void;
  submit: () => void;
  cancel: () => void;
}

export function useEmailAuth(): UseEmailAuthReturn {
  const para = useClient();

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<EmailAuthStep>("input");
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { signUpOrLogIn, isPending: isSigningUp } = useSignUpOrLogIn();
  const { waitForLogin, isPending: isWaitingForLogin } = useWaitForLogin();
  const { waitForWalletCreation, isPending: isWaitingForWallet } = useWaitForWalletCreation();

  const shouldCancel = useRef(false);

  // Reset to initial state
  const resetState = useCallback(() => {
    setStep("input");
    setVerifyUrl(null);
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
            onSuccess: ({ needsWallet }) => {
              if (needsWallet) {
                waitForWalletCreation(
                  { isCanceled: () => shouldCancel.current },
                  { onSuccess: () => resetState() }
                );
              } else {
                resetState();
              }
            },
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

  // Listen for iframe messages (OTP verification complete)
  useEffect(() => {
    if (step !== "verify" || !para) return;

    const handleMessage = (event: MessageEvent) => {
      const portalBase = getPortalBaseURL(para.ctx);
      if (!event.origin.startsWith(portalBase)) return;

      if (event.data?.type === "CLOSE_WINDOW" && event.data.success) {
        setVerifyUrl(null);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [step, para]);

  // Submit email for authentication
  const submit = useCallback(() => {
    setError(null);

    signUpOrLogIn(
      { auth: { email } },
      {
        onSuccess: (authState) => {
          if (authState?.stage === "verify") {
            const verifyState = authState as AuthStateVerify;
            if (verifyState.loginUrl) {
              setVerifyUrl(verifyState.loginUrl);
              setStep("verify");
              const needsSignup = verifyState.nextStage === "signup";
              handleAuthComplete(needsSignup);
            }
          }
        },
        onError: (err) => {
          setError(err.message || "Authentication failed");
        },
      }
    );
  }, [email, signUpOrLogIn, handleAuthComplete]);

  // Cancel authentication
  const cancel = useCallback(() => {
    shouldCancel.current = true;
    resetState();
    setError(null);
  }, [resetState]);

  const isPending = isSigningUp || isWaitingForLogin || isWaitingForWallet;

  return {
    email,
    step,
    verifyUrl,
    error,
    isPending,
    setEmail,
    submit,
    cancel,
  };
}
