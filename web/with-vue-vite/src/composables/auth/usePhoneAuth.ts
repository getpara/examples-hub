import { ref, readonly } from "vue";
import { para } from "@/lib/para";
import { checkAuthentication } from "../useAccount";

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

const state = ref<PhoneAuthState>({ ...initialState });

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

async function submit(phoneNumber: string, countryCode: string): Promise<void> {
  state.value = {
    ...state.value,
    isPending: true,
    error: null,
    phoneNumber,
    countryCode,
  };
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

export function usePhoneAuth() {
  return {
    state: readonly(state),
    submit,
    cancel,
    reset,
  };
}
