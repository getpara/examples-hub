"use client";

import type { AuthTab, CountryCodeOption, OAuthProviderOption } from "@/types/auth";
import { AuthCard } from "./AuthCard";
import { AuthTabs } from "./AuthTabs";
import { EmailForm } from "./EmailForm";
import { PhoneForm } from "./PhoneForm";
import { OAuthButtons } from "./OAuthButtons";
import { VerifyIframe } from "./VerifyIframe";

interface CombinedAuthProps {
  activeTab: AuthTab;
  countryCodes: readonly CountryCodeOption[];
  email: {
    email: string;
    isPending: boolean;
    setEmail: (email: string) => void;
    submit: () => void;
  };
  error: string | null;
  isPending: boolean;
  oauth: {
    activeProvider: OAuthProviderOption["method"] | null;
    authenticate: (method: OAuthProviderOption["method"]) => void;
    cancel: () => void;
    isPending: boolean;
  };
  onCancel: () => void;
  onTabChange: (tab: AuthTab) => void;
  phone: {
    countryCode: string;
    isPending: boolean;
    phoneNumber: string;
    setCountryCode: (code: string) => void;
    setPhoneNumber: (phone: string) => void;
    submit: () => void;
  };
  providers: readonly OAuthProviderOption[];
  step: "input" | "verify";
  verifyUrl: string | null;
}

export function CombinedAuth({
  activeTab,
  countryCodes,
  email,
  error,
  isPending,
  oauth,
  onCancel,
  onTabChange,
  phone,
  providers,
  step,
  verifyUrl,
}: CombinedAuthProps) {
  if (step === "verify" && verifyUrl) {
    const statusMessage =
      activeTab === "email"
        ? email.isPending
          ? "Waiting for verification..."
          : undefined
        : phone.isPending
          ? "Waiting for verification..."
          : undefined;

    return (
      <AuthCard title="Verify account" description="Complete the Para verification challenge." error={error}>
        <VerifyIframe url={verifyUrl} onCancel={onCancel} statusMessage={statusMessage} />
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Sign in" description="Choose an auth method backed by Para." error={error}>
      <AuthTabs activeTab={activeTab} onTabChange={onTabChange} disabled={isPending} />

      {activeTab === "email" && (
        <EmailForm
          email={email.email}
          onEmailChange={email.setEmail}
          onSubmit={email.submit}
          isPending={email.isPending}
        />
      )}

      {activeTab === "phone" && (
        <PhoneForm
          countryCode={phone.countryCode}
          phoneNumber={phone.phoneNumber}
          onCountryCodeChange={phone.setCountryCode}
          onPhoneNumberChange={phone.setPhoneNumber}
          onSubmit={phone.submit}
          isPending={phone.isPending}
          countryCodes={countryCodes}
        />
      )}

      {activeTab === "social" && (
        <>
          <OAuthButtons
            providers={providers}
            activeProvider={oauth.activeProvider}
            onAuthenticate={oauth.authenticate}
            isPending={oauth.isPending}
          />
          {oauth.isPending && (
            <div className="mt-4 space-y-3">
              <div className="text-center text-sm text-muted-foreground">Waiting for authentication...</div>
              <button
                type="button"
                onClick={oauth.cancel}
                className="btn-secondary min-h-11 w-full px-4 text-sm">
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </AuthCard>
  );
}
