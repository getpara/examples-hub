import { useState, useCallback } from "react";
import { useEmailAuth, type UseEmailAuthReturn } from "./useEmailAuth";
import { usePhoneAuth, type UsePhoneAuthReturn } from "./usePhoneAuth";
import { useOAuthAuth, type UseOAuthAuthReturn } from "./useOAuthAuth";

export type AuthTab = "email" | "phone" | "social";

export interface UseCombinedAuthReturn {
  // Tab state
  activeTab: AuthTab;
  setActiveTab: (tab: AuthTab) => void;

  // Auth hooks
  email: UseEmailAuthReturn;
  phone: UsePhoneAuthReturn;
  oauth: UseOAuthAuthReturn;

  // Unified state (derived from active tab)
  step: "input" | "verify";
  verifyUrl: string | null;
  error: string | null;
  isPending: boolean;

  // Unified actions
  cancel: () => void;
}

export function useCombinedAuth(): UseCombinedAuthReturn {
  const [activeTab, setActiveTab] = useState<AuthTab>("email");

  const email = useEmailAuth();
  const phone = usePhoneAuth();
  const oauth = useOAuthAuth();

  // Derive unified state from active tab
  const step = activeTab === "email" ? email.step : activeTab === "phone" ? phone.step : "input";

  const verifyUrl = activeTab === "email" ? email.verifyUrl : activeTab === "phone" ? phone.verifyUrl : null;

  const error = activeTab === "email" ? email.error : activeTab === "phone" ? phone.error : oauth.error;

  const isPending = activeTab === "email" ? email.isPending : activeTab === "phone" ? phone.isPending : oauth.isPending;

  // Unified cancel
  const cancel = useCallback(() => {
    if (activeTab === "email") {
      email.cancel();
    } else if (activeTab === "phone") {
      phone.cancel();
    } else {
      oauth.cancel();
    }
  }, [activeTab, email, phone, oauth]);

  return {
    activeTab,
    setActiveTab,
    email,
    phone,
    oauth,
    step,
    verifyUrl,
    error,
    isPending,
    cancel,
  };
}
