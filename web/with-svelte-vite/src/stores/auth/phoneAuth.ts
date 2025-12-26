import { writable } from "svelte/store";
import { para } from "@/lib/para";
import { checkAuthentication } from "../account";

interface PhoneAuthState {
  step: "input" | "verify";
  countryCode: string;
  phoneNumber: string;
  verifyUrl: string | null;
  isPending: boolean;
  error: string | null;
}

const initialState: PhoneAuthState = {
  step: "input",
  countryCode: "+1",
  phoneNumber: "",
  verifyUrl: null,
  isPending: false,
  error: null,
};

export const phoneAuthStore = writable<PhoneAuthState>(initialState);

let shouldCancel = false;

export async function submit(
  phoneNumber: string,
  countryCode: string
): Promise<void> {
  phoneAuthStore.update((s) => ({
    ...s,
    isPending: true,
    error: null,
    phoneNumber,
    countryCode,
  }));
  shouldCancel = false;

  try {
    // Format phone number: remove non-digits and combine with country code
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    const fullPhoneNumber = `${countryCode}${cleanNumber}` as `+${number}`;

    const authState = await para.signUpOrLogIn({
      auth: { phone: fullPhoneNumber },
    });

    if (authState.stage === "verify" && authState.loginUrl) {
      // Check nextStage to determine if user needs signup (new) or login (returning)
      const isNewUser = authState.nextStage === "signup";

      phoneAuthStore.update((s) => ({
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
    phoneAuthStore.update((s) => ({
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
      phoneAuthStore.update((s) => ({
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
  phoneAuthStore.set(initialState);
}
