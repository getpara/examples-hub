import { useState, useRef, useCallback, useEffect } from "react";
import {
  useClient,
  useSignUpOrLogIn,
  useWaitForLogin,
  useWaitForWalletCreation,
  getPortalBaseURL,
  type AuthStateVerify,
} from "@getpara/react-sdk";
import type { PhoneAuthStep } from "@/types/auth";

export interface UsePhoneAuthReturn {
  countryCode: string;
  phoneNumber: string;
  step: PhoneAuthStep;
  verifyUrl: string | null;
  error: string | null;
  isPending: boolean;
  setCountryCode: (code: string) => void;
  setPhoneNumber: (phone: string) => void;
  submit: () => void;
  cancel: () => void;
}

export function usePhoneAuth(): UsePhoneAuthReturn {
  const para = useClient();

  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<PhoneAuthStep>("input");
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { signUpOrLogIn, isPending: isSigningUp } = useSignUpOrLogIn();
  const { waitForLogin, isPending: isWaitingForLogin } = useWaitForLogin();
  const { waitForWalletCreation, isPending: isWaitingForWallet } = useWaitForWalletCreation();

  const shouldCancel = useRef(false);

  const resetState = useCallback(() => {
    setStep("input");
    setVerifyUrl(null);
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

  const submit = useCallback(() => {
    setError(null);

    const phone = `${countryCode}${phoneNumber.replace(/\D/g, "")}` as `+${number}`;

    signUpOrLogIn(
      { auth: { phone } },
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
  }, [countryCode, phoneNumber, signUpOrLogIn, handleAuthComplete]);

  const cancel = useCallback(() => {
    shouldCancel.current = true;
    resetState();
    setError(null);
  }, [resetState]);

  const isPending = isSigningUp || isWaitingForLogin || isWaitingForWallet;

  return {
    countryCode,
    phoneNumber,
    step,
    verifyUrl,
    error,
    isPending,
    setCountryCode,
    setPhoneNumber,
    submit,
    cancel,
  };
}
