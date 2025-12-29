import { ref, readonly } from "vue";
import { para } from "@/lib/para";
import { checkAuthentication } from "../useAccount";
import type { TOAuthMethod } from "@getpara/web-sdk";

interface OAuthAuthState {
  step: "input" | "pending";
  provider: TOAuthMethod | null;
  isPending: boolean;
  error: string | null;
}

const initialState: OAuthAuthState = {
  step: "input",
  provider: null,
  isPending: false,
  error: null,
};

const state = ref<OAuthAuthState>({ ...initialState });

let shouldCancel = false;
let popupWindow: Window | null = null;

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

async function authenticate(provider: TOAuthMethod): Promise<void> {
  state.value = {
    ...state.value,
    step: "pending",
    isPending: true,
    error: null,
    provider,
  };
  shouldCancel = false;

  try {
    if (provider === "FARCASTER") {
      const authState = await para.verifyFarcaster({
        onConnectUri: (url) => {
          popupWindow = window.open(url, "farcaster", "popup=true");
        },
        isCanceled: () => shouldCancel || (popupWindow?.closed ?? false),
      });

      if (authState.stage === "done") {
        await handleAuthComplete(authState.isNewUser ?? false);
      }
    } else {
      const authState = await para.verifyOAuth({
        method: provider as Exclude<TOAuthMethod, "TELEGRAM" | "FARCASTER">,
        onOAuthUrl: (url) => {
          popupWindow = window.open(url, "oauth", "popup=true");
        },
        isCanceled: () => shouldCancel || (popupWindow?.closed ?? false),
      });

      if (authState.stage === "done") {
        await handleAuthComplete(authState.isNewUser ?? false);
      }
    }
  } catch (error) {
    state.value = {
      ...state.value,
      step: "input",
      isPending: false,
      error: error instanceof Error ? error.message : "OAuth authentication failed",
      provider: null,
    };
  }
}

function cancel(): void {
  shouldCancel = true;
  popupWindow?.close();
  reset();
}

function reset(): void {
  state.value = { ...initialState };
  popupWindow = null;
}

export function useOAuthAuth() {
  return {
    state: readonly(state),
    authenticate,
    cancel,
    reset,
  };
}
