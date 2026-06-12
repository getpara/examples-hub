import { useCallback, useEffect, useRef, useState } from "react";
import { getPortalBaseURL, type AuthStateLogin, type AuthStateVerify, type StateSnapshot } from "@getpara/web-sdk";
import type ParaWeb from "@getpara/web-sdk";
import { createParaClient, PARA_API_KEY } from "@/lib/para";

function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getEvmWallet(para: ParaWeb) {
  const wallet = para.getWalletsByType("EVM")[0];
  return wallet?.address?.startsWith("0x")
    ? { id: wallet.id, address: wallet.address as `0x${string}` }
    : null;
}

export function useCustomParaAuth() {
  const [para, setPara] = useState<ParaWeb | null>(null);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [passkeyUrl, setPasskeyUrl] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<`0x${string}` | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isPasskeyWindowOpen, setIsPasskeyWindowOpen] = useState(false);
  const [needsVerificationCode, setNeedsVerificationCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shouldCancel = useRef(false);
  const passkeyWindow = useRef<Window | null>(null);

  const refreshSession = useCallback(async (client: ParaWeb) => {
    if (!client.isReady) return;

    const connected = await client.isFullyLoggedIn();
    const wallet = connected ? getEvmWallet(client) : null;
    setIsConnected(connected);
    setWalletId(wallet?.id ?? null);
    setWalletAddress(wallet?.address ?? null);
  }, []);

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
      setError(snapshot.error.message);
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    async function initialize() {
      if (!PARA_API_KEY) {
        setError("NEXT_PUBLIC_PARA_API_KEY is required.");
        return;
      }

      const client = createParaClient();
      setPara(client);

      try {
        await client.init();
        await client.setup();
        if (cancelled) return;

        unsubscribe = client.onStatePhaseChange((snapshot) => {
          updateAuthUrls(snapshot);
          void refreshSession(client);
        });
        setIsReady(true);
        await refreshSession(client);
      } catch (initializationError) {
        setError(toMessage(initializationError, "Could not initialize the wallet client."));
      }
    }

    void initialize();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [refreshSession, updateAuthUrls]);

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
          await refreshSession(client);
        }
      } finally {
        window.clearInterval(syncTimer);
      }
    },
    [refreshSession, updateAuthUrls],
  );

  const submit = useCallback(async () => {
    setError(null);

    if (!PARA_API_KEY) {
      setError("NEXT_PUBLIC_PARA_API_KEY is required.");
      return;
    }

    if (!email.trim()) {
      setError("Enter an email address to continue.");
      return;
    }

    if (!para) {
      setError("Wallet client is not ready yet.");
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
        throw new Error("No passkey URL was returned. Check that passkeys are enabled for this API key.");
      }

      setPasskeyUrl(loginState.passkeyUrl);
      await completeAuth(para, false);
    } catch (authError) {
      if (!shouldCancel.current) {
        setError(toMessage(authError, "Passkey authentication failed."));
      }
    } finally {
      setIsPending(false);
    }
  }, [completeAuth, email, para]);

  const submitVerificationCode = useCallback(async () => {
    setError(null);

    if (!para) {
      setError("Wallet client is not ready yet.");
      return;
    }

    if (!verificationCode.trim()) {
      setError("Enter the verification code to continue.");
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
        throw new Error("No passkey URL was returned. Check that passkeys are enabled for this API key.");
      }

      setNeedsVerificationCode(false);
      setPasskeyUrl(signupState.passkeyUrl);
      await completeAuth(para, true);
    } catch (verificationError) {
      if (!shouldCancel.current) {
        setError(toMessage(verificationError, "Verification failed."));
      }
    } finally {
      setIsPending(false);
    }
  }, [completeAuth, para, verificationCode]);

  const openPasskeyWindow = useCallback(() => {
    if (!passkeyUrl) return;

    const popup = window.open(passkeyUrl, "CustomPasskeyAuth", "popup,width=460,height=720");
    if (!popup) {
      setError("Allow popups to continue passkey verification.");
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
    setError(null);
    setIsPending(false);
    setIsPasskeyWindowOpen(false);
  }, []);

  const disconnect = useCallback(async () => {
    setIsDisconnecting(true);
    setError(null);

    try {
      if (!para) {
        throw new Error("Wallet client is not ready yet.");
      }

      await para.logout();
      setIsConnected(false);
      setWalletId(null);
      setWalletAddress(null);
      setPasskeyUrl(null);
      setVerifyUrl(null);
      setNeedsVerificationCode(false);
      setVerificationCode("");
    } catch (logoutError) {
      setError(toMessage(logoutError, "Could not disconnect."));
    } finally {
      setIsDisconnecting(false);
    }
  }, [para]);

  return {
    para,
    email,
    error,
    isConnected,
    isDisconnecting,
    isPending,
    isPasskeyWindowOpen,
    isReady,
    needsVerificationCode,
    passkeyUrl,
    verificationCode,
    verifyUrl,
    walletId,
    walletAddress,
    cancel,
    disconnect,
    openPasskeyWindow,
    setEmail,
    setVerificationCode,
    submit,
    submitVerificationCode,
  };
}
