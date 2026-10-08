import { useState, useRef, useCallback, useEffect } from "react";
import { useAuthenticateWithEmailOrPhone, useClient } from "@getpara/react-sdk";

export type PhoneAuthStep = "input" | "verify";

export interface UsePhoneAuthReturn {
  countryCode: string;
  phoneNumber: string;
  step: PhoneAuthStep;
  verifyUrl: string | null;
  passkeyUrl: string | null;
  error: string | null;
  isPending: boolean;
  setCountryCode: (code: string) => void;
  setPhoneNumber: (phone: string) => void;
  submit: () => void;
  openPasskeyWindow: () => void;
  cancel: () => void;
}

interface PhoneAuthAttempt {
  isCanceled: boolean;
  passkeyPopup: Window | null;
}

function closePasskeyPopup(attempt: PhoneAuthAttempt) {
  if (attempt.passkeyPopup && !attempt.passkeyPopup.closed) {
    attempt.passkeyPopup.close();
  }
}

export function usePhoneAuth(): UsePhoneAuthReturn {
  const para = useClient();

  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<PhoneAuthStep>("input");
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [passkeyUrl, setPasskeyUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { authenticateWithEmailOrPhoneAsync, isPending } = useAuthenticateWithEmailOrPhone();
  const activeAttempt = useRef<PhoneAuthAttempt | null>(null);

  const resetState = useCallback(() => {
    setStep("input");
    setVerifyUrl(null);
    setPasskeyUrl(null);
  }, []);

  const cancelCoreAuthFlow = useCallback(() => {
    if (!para) return;

    const state = para.getCurrentState();
    if (state.corePhase !== "auth_flow" || state.authPhase === "authenticated") return;

    void para.cancelAuthFlow().catch(() => {});
  }, [para]);

  useEffect(() => {
    if (!para) return;

    const unsubscribe = para.onStatePhaseChange(snapshot => {
      const attempt = activeAttempt.current;
      if (!attempt || attempt.isCanceled) return;

      const { verificationUrl, passwordUrl, pinUrl, passkeyUrl: nextPasskeyUrl } = snapshot.authStateInfo;
      const iframeUrl = verificationUrl ?? passwordUrl ?? pinUrl;
      if (iframeUrl) {
        setVerifyUrl(current => (current === iframeUrl ? current : iframeUrl));
        setStep("verify");
      }

      if (nextPasskeyUrl) {
        setPasskeyUrl(current => (current === nextPasskeyUrl ? current : nextPasskeyUrl));
        setStep("verify");
      }
    });

    return () => {
      const attempt = activeAttempt.current;
      if (attempt) {
        attempt.isCanceled = true;
        closePasskeyPopup(attempt);
        activeAttempt.current = null;
        cancelCoreAuthFlow();
      }
      unsubscribe();
    };
  }, [para, cancelCoreAuthFlow]);

  const submit = useCallback(() => {
    const previousAttempt = activeAttempt.current;
    if (previousAttempt) {
      previousAttempt.isCanceled = true;
      closePasskeyPopup(previousAttempt);
    }

    const attempt: PhoneAuthAttempt = {
      isCanceled: false,
      passkeyPopup: null,
    };
    activeAttempt.current = attempt;
    setError(null);
    resetState();

    const phone = `${countryCode}${phoneNumber.replace(/\D/g, "")}` as `+${number}`;
    void authenticateWithEmailOrPhoneAsync({
      auth: { phone },
      sessionPollingCallbacks: {
        isCanceled: () => attempt.isCanceled,
      },
    })
      .then(() => {
        if (activeAttempt.current !== attempt) return;

        closePasskeyPopup(attempt);
        activeAttempt.current = null;
        resetState();
      })
      .catch(authError => {
        if (activeAttempt.current !== attempt) return;

        closePasskeyPopup(attempt);
        activeAttempt.current = null;
        if (!attempt.isCanceled) {
          setError(authError instanceof Error ? authError.message : "Authentication failed");
          resetState();
        }
      });
  }, [authenticateWithEmailOrPhoneAsync, countryCode, phoneNumber, resetState]);

  const openPasskeyWindow = useCallback(() => {
    const attempt = activeAttempt.current;
    if (!attempt || attempt.isCanceled || !passkeyUrl) return;

    setError(null);
    if (attempt.passkeyPopup && !attempt.passkeyPopup.closed) {
      attempt.passkeyPopup.focus();
      return;
    }

    const popup = window.open(passkeyUrl, "ParaPasskey", "popup,width=480,height=760");
    if (!popup) {
      setError("Pop-up blocked. Allow pop-ups for this site, then try again.");
      return;
    }

    attempt.passkeyPopup = popup;
    popup.focus();
  }, [passkeyUrl]);

  const cancel = useCallback(() => {
    const attempt = activeAttempt.current;
    if (attempt) {
      attempt.isCanceled = true;
      closePasskeyPopup(attempt);
      activeAttempt.current = null;
      cancelCoreAuthFlow();
    }
    resetState();
    setError(null);
  }, [cancelCoreAuthFlow, resetState]);

  return {
    countryCode,
    phoneNumber,
    step,
    verifyUrl,
    passkeyUrl,
    error,
    isPending,
    setCountryCode,
    setPhoneNumber,
    submit,
    openPasskeyWindow,
    cancel,
  };
}
