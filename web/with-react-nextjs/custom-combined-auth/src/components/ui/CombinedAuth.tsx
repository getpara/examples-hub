"use client";

import { useAccount } from "@getpara/react-sdk";
import type { TOAuthMethod } from "@getpara/react-sdk";
import { useCombinedAuth } from "@/hooks/useCombinedAuth";
import { COUNTRY_CODES, OAUTH_PROVIDERS } from "@/constants/auth";
import { AuthCard } from "./AuthCard";
import { AuthTabs } from "./AuthTabs";
import { EmailForm } from "./EmailForm";
import { PhoneForm } from "./PhoneForm";
import { OAuthButtons } from "./OAuthButtons";
import { VerifyIframe } from "./VerifyIframe";

export function CombinedAuth() {
  const { isConnected } = useAccount();
  const {
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
  } = useCombinedAuth();

  if (isConnected) return null;

  // Show verification iframe for email/phone OTP
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
      <AuthCard title="Sign in to your account" error={error}>
        <VerifyIframe url={verifyUrl} onCancel={cancel} statusMessage={statusMessage} />
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Sign in to your account" error={error}>
      <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} disabled={isPending} />

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
          countryCodes={COUNTRY_CODES}
        />
      )}

      {activeTab === "social" && (
        <>
          <OAuthButtons
            providers={OAUTH_PROVIDERS}
            activeProvider={oauth.activeProvider}
            onAuthenticate={(method) => oauth.authenticate(method as TOAuthMethod)}
            isPending={oauth.isPending}
          />
          {oauth.isPending && (
            <div className="mt-4 space-y-3">
              <div className="text-center text-sm text-gray-500">Waiting for authentication...</div>
              <button
                onClick={oauth.cancel}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </AuthCard>
  );
}
