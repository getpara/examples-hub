import { useState, useRef, useCallback, useEffect } from "react";
import { useAuthenticateWithEmailOrPhone, useClient } from "@getpara/react-sdk";

export type EmailAuthStep = "input" | "verify";

export interface UseEmailAuthReturn {
  email: string;
  step: EmailAuthStep;
  verifyUrl: string | null;
  passkeyUrl: string | null;
  error: string | null;
  isPending: boolean;
  setEmail: (email: string) => void;
  submit: () => void;
  openPasskeyWindow: () => void;
  cancel: () => void;
}

interface EmailAuthAttempt {
  isCanceled: boolean;
  passkeyPopup: Window | null;
}

function closePasskeyPopup(attempt: EmailAuthAttempt) {
  if (attempt.passkeyPopup && !attempt.passkeyPopup.closed) {
    attempt.passkeyPopup.close();
  }
}

export function useEmailAuth(): UseEmailAuthReturn {
  const para = useClient();

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<EmailAuthStep>("input");
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [passkeyUrl, setPasskeyUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { authenticateWithEmailOrPhoneAsync, isPending } = useAuthenticateWithEmailOrPhone();
  const activeAttempt = useRef<EmailAuthAttempt | null>(null);

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

    const attempt: EmailAuthAttempt = {
      isCanceled: false,
      passkeyPopup: null,
    };
    activeAttempt.current = attempt;
    setError(null);
    resetState();

    void authenticateWithEmailOrPhoneAsync({
      auth: { email },
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
  }, [authenticateWithEmailOrPhoneAsync, email, resetState]);

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
    email,
    step,
    verifyUrl,
    passkeyUrl,
    error,
    isPending,
    setEmail,
    submit,
    openPasskeyWindow,
    cancel,
  };
}
