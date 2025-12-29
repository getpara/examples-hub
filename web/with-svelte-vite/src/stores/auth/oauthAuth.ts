import { writable } from "svelte/store";
import { para } from "@/lib/para";
import { checkAuthentication } from "../account";
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

export const oauthAuthStore = writable<OAuthAuthState>(initialState);

let shouldCancel = false;
let popupWindow: Window | null = null;

export async function authenticate(provider: TOAuthMethod): Promise<void> {
  oauthAuthStore.update((s) => ({
    ...s,
    step: "pending",
    isPending: true,
    error: null,
    provider,
  }));
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
    oauthAuthStore.update((s) => ({
      ...s,
      step: "input",
      isPending: false,
      error: error instanceof Error ? error.message : "OAuth authentication failed",
      provider: null,
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
      oauthAuthStore.update((s) => ({
        ...s,
        error: error instanceof Error ? error.message : "Authentication failed",
      }));
    }
  }
}

export function cancel(): void {
  shouldCancel = true;
  popupWindow?.close();
  reset();
}

export function reset(): void {
  oauthAuthStore.set(initialState);
  popupWindow = null;
}
