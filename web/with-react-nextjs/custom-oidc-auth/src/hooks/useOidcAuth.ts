import { useCallback, useEffect, useRef, useState } from "react";
import type { StateSnapshot } from "@getpara/web-sdk";
import { useAuthenticateWithOAuth, useClient, useParaStatus } from "@getpara/react-sdk";

function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export interface UseOidcAuthReturn {
  isReady: boolean;
  isPending: boolean;
  status: string;
  error: string | null;
  signIn: () => Promise<void>;
}

// Drives Custom OIDC sign-in through the react-sdk: the provider owns the client
// lifecycle, useAuthenticateWithOAuth runs the CUSTOM_OIDC handshake, and a state
// subscription surfaces the passkey popup the SDK requests mid-flow.
export function useOidcAuth(): UseOidcAuthReturn {
  const para = useClient();
  const { isReady } = useParaStatus();
  const { authenticateWithOAuthAsync, isPending } = useAuthenticateWithOAuth();

  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const oauthPopup = useRef<Window | null>(null);
  const credentialPopup = useRef<Window | null>(null);
  const lastCredentialUrl = useRef<string | null>(null);

  // WebAuthn can't run in an iframe, so the credential step is a popup. This fires during
  // SDK polling (outside a click), so a blocked popup is surfaced as an error.
  const openCredentialPopup = useCallback((url: string) => {
    if (url === lastCredentialUrl.current) return;
    lastCredentialUrl.current = url;
    const popup = window.open(url, "ParaPasskey", "popup,width=480,height=760");
    if (!popup) {
      lastCredentialUrl.current = null;
      setError("Popup blocked — allow popups for this site, then sign in again.");
      return;
    }
    credentialPopup.current = popup;
    setStatus("Create a passkey to secure your wallet…");
  }, []);

  // The provider subscribes to client state for its own bookkeeping; we add a second
  // subscriber purely to catch the passkey URL the SDK surfaces during the OIDC flow.
  useEffect(() => {
    if (!para) return;
    const unsubscribe = para.onStatePhaseChange((snapshot: StateSnapshot) => {
      const { passkeyUrl } = snapshot.authStateInfo;
      if (passkeyUrl) openCredentialPopup(passkeyUrl);
      if (snapshot.error) setError(snapshot.error.message);
    });
    return () => {
      unsubscribe();
      oauthPopup.current?.close();
      credentialPopup.current?.close();
    };
  }, [para, openCredentialPopup]);

  const signIn = useCallback(async () => {
    setError(null);
    setStatus("Opening OIDC provider…");
    try {
      // One call drives the OAuth handoff, session polling, and (for a new user) wallet
      // creation. The SDK opens the OAuth popup and hands it back via onOAuthPopup.
      await authenticateWithOAuthAsync({
        method: "CUSTOM_OIDC" as never, // cast until @getpara/shared TOAuthMethod publishes CUSTOM_OIDC
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
      setStatus("Authenticated");
    } catch (authError) {
      setError(toMessage(authError, "Sign-in failed."));
      setStatus("");
    }
  }, [authenticateWithOAuthAsync]);

  return { isReady, isPending, status, error, signIn };
}
