import type { TOAuthMethod } from "@getpara/web-sdk";
import { para } from "@/lib/para";

export type OAuthMethod = Exclude<TOAuthMethod, "TELEGRAM" | "FARCASTER">;

const POPUP_BLOCKED_MESSAGE = "Pop-up blocked. Allow pop-ups for this site, then sign in again.";

interface OAuthAttempt {
  isCanceled: boolean;
  lastPopupUrl: string | null;
  popup: Window | null;
  popupClosed: boolean;
  popupObserved: boolean;
  deferredPopupCloseCheck: boolean;
}

function closePopup(attempt: OAuthAttempt) {
  if (attempt.popup && !attempt.popup.closed) {
    attempt.popup.close();
  }
}

function trackPopup(attempt: OAuthAttempt, popup: Window) {
  attempt.popup = popup;
  attempt.popupObserved = true;
  attempt.popupClosed = false;
  attempt.deferredPopupCloseCheck = false;
}

export function useOAuthAuth(onAuthenticated: () => Promise<void>) {
  let activeProvider = $state<OAuthMethod | null>(null);
  let isPending = $state(false);
  let error = $state<string | null>(null);
  let activeAttempt: OAuthAttempt | null = null;

  function reset() {
    activeProvider = null;
    isPending = false;
  }

  function failAttempt(attempt: OAuthAttempt, message: string) {
    attempt.isCanceled = true;
    closePopup(attempt);

    if (activeAttempt === attempt) {
      activeAttempt = null;
      reset();
      error = message;
    }
  }

  $effect(() => {
    const unsubscribe = para.onStatePhaseChange((snapshot) => {
      const attempt = activeAttempt;

      if (!attempt || attempt.isCanceled) {
        return;
      }

      const {
        oauthUrl,
        oauthFullUrl,
        verificationUrl,
        verificationFullUrl,
        passwordUrl,
        passwordFullUrl,
        pinUrl,
        pinFullUrl,
        passkeyUrl,
        passkeyFullUrl,
      } = snapshot.authStateInfo;
      const popupUrl =
        oauthFullUrl ??
        oauthUrl ??
        verificationFullUrl ??
        verificationUrl ??
        passwordFullUrl ??
        passwordUrl ??
        pinFullUrl ??
        pinUrl ??
        passkeyFullUrl ??
        passkeyUrl;

      if (!popupUrl || popupUrl === attempt.lastPopupUrl) {
        return;
      }

      attempt.lastPopupUrl = popupUrl;

      if (attempt.popup && !attempt.popup.closed) {
        attempt.popup.location.href = popupUrl;
        return;
      }

      const popup = window.open(popupUrl, "oauth", "popup=true");

      if (!popup) {
        failAttempt(attempt, POPUP_BLOCKED_MESSAGE);
        return;
      }

      trackPopup(attempt, popup);
    });

    return () => {
      if (activeAttempt) {
        activeAttempt.isCanceled = true;
        closePopup(activeAttempt);
        activeAttempt = null;
      }

      unsubscribe();
    };
  });

  async function authenticate(method: OAuthMethod) {
    if (activeAttempt) {
      activeAttempt.isCanceled = true;
      closePopup(activeAttempt);
    }

    const attempt: OAuthAttempt = {
      isCanceled: false,
      lastPopupUrl: null,
      popup: null,
      popupClosed: false,
      popupObserved: false,
      deferredPopupCloseCheck: false,
    };
    activeAttempt = attempt;
    activeProvider = method;
    isPending = true;
    error = null;

    if (para.isAuthV2Enabled()) {
      const popup = window.open("about:blank", "oauth", "popup=true");

      if (!popup) {
        failAttempt(attempt, POPUP_BLOCKED_MESSAGE);
        return;
      }

      trackPopup(attempt, popup);
    }

    const onPoll = () => {
      if (attempt.popupObserved && (!attempt.popup || attempt.popup.closed)) {
        attempt.popupClosed = true;
      }
    };

    const isCanceled = () => {
      if (attempt.isCanceled) {
        return true;
      }

      if (!attempt.popupClosed || para.getCurrentState().authStateInfo.userId) {
        return false;
      }

      if (!attempt.deferredPopupCloseCheck) {
        attempt.deferredPopupCloseCheck = true;
        return false;
      }

      return true;
    };

    try {
      await para.authenticateWithOAuth({
        method,
        redirectCallbacks: {
          onOAuthPopup: (popup) => {
            if (activeAttempt !== attempt || attempt.isCanceled) {
              if (!popup.closed) {
                popup.close();
              }
              return;
            }

            if (attempt.popup && attempt.popup !== popup && !attempt.popup.closed) {
              attempt.popup.close();
            }

            trackPopup(attempt, popup);
          },
        },
        sessionPollingCallbacks: { onPoll, isCanceled },
        oAuthPollingCallbacks: { onPoll, isCanceled },
      });

      if (activeAttempt !== attempt) {
        return;
      }

      closePopup(attempt);
      activeAttempt = null;
      await onAuthenticated();
      reset();
    } catch (authError) {
      if (activeAttempt !== attempt) {
        return;
      }

      closePopup(attempt);
      activeAttempt = null;
      reset();

      if (!attempt.isCanceled) {
        error = authError instanceof Error ? authError.message : "OAuth authentication failed";
      }
    }
  }

  function cancel() {
    if (activeAttempt) {
      activeAttempt.isCanceled = true;
      closePopup(activeAttempt);
      activeAttempt = null;
    }

    reset();
    error = null;
  }

  return {
    get activeProvider() {
      return activeProvider;
    },
    get isPending() {
      return isPending;
    },
    get error() {
      return error;
    },
    authenticate,
    cancel,
  };
}
