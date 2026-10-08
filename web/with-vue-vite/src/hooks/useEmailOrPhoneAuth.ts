import { onScopeDispose, readonly, ref } from "vue";
import type { AuthenticateWithEmailOrPhoneParams } from "@getpara/web-sdk";
import { para } from "@/lib/para";
import { refreshSession } from "@/hooks/useParaSession";

export type AuthStep = "input" | "verify";

interface VerificationAttempt {
  isCanceled: boolean;
  passkeyPopup: Window | null;
}

function closePasskeyPopup(attempt: VerificationAttempt): void {
  if (attempt.passkeyPopup && !attempt.passkeyPopup.closed) {
    attempt.passkeyPopup.close();
  }
}

function cancelCoreAuthFlow(): void {
  const state = para.getCurrentState();

  if (state.corePhase !== "auth_flow" || state.authPhase === "authenticated") {
    return;
  }

  void para.cancelAuthFlow().catch(() => {});
}

export function useEmailOrPhoneAuth() {
  const step = ref<AuthStep>("input");
  const verifyUrl = ref<string | null>(null);
  const passkeyUrl = ref<string | null>(null);
  const isPending = ref(false);
  const errorMessage = ref<string | null>(null);

  let activeAttempt: VerificationAttempt | null = null;

  function resetStep(): void {
    step.value = "input";
    verifyUrl.value = null;
    passkeyUrl.value = null;
  }

  function endAttempt(attempt: VerificationAttempt): void {
    attempt.isCanceled = true;
    closePasskeyPopup(attempt);
    activeAttempt = null;
  }

  const unsubscribe = para.onStatePhaseChange((snapshot) => {
    if (!activeAttempt || activeAttempt.isCanceled) {
      return;
    }

    const { verificationUrl, passwordUrl, pinUrl, passkeyUrl: nextPasskeyUrl } = snapshot.authStateInfo;
    const frameUrl = verificationUrl ?? passwordUrl ?? pinUrl;

    if (frameUrl) {
      verifyUrl.value = frameUrl;
      step.value = "verify";
    }

    if (nextPasskeyUrl) {
      passkeyUrl.value = nextPasskeyUrl;
      step.value = "verify";
    }
  });

  async function authenticate(auth: AuthenticateWithEmailOrPhoneParams["auth"]): Promise<void> {
    if (activeAttempt) {
      endAttempt(activeAttempt);
    }

    const attempt: VerificationAttempt = { isCanceled: false, passkeyPopup: null };
    activeAttempt = attempt;
    isPending.value = true;
    errorMessage.value = null;
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
      await refreshSession();
      isPending.value = false;
      resetStep();
    } catch (error) {
      if (activeAttempt !== attempt) {
        return;
      }

      closePasskeyPopup(attempt);
      activeAttempt = null;
      isPending.value = false;
      errorMessage.value = error instanceof Error ? error.message : "Authentication failed";
      resetStep();
    }
  }

  function openPasskeyWindow(): void {
    const attempt = activeAttempt;

    if (!attempt || attempt.isCanceled || !passkeyUrl.value) {
      return;
    }

    errorMessage.value = null;

    if (attempt.passkeyPopup && !attempt.passkeyPopup.closed) {
      attempt.passkeyPopup.focus();
      return;
    }

    const popup = window.open(passkeyUrl.value, "ParaPasskey", "popup,width=480,height=760");

    if (!popup) {
      errorMessage.value = "Pop-up blocked. Allow pop-ups for this site, then try again.";
      return;
    }

    attempt.passkeyPopup = popup;
    popup.focus();
  }

  function cancel(): void {
    if (activeAttempt) {
      endAttempt(activeAttempt);
      cancelCoreAuthFlow();
    }

    isPending.value = false;
    errorMessage.value = null;
    resetStep();
  }

  onScopeDispose(() => {
    if (activeAttempt) {
      endAttempt(activeAttempt);
      cancelCoreAuthFlow();
    }

    unsubscribe();
  });

  return {
    step: readonly(step),
    verifyUrl: readonly(verifyUrl),
    passkeyUrl: readonly(passkeyUrl),
    isPending: readonly(isPending),
    errorMessage: readonly(errorMessage),
    authenticate,
    openPasskeyWindow,
    cancel,
  };
}
