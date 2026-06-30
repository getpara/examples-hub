import { useCallback, useEffect, useRef, useState } from "react";
import type { StateSnapshot } from "@getpara/web-sdk";
import { useAuthenticateWithOAuth, useClient, useParaStatus } from "@getpara/react-sdk";

function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

// Derive the progress message from the SDK's LIVE auth phase rather than hand-setting it at a
// few call sites. This keeps the copy accurate at every step and — importantly — resets to idle
// on logout instead of leaving a stale "Authenticated" behind.
function statusForPhase(snapshot: StateSnapshot): string {
  // The passkey credential step can surface during processing; show it with priority.
  if (snapshot.authStateInfo.passkeyUrl) return "Create a passkey to secure your wallet…";
  switch (snapshot.authPhase) {
    case "authenticating_oauth":
      return "Opening sign-in window…";
    case "processing_authentication":
      return "Verifying your sign-in…";
    case "awaiting_2fa_enrollment":
      return "Set up two-factor authentication to continue…";
    case "awaiting_2fa":
      return "Enter your two-factor code to continue…";
    case "resolving_2fa":
      return "Confirming two-factor…";
    case "awaiting_session_start":
    case "waiting_for_session":
      return "Setting up your wallet…";
    case "verifying_new_account":
      return "Finishing account setup…";
    default:
      // uninitialized / checking_state / clearing_state / unauthenticated / authenticated / error
      // → no progress text (the button or the wallet UI is what's showing).
      return "";
  }
}

export interface UseOidcAuthReturn {
  isReady: boolean;
  isPending: boolean;
  status: string;
  error: string | null;
  signIn: () => Promise<void>;
}

// Drives Custom OIDC sign-in through the react-sdk: the provider owns the client
// lifecycle, useAuthenticateWithOAuth runs the CUSTOM_OIDC handshake, and a single state
// subscription surfaces both the passkey popup the SDK requests mid-flow and the live status.
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
  }, []);

  // Single source of truth for progress + errors: the SDK's live auth state. Catches the passkey
  // URL the SDK surfaces mid-flow AND keeps the status text in lockstep with the real phase, so
  // it follows the user back to idle on logout.
  useEffect(() => {
    if (!para) return;
    const unsubscribe = para.onStatePhaseChange((snapshot: StateSnapshot) => {
      const { passkeyUrl } = snapshot.authStateInfo;
      if (passkeyUrl) openCredentialPopup(passkeyUrl);
      if (snapshot.error) setError(snapshot.error.message);
      setStatus(statusForPhase(snapshot));
    });
    return () => {
      unsubscribe();
      oauthPopup.current?.close();
      credentialPopup.current?.close();
    };
  }, [para, openCredentialPopup]);

  const signIn = useCallback(async () => {
    setError(null);
    // Immediate feedback on click; the subscription above takes over once the SDK advances.
    setStatus("Opening sign-in window…");
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
      // No success status here — the phase subscription clears it as the flow reaches
      // `authenticated` (and the wallet UI takes over). Setting "Authenticated" here was the
      // bug: it fired even when the flow paused at the 2FA step, and never reset on logout.
    } catch (authError) {
      setError(toMessage(authError, "Sign-in failed."));
      setStatus("");
    }
  }, [authenticateWithOAuthAsync]);

  return { isReady, isPending, status, error, signIn };
}
