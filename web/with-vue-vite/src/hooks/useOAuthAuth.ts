import { onScopeDispose, readonly, ref } from "vue";
import { para } from "@/lib/para";
import { refreshSession } from "@/hooks/useParaSession";
import type { OAuthProviderId } from "@/lib/signInOptions";

const POPUP_BLOCKED_MESSAGE = "Pop-up blocked. Allow pop-ups for this site, then sign in again.";

interface OAuthAttempt {
  isCanceled: boolean;
  lastPopupUrl: string | null;
  popup: Window | null;
  popupClosed: boolean;
  popupObserved: boolean;
  deferredPopupCloseCheck: boolean;
}

function closePopup(attempt: OAuthAttempt): void {
  if (attempt.popup && !attempt.popup.closed) {
    attempt.popup.close();
  }
}

function trackPopup(attempt: OAuthAttempt, popup: Window): void {
  attempt.popup = popup;
  attempt.popupObserved = true;
  attempt.popupClosed = false;
  attempt.deferredPopupCloseCheck = false;
}

export function useOAuthAuth() {
  const activeProvider = ref<OAuthProviderId | null>(null);
  const isPending = ref(false);
  const errorMessage = ref<string | null>(null);

  let activeAttempt: OAuthAttempt | null = null;

  function reset(): void {
    activeProvider.value = null;
    isPending.value = false;
  }

  function failAttempt(attempt: OAuthAttempt, message: string): void {
    attempt.isCanceled = true;
    closePopup(attempt);

    if (activeAttempt === attempt) {
      activeAttempt = null;
      reset();
      errorMessage.value = message;
    }
  }

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

  async function authenticate(provider: OAuthProviderId): Promise<void> {
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
    activeProvider.value = provider;
    isPending.value = true;
    errorMessage.value = null;

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
        method: provider,
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
      await refreshSession();
      reset();
    } catch (error) {
      if (activeAttempt !== attempt) {
        return;
      }

      closePopup(attempt);
      activeAttempt = null;
      reset();

      if (!attempt.isCanceled) {
        errorMessage.value = error instanceof Error ? error.message : "OAuth authentication failed";
      }
    }
  }

  function cancel(): void {
    if (activeAttempt) {
      activeAttempt.isCanceled = true;
      closePopup(activeAttempt);
      activeAttempt = null;
    }

    reset();
    errorMessage.value = null;
  }

  onScopeDispose(() => {
    cancel();
    unsubscribe();
  });

  return {
    activeProvider: readonly(activeProvider),
    isPending: readonly(isPending),
    errorMessage: readonly(errorMessage),
    authenticate,
    cancel,
  };
}
