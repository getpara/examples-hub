import { derived, writable, get } from "svelte/store";
import { emailAuthStore, cancel as cancelEmail } from "./emailAuth";
import { phoneAuthStore, cancel as cancelPhone } from "./phoneAuth";
import { oauthAuthStore, cancel as cancelOAuth } from "./oauthAuth";

export type AuthTab = "email" | "phone" | "social";

export const activeTab = writable<AuthTab>("email");

// Derive step based on active tab
export const step = derived(
  [activeTab, emailAuthStore, phoneAuthStore, oauthAuthStore],
  ([$tab, $email, $phone, $oauth]) => {
    switch ($tab) {
      case "email":
        return $email.step;
      case "phone":
        return $phone.step;
      case "social":
        return $oauth.step === "pending" ? "verify" : "input";
      default:
        return "input";
    }
  }
);

// Derive verifyUrl based on active tab (only email/phone have verify URLs)
export const verifyUrl = derived(
  [activeTab, emailAuthStore, phoneAuthStore],
  ([$tab, $email, $phone]) => {
    switch ($tab) {
      case "email":
        return $email.verifyUrl;
      case "phone":
        return $phone.verifyUrl;
      default:
        return null;
    }
  }
);

// Derive isPending based on active tab
export const isPending = derived(
  [activeTab, emailAuthStore, phoneAuthStore, oauthAuthStore],
  ([$tab, $email, $phone, $oauth]) => {
    switch ($tab) {
      case "email":
        return $email.isPending;
      case "phone":
        return $phone.isPending;
      case "social":
        return $oauth.isPending;
      default:
        return false;
    }
  }
);

// Derive error based on active tab
export const error = derived(
  [activeTab, emailAuthStore, phoneAuthStore, oauthAuthStore],
  ([$tab, $email, $phone, $oauth]) => {
    switch ($tab) {
      case "email":
        return $email.error;
      case "phone":
        return $phone.error;
      case "social":
        return $oauth.error;
      default:
        return null;
    }
  }
);

// Cancel the current auth flow based on active tab
export function cancel(): void {
  const currentTab = get(activeTab);

  if (currentTab === "email") {
    cancelEmail();
  } else if (currentTab === "phone") {
    cancelPhone();
  } else if (currentTab === "social") {
    cancelOAuth();
  }
}

// Reset all auth stores
export function resetAll(): void {
  cancelEmail();
  cancelPhone();
  cancelOAuth();
  activeTab.set("email");
}
