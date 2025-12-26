import { ref, readonly } from "vue";
import { para } from "@/lib/para";
import { checkAuthentication } from "../useAccount";

interface EmailAuthState {
  step: "input" | "verify";
  email: string;
  verifyUrl: string | null;
  isPending: boolean;
  error: string | null;
}

const initialState: EmailAuthState = {
  step: "input",
  email: "",
  verifyUrl: null,
  isPending: false,
  error: null,
};

const state = ref<EmailAuthState>({ ...initialState });

let shouldCancel = false;

async function handleAuthComplete(isNewUser: boolean): Promise<void> {
  try {
    if (isNewUser) {
      await para.waitForWalletCreation({
        isCanceled: () => shouldCancel,
      });
    } else {
      const result = await para.waitForLogin({
        isCanceled: () => shouldCancel,
      });
      if (result.needsWallet) {
        await para.waitForWalletCreation({
          isCanceled: () => shouldCancel,
        });
      }
    }
    await checkAuthentication();
    reset();
  } catch (error) {
    if (!shouldCancel) {
      state.value = {
        ...state.value,
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    }
  }
}

async function submit(email: string): Promise<void> {
  state.value = {
    ...state.value,
    isPending: true,
    error: null,
    email,
  };
  shouldCancel = false;

  try {
    const authState = await para.signUpOrLogIn({ auth: { email } });

    if (authState.stage === "verify" && authState.loginUrl) {
      // verify stage means new user
      const isNewUser = true;

      state.value = {
        ...state.value,
        step: "verify",
        verifyUrl: authState.loginUrl ?? null,
        isPending: false,
      };

      // Start waiting for completion in the background
      handleAuthComplete(isNewUser);
    } else if (authState.stage === "login") {
      // Returning user - they'll complete login via passkey/etc
      handleAuthComplete(false);
    }
  } catch (error) {
    state.value = {
      ...state.value,
      isPending: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    };
  }
}

function cancel(): void {
  shouldCancel = true;
  reset();
}

function reset(): void {
  state.value = { ...initialState };
}

export function useEmailAuth() {
  return {
    state: readonly(state),
    submit,
    cancel,
    reset,
  };
}
