import { useState, useCallback } from "react";
import { useEmailAuth, type UseEmailAuthReturn } from "./useEmailAuth";
import { usePhoneAuth, type UsePhoneAuthReturn } from "./usePhoneAuth";
import { useOAuthAuth, type UseOAuthAuthReturn } from "./useOAuthAuth";
import type { AuthTab } from "@/types/auth";

export interface UseCombinedAuthReturn {
  activeTab: AuthTab;
  setActiveTab: (tab: AuthTab) => void;
  email: UseEmailAuthReturn;
  phone: UsePhoneAuthReturn;
  oauth: UseOAuthAuthReturn;
  step: "input" | "verify";
  verifyUrl: string | null;
  error: string | null;
  isPending: boolean;
  cancel: () => void;
}

export function useCombinedAuth(): UseCombinedAuthReturn {
  const [activeTab, setActiveTab] = useState<AuthTab>("email");

  const email = useEmailAuth();
  const phone = usePhoneAuth();
  const oauth = useOAuthAuth();
  const cancelEmail = email.cancel;
  const cancelPhone = phone.cancel;
  const cancelOAuth = oauth.cancel;

  const step = activeTab === "email" ? email.step : activeTab === "phone" ? phone.step : "input";

  const verifyUrl = activeTab === "email" ? email.verifyUrl : activeTab === "phone" ? phone.verifyUrl : null;

  const error = activeTab === "email" ? email.error : activeTab === "phone" ? phone.error : oauth.error;

  const isPending = activeTab === "email" ? email.isPending : activeTab === "phone" ? phone.isPending : oauth.isPending;

  const cancel = useCallback(() => {
    if (activeTab === "email") {
      cancelEmail();
    } else if (activeTab === "phone") {
      cancelPhone();
    } else {
      cancelOAuth();
    }
  }, [activeTab, cancelEmail, cancelPhone, cancelOAuth]);

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
