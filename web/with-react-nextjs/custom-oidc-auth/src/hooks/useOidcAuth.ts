import { useCallback, useEffect, useRef, useState } from "react";
import type { StateSnapshot } from "@getpara/react-sdk";
import { useAuthenticateWithOAuth, useClient, useParaStatus } from "@getpara/react-sdk";

type AuthPhase = StateSnapshot["authPhase"];

export function useOidcAuth() {
  const para = useClient();
  const { isReady } = useParaStatus();
  const { authenticateWithOAuthAsync, isPending } = useAuthenticateWithOAuth();

  const [authPhase, setAuthPhase] = useState<AuthPhase | null>(null);
  const [hasPasskeyUrl, setHasPasskeyUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const oauthPopup = useRef<Window | null>(null);
  const credentialPopup = useRef<Window | null>(null);
  const lastCredentialUrl = useRef<string | null>(null);

  const openCredentialPopup = useCallback((url: string) => {
    if (url === lastCredentialUrl.current) return;
    lastCredentialUrl.current = url;
    const popup = window.open(url, "ParaPasskey", "popup,width=480,height=760");
    if (!popup) {
      lastCredentialUrl.current = null;
      setError("Popup blocked. Allow popups for this site, then sign in again.");
      return;
    }
    credentialPopup.current = popup;
  }, []);

  useEffect(() => {
    if (!para) return;
    const unsubscribe = para.onStatePhaseChange((snapshot: StateSnapshot) => {
      const { passkeyUrl } = snapshot.authStateInfo;
      if (passkeyUrl) openCredentialPopup(passkeyUrl);
      if (snapshot.error) setError(snapshot.error.message);
      setAuthPhase(snapshot.authPhase);
      setHasPasskeyUrl(Boolean(passkeyUrl));
    });
    return () => {
      unsubscribe();
      oauthPopup.current?.close();
      credentialPopup.current?.close();
    };
  }, [para, openCredentialPopup]);

  const signIn = useCallback(async () => {
    setError(null);
    setAuthPhase("authenticating_oauth");
    try {
      await authenticateWithOAuthAsync({
        method: "CUSTOM_OIDC",
        useShortUrls: true,
        redirectCallbacks: {
          onOAuthPopup: (popup: Window) => {
            oauthPopup.current = popup;
          },
        },
        oAuthPollingCallbacks: {
          onPoll: () => {
            if (oauthPopup.current?.closed) oauthPopup.current = null;
          },
        },
      });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Sign-in failed.");
      setAuthPhase(null);
    }
  }, [authenticateWithOAuthAsync]);

  return { isReady, isPending, authPhase, hasPasskeyUrl, error, signIn };
}

export type UseOidcAuthReturn = ReturnType<typeof useOidcAuth>;
