import type { AuthenticateWithEmailOrPhoneParams } from "@getpara/web-sdk";
import { para } from "@/lib/para";

export type AuthStep = "input" | "verify";

interface VerificationAttempt {
  isCanceled: boolean;
  passkeyPopup: Window | null;
}

function closePasskeyPopup(attempt: VerificationAttempt) {
  if (attempt.passkeyPopup && !attempt.passkeyPopup.closed) {
    attempt.passkeyPopup.close();
  }
}

function cancelCoreAuthFlow() {
  const state = para.getCurrentState();

  if (state.corePhase !== "auth_flow" || state.authPhase === "authenticated") {
    return;
  }

  void para.cancelAuthFlow().catch(() => {});
}

export function useEmailOrPhoneAuth(onAuthenticated: () => Promise<void>) {
  let step = $state<AuthStep>("input");
  let verifyUrl = $state<string | null>(null);
  let passkeyUrl = $state<string | null>(null);
  let isPending = $state(false);
  let error = $state<string | null>(null);
  let activeAttempt: VerificationAttempt | null = null;

  function resetStep() {
    step = "input";
    verifyUrl = null;
    passkeyUrl = null;
  }

  function endAttempt(attempt: VerificationAttempt) {
    attempt.isCanceled = true;
    closePasskeyPopup(attempt);
    activeAttempt = null;
  }

  $effect(() => {
    const unsubscribe = para.onStatePhaseChange((snapshot) => {
      if (!activeAttempt || activeAttempt.isCanceled) {
        return;
      }

      const { verificationUrl, passwordUrl, pinUrl, passkeyUrl: nextPasskeyUrl } = snapshot.authStateInfo;
      const frameUrl = verificationUrl ?? passwordUrl ?? pinUrl;

      if (frameUrl) {
        verifyUrl = frameUrl;
        step = "verify";
      }

      if (nextPasskeyUrl) {
        passkeyUrl = nextPasskeyUrl;
        step = "verify";
      }
    });

    return () => {
      if (activeAttempt) {
        endAttempt(activeAttempt);
        cancelCoreAuthFlow();
      }

      unsubscribe();
    };
  });

  async function authenticate(auth: AuthenticateWithEmailOrPhoneParams["auth"]) {
    if (activeAttempt) {
      endAttempt(activeAttempt);
    }

    const attempt: VerificationAttempt = { isCanceled: false, passkeyPopup: null };
    activeAttempt = attempt;
    isPending = true;
    error = null;
    resetStep();

    try {
      await para.authenticateWithEmailOrPhone({
        auth,
        sessionPollingCallbacks: { isCanceled: () => attempt.isCanceled },
      });

      if (activeAttempt !== attempt) {
        return;
      }

      closePasskeyPopup(attempt);
      activeAttempt = null;
      await onAuthenticated();
      isPending = false;
      resetStep();
    } catch (authError) {
      if (activeAttempt !== attempt) {
        return;
      }

      closePasskeyPopup(attempt);
      activeAttempt = null;
      isPending = false;
      error = authError instanceof Error ? authError.message : "Authentication failed";
      resetStep();
    }
  }

  function openPasskeyWindow() {
    const attempt = activeAttempt;

    if (!attempt || attempt.isCanceled || !passkeyUrl) {
      return;
    }

    error = null;

    if (attempt.passkeyPopup && !attempt.passkeyPopup.closed) {
      attempt.passkeyPopup.focus();
      return;
    }

    const popup = window.open(passkeyUrl, "ParaPasskey", "popup,width=480,height=760");

    if (!popup) {
      error = "Pop-up blocked. Allow pop-ups for this site, then try again.";
      return;
    }

    attempt.passkeyPopup = popup;
    popup.focus();
  }

  function cancel() {
    if (activeAttempt) {
      endAttempt(activeAttempt);
      cancelCoreAuthFlow();
    }

    isPending = false;
    error = null;
    resetStep();
  }

  return {
    get step() {
      return step;
    },
    get verifyUrl() {
      return verifyUrl;
    },
    get passkeyUrl() {
      return passkeyUrl;
    },
    get isPending() {
      return isPending;
    },
    get error() {
      return error;
    },
    authenticate,
    openPasskeyWindow,
    cancel,
  };
}
