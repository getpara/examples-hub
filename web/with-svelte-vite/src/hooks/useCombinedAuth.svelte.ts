import { useEmailAuth } from "@/hooks/useEmailAuth.svelte.js";
import type { AuthStep } from "@/hooks/useEmailOrPhoneAuth.svelte.js";
import { useOAuthAuth } from "@/hooks/useOAuthAuth.svelte.js";
import { usePhoneAuth } from "@/hooks/usePhoneAuth.svelte.js";
import { usePortalCancel } from "@/hooks/usePortalCancel.svelte.js";

export type AuthTab = "email" | "phone" | "social";

export type CombinedAuth = ReturnType<typeof useCombinedAuth>;

export function useCombinedAuth(onAuthenticated: () => Promise<void>) {
  let activeTab = $state<AuthTab>("email");
  const email = useEmailAuth(onAuthenticated);
  const phone = usePhoneAuth(onAuthenticated);
  const oauth = useOAuthAuth(onAuthenticated);

  const step = $derived<AuthStep>(activeTab === "email" ? email.step : activeTab === "phone" ? phone.step : "input");
  const verifyUrl = $derived(activeTab === "email" ? email.verifyUrl : activeTab === "phone" ? phone.verifyUrl : null);
  const passkeyUrl = $derived(
    activeTab === "email" ? email.passkeyUrl : activeTab === "phone" ? phone.passkeyUrl : null
  );
  const error = $derived(activeTab === "email" ? email.error : activeTab === "phone" ? phone.error : oauth.error);
  const isPending = $derived(
    activeTab === "email" ? email.isPending : activeTab === "phone" ? phone.isPending : oauth.isPending
  );

  function openPasskeyWindow() {
    if (activeTab === "email") {
      email.openPasskeyWindow();
    } else if (activeTab === "phone") {
      phone.openPasskeyWindow();
    }
  }

  function cancel() {
    if (activeTab === "email") {
      email.cancel();
    } else if (activeTab === "phone") {
      phone.cancel();
    } else {
      oauth.cancel();
    }
  }

  usePortalCancel(() => step === "verify" && verifyUrl !== null, cancel);

  return {
    get activeTab() {
      return activeTab;
    },
    setActiveTab: (tab: AuthTab) => {
      activeTab = tab;
    },
    email,
    phone,
    oauth,
    get step() {
      return step;
    },
    get verifyUrl() {
      return verifyUrl;
    },
    get passkeyUrl() {
      return passkeyUrl;
    },
    get error() {
      return error;
    },
    get isPending() {
      return isPending;
    },
    openPasskeyWindow,
    cancel,
  };
}
