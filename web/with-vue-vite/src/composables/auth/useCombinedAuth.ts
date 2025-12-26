import { ref, computed } from "vue";
import { useEmailAuth } from "./useEmailAuth";
import { usePhoneAuth } from "./usePhoneAuth";
import { useOAuthAuth } from "./useOAuthAuth";

export type AuthTab = "email" | "phone" | "social";

const activeTab = ref<AuthTab>("email");

export function useCombinedAuth() {
  const email = useEmailAuth();
  const phone = usePhoneAuth();
  const oauth = useOAuthAuth();

  // Derive step based on active tab
  const step = computed(() => {
    if (activeTab.value === "email") {
      return email.state.value.step;
    }
    if (activeTab.value === "phone") {
      return phone.state.value.step;
    }
    // social tab
    return oauth.state.value.step === "pending" ? "verify" : "input";
  });

  // Derive verifyUrl based on active tab (only email/phone have verify URLs)
  const verifyUrl = computed(() => {
    if (activeTab.value === "email") {
      return email.state.value.verifyUrl;
    }
    if (activeTab.value === "phone") {
      return phone.state.value.verifyUrl;
    }
    return null;
  });

  // Derive isPending based on active tab
  const isPending = computed(() => {
    if (activeTab.value === "email") {
      return email.state.value.isPending;
    }
    if (activeTab.value === "phone") {
      return phone.state.value.isPending;
    }
    return oauth.state.value.isPending;
  });

  // Derive error based on active tab
  const error = computed(() => {
    if (activeTab.value === "email") {
      return email.state.value.error;
    }
    if (activeTab.value === "phone") {
      return phone.state.value.error;
    }
    return oauth.state.value.error;
  });

  // Cancel the current auth flow based on active tab
  function cancel(): void {
    if (activeTab.value === "email") {
      email.cancel();
    } else if (activeTab.value === "phone") {
      phone.cancel();
    } else {
      oauth.cancel();
    }
  }

  // Reset all auth states
  function resetAll(): void {
    email.reset();
    phone.reset();
    oauth.reset();
    activeTab.value = "email";
  }

  return {
    activeTab,
    step,
    verifyUrl,
    isPending,
    error,
    email,
    phone,
    oauth,
    cancel,
    resetAll,
  };
}
