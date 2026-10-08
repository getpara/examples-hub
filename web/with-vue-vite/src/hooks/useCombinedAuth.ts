import { computed, ref } from "vue";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { useOAuthAuth } from "@/hooks/useOAuthAuth";
import { usePhoneAuth } from "@/hooks/usePhoneAuth";
import { usePortalCancel } from "@/hooks/usePortalCancel";
import type { AuthTab } from "@/lib/signInOptions";

export function useCombinedAuth() {
  const activeTab = ref<AuthTab>("email");
  const email = useEmailAuth();
  const phone = usePhoneAuth();
  const oauth = useOAuthAuth();

  const step = computed(() =>
    activeTab.value === "email" ? email.step.value : activeTab.value === "phone" ? phone.step.value : "input"
  );

  const verifyUrl = computed(() =>
    activeTab.value === "email" ? email.verifyUrl.value : activeTab.value === "phone" ? phone.verifyUrl.value : null
  );

  const passkeyUrl = computed(() =>
    activeTab.value === "email" ? email.passkeyUrl.value : activeTab.value === "phone" ? phone.passkeyUrl.value : null
  );

  const isPending = computed(() =>
    activeTab.value === "email"
      ? email.isPending.value
      : activeTab.value === "phone"
        ? phone.isPending.value
        : oauth.isPending.value
  );

  const errorMessage = computed(() =>
    activeTab.value === "email"
      ? email.errorMessage.value
      : activeTab.value === "phone"
        ? phone.errorMessage.value
        : oauth.errorMessage.value
  );

  function setActiveTab(tab: AuthTab): void {
    activeTab.value = tab;
  }

  function openPasskeyWindow(): void {
    if (activeTab.value === "email") {
      email.openPasskeyWindow();
    } else if (activeTab.value === "phone") {
      phone.openPasskeyWindow();
    }
  }

  function cancel(): void {
    if (activeTab.value === "email") {
      email.cancel();
    } else if (activeTab.value === "phone") {
      phone.cancel();
    } else {
      oauth.cancel();
    }
  }

  usePortalCancel(() => step.value === "verify", cancel);

  return {
    activeTab,
    setActiveTab,
    email,
    phone,
    oauth,
    step,
    verifyUrl,
    passkeyUrl,
    isPending,
    errorMessage,
    openPasskeyWindow,
    cancel,
  };
}
