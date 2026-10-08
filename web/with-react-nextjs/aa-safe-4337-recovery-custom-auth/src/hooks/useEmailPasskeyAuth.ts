import { useCallback, useEffect, useRef, useState } from "react";
import { getPortalBaseURL, type AuthStateLogin, type AuthStateVerify, type StateSnapshot } from "@getpara/web-sdk";
import type ParaWeb from "@getpara/web-sdk";
import { PARA_API_KEY } from "@/lib/para";

const MISSING_PASSKEY_URL = "No passkey URL was returned. Check that passkeys are enabled for this API key.";

interface UseEmailPasskeyAuthOptions {
  para: ParaWeb | null;
  isReady: boolean;
  onAuthenticated: () => Promise<void>;
}

export function useEmailPasskeyAuth({ para, isReady, onAuthenticated }: UseEmailPasskeyAuthOptions) {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [passkeyUrl, setPasskeyUrl] = useState<string | null>(null);
  const [needsVerificationCode, setNeedsVerificationCode] = useState(false);
  const [isPasskeyWindowOpen, setIsPasskeyWindowOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const shouldCancel = useRef(false);
  const passkeyWindow = useRef<Window | null>(null);

  const updateAuthUrls = useCallback((snapshot: StateSnapshot) => {
    const { authStateInfo } = snapshot;

    setVerifyUrl(authStateInfo.verificationUrl);
    setPasskeyUrl(authStateInfo.passkeyUrl);

    if (snapshot.authPhase === "authenticated") {
      setVerifyUrl(null);
      setPasskeyUrl(null);
      setIsPasskeyWindowOpen(false);
    }

    if (snapshot.error) {
      setErrorMessage(snapshot.error.message);
    }
  }, []);

  useEffect(() => {
    if (!para || !isReady) return;
    return para.onStatePhaseChange(updateAuthUrls);
  }, [isReady, para, updateAuthUrls]);

  useEffect(() => {
    if (!para || !verifyUrl) return;

    const handleMessage = (event: MessageEvent) => {
      const portalBase = getPortalBaseURL(para.ctx);
      if (!event.origin.startsWith(portalBase)) return;

      if (event.data?.type === "CLOSE_WINDOW" && event.data.success) {
        setVerifyUrl(null);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [para, verifyUrl]);

  const completeAuth = useCallback(
    async (client: ParaWeb, isNewUser: boolean) => {
      const syncAuthState = () => {
        updateAuthUrls(client.getCurrentState());
        if (passkeyWindow.current?.closed) {
          setIsPasskeyWindowOpen(false);
        }
      };
      const syncTimer = window.setInterval(syncAuthState, 250);

      try {
        syncAuthState();

        if (isNewUser) {
          await client.waitForWalletCreation({ isCanceled: () => shouldCancel.current });
        } else {
          const loginResult = await client.waitForLogin({ isCanceled: () => shouldCancel.current });
          if (loginResult.needsWallet) {
            await client.waitForWalletCreation({ isCanceled: () => shouldCancel.current });
          }
        }

        if (!shouldCancel.current) {
          setVerifyUrl(null);
          setPasskeyUrl(null);
          setIsPasskeyWindowOpen(false);
          await onAuthenticated();
        }
      } finally {
        window.clearInterval(syncTimer);
      }
    },
    [onAuthenticated, updateAuthUrls],
  );

  const submit = useCallback(async () => {
    setErrorMessage(null);

    if (!PARA_API_KEY) {
      setErrorMessage("NEXT_PUBLIC_PARA_API_KEY is required.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Enter an email address to continue.");
      return;
    }

    if (!para) {
      setErrorMessage("Wallet client is not ready yet.");
      return;
    }

    shouldCancel.current = false;
    setIsPending(true);
    setVerifyUrl(null);
    setPasskeyUrl(null);
    setIsPasskeyWindowOpen(false);
    setNeedsVerificationCode(false);
    setVerificationCode("");

    try {
      const authState = await para.signUpOrLogIn({ auth: { email: email.trim() }, useShortUrls: true });

      if (authState.stage === "verify") {
        const verifyState = authState as AuthStateVerify;
        if (!verifyState.loginUrl) {
          setNeedsVerificationCode(true);
          return;
        }

        setVerifyUrl(verifyState.loginUrl);
        await completeAuth(para, verifyState.nextStage === "signup");
        return;
      }

      const loginState = authState as AuthStateLogin;
      if (!loginState.passkeyUrl) {
        throw new Error(MISSING_PASSKEY_URL);
      }

      setPasskeyUrl(loginState.passkeyUrl);
      await completeAuth(para, false);
    } catch (error) {
      if (!shouldCancel.current) {
        setErrorMessage(error instanceof Error ? error.message : "Passkey authentication failed.");
      }
    } finally {
      setIsPending(false);
    }
  }, [completeAuth, email, para]);

  const submitVerificationCode = useCallback(async () => {
    setErrorMessage(null);

    if (!para) {
      setErrorMessage("Wallet client is not ready yet.");
      return;
    }

    if (!verificationCode.trim()) {
      setErrorMessage("Enter the verification code to continue.");
      return;
    }

    shouldCancel.current = false;
    setIsPending(true);

    try {
      const signupState = await para.verifyNewAccount({
        verificationCode: verificationCode.trim(),
        useShortUrls: true,
      });

      if (!signupState.passkeyUrl) {
        throw new Error(MISSING_PASSKEY_URL);
      }

      setNeedsVerificationCode(false);
      setPasskeyUrl(signupState.passkeyUrl);
      await completeAuth(para, true);
    } catch (error) {
      if (!shouldCancel.current) {
        setErrorMessage(error instanceof Error ? error.message : "Verification failed.");
      }
    } finally {
      setIsPending(false);
    }
  }, [completeAuth, para, verificationCode]);

  const openPasskeyWindow = useCallback(() => {
    if (!passkeyUrl) return;

    const popup = window.open(passkeyUrl, "CustomPasskeyAuth", "popup,width=460,height=720");
    if (!popup) {
      setErrorMessage("Allow popups to continue passkey verification.");
      return;
    }

    passkeyWindow.current = popup;
    setIsPasskeyWindowOpen(true);
    popup.focus();
  }, [passkeyUrl]);

  const cancel = useCallback(() => {
    shouldCancel.current = true;
    passkeyWindow.current?.close();
    passkeyWindow.current = null;
    setVerifyUrl(null);
    setPasskeyUrl(null);
    setNeedsVerificationCode(false);
    setVerificationCode("");
    setErrorMessage(null);
    setIsPending(false);
    setIsPasskeyWindowOpen(false);
  }, []);

  return {
    email,
    verificationCode,
    verifyUrl,
    passkeyUrl,
    needsVerificationCode,
    isPasskeyWindowOpen,
    isPending,
    errorMessage,
    setEmail,
    setVerificationCode,
    submit,
    submitVerificationCode,
    openPasskeyWindow,
    cancel,
  };
}

export type EmailPasskeyAuth = ReturnType<typeof useEmailPasskeyAuth>;
