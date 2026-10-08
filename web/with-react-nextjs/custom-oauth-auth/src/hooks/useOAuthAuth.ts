import { useState, useRef, useCallback, useEffect } from "react";
import { useAuthenticateWithOAuth, useClient, type TOAuthMethod } from "@getpara/react-sdk";

export interface UseOAuthAuthReturn {
  activeProvider: TOAuthMethod | null;
  error: string | null;
  isPending: boolean;
  authenticate: (method: TOAuthMethod) => void;
  cancel: () => void;
}

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

export function useOAuthAuth(): UseOAuthAuthReturn {
  const para = useClient();
  const [activeProvider, setActiveProvider] = useState<TOAuthMethod | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { authenticateWithOAuthAsync, isPending } = useAuthenticateWithOAuth();
  const activeAttempt = useRef<OAuthAttempt | null>(null);

  const resetState = useCallback(() => {
    setActiveProvider(null);
  }, []);

  useEffect(() => {
    if (!para) return;

    const unsubscribe = para.onStatePhaseChange(snapshot => {
      const attempt = activeAttempt.current;
      if (!attempt || attempt.isCanceled) return;

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

      if (!popupUrl || popupUrl === attempt.lastPopupUrl) return;

      attempt.lastPopupUrl = popupUrl;
      if (attempt.popup && !attempt.popup.closed) {
        attempt.popup.location.href = popupUrl;
        return;
      }

      const popup = window.open(popupUrl, "oauth", "popup=true");
      if (!popup) {
        attempt.isCanceled = true;
        if (activeAttempt.current === attempt) {
          activeAttempt.current = null;
          resetState();
          setError("Pop-up blocked. Allow pop-ups for this site, then sign in again.");
        }
        return;
      }

      attempt.popup = popup;
      attempt.popupObserved = true;
      attempt.popupClosed = false;
      attempt.deferredPopupCloseCheck = false;
    });

    return () => {
      const attempt = activeAttempt.current;
      if (attempt) {
        attempt.isCanceled = true;
        closePopup(attempt);
        activeAttempt.current = null;
      }
      unsubscribe();
    };
  }, [para, resetState]);

  const authenticate = useCallback(
    (method: TOAuthMethod) => {
      const previousAttempt = activeAttempt.current;
      if (previousAttempt) {
        previousAttempt.isCanceled = true;
        closePopup(previousAttempt);
      }

      const attempt: OAuthAttempt = {
        isCanceled: false,
        lastPopupUrl: null,
        popup: null,
        popupClosed: false,
        popupObserved: false,
        deferredPopupCloseCheck: false,
      };
      activeAttempt.current = attempt;
      setError(null);
      setActiveProvider(method);

      if (para?.isAuthV2Enabled()) {
        const popup = window.open("about:blank", "oauth", "popup=true");
        if (!popup) {
          attempt.isCanceled = true;
          activeAttempt.current = null;
          resetState();
          setError("Pop-up blocked. Allow pop-ups for this site, then sign in again.");
          return;
        }

        attempt.popup = popup;
        attempt.popupObserved = true;
      }

      const onPoll = () => {
        if (attempt.popupObserved && (!attempt.popup || attempt.popup.closed)) {
          attempt.popupClosed = true;
        }
      };
      const isPopupCanceled = () => {
        if (attempt.isCanceled) return true;
        if (!attempt.popupClosed) return false;
        if (para?.getCurrentState().authStateInfo.userId) return false;
        if (!attempt.deferredPopupCloseCheck) {
          attempt.deferredPopupCloseCheck = true;
          return false;
        }
        return true;
      };

      void authenticateWithOAuthAsync({
        method,
        redirectCallbacks: {
          onOAuthPopup: popup => {
            if (activeAttempt.current !== attempt || attempt.isCanceled) {
              if (!popup.closed) popup.close();
              return;
            }

            if (attempt.popup && attempt.popup !== popup && !attempt.popup.closed) {
              attempt.popup.close();
            }
            attempt.popup = popup;
            attempt.popupObserved = true;
            attempt.popupClosed = false;
            attempt.deferredPopupCloseCheck = false;
          },
        },
        sessionPollingCallbacks: {
          onPoll,
          isCanceled: isPopupCanceled,
        },
        oAuthPollingCallbacks: {
          onPoll,
          isCanceled: isPopupCanceled,
        },
      })
        .then(() => {
          if (activeAttempt.current !== attempt) return;

          closePopup(attempt);
          activeAttempt.current = null;
          resetState();
        })
        .catch(authError => {
          if (activeAttempt.current !== attempt) return;

          closePopup(attempt);
          activeAttempt.current = null;
          if (!attempt.isCanceled) {
            setError(authError instanceof Error ? authError.message : "Authentication failed");
            resetState();
          }
        });
    },
    [authenticateWithOAuthAsync, para, resetState]
  );

  const cancel = useCallback(() => {
    const attempt = activeAttempt.current;
    if (attempt) {
      attempt.isCanceled = true;
      closePopup(attempt);
      activeAttempt.current = null;
    }
    resetState();
    setError(null);
  }, [resetState]);

  return {
    activeProvider,
    error,
    isPending,
    authenticate,
    cancel,
  };
}
