import { writable } from "svelte/store";
import { para } from "@/lib/para";
import { checkAuthentication } from "../account";

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

export const emailAuthStore = writable<EmailAuthState>(initialState);

let shouldCancel = false;

export async function submit(email: string): Promise<void> {
  emailAuthStore.update((s) => ({
    ...s,
    isPending: true,
    error: null,
    email,
  }));
  shouldCancel = false;

  try {
    const authState = await para.signUpOrLogIn({ auth: { email } });

    if (authState.stage === "verify" && authState.loginUrl) {
      // Check if this is a new user (verify stage means new user)
      const isNewUser = true;

      emailAuthStore.update((s) => ({
        ...s,
        step: "verify",
        verifyUrl: authState.loginUrl ?? null,
        isPending: false,
      }));

      // Start waiting for completion in the background
      handleAuthComplete(isNewUser);
    } else if (authState.stage === "login") {
      // Returning user - they'll complete login via passkey/etc
      handleAuthComplete(false);
    }
  } catch (error) {
    emailAuthStore.update((s) => ({
      ...s,
      isPending: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    }));
  }
}

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
      emailAuthStore.update((s) => ({
        ...s,
        error: error instanceof Error ? error.message : "Authentication failed",
      }));
    }
  }
}

export function cancel(): void {
  shouldCancel = true;
  reset();
}

export function reset(): void {
  emailAuthStore.set(initialState);
}
