"use client";

import { useAccount } from "@getpara/react-sdk";
import { usePhoneAuth } from "@/hooks/usePhoneAuth";
import { COUNTRY_CODES } from "@/constants/auth";
import { AuthCard } from "./AuthCard";
import { PhoneForm } from "./PhoneForm";
import { VerifyIframe } from "./VerifyIframe";

export function PhoneAuth() {
  const { isConnected } = useAccount();
  const {
    countryCode,
    phoneNumber,
    setCountryCode,
    setPhoneNumber,
    submit,
    cancel,
    step,
    verifyUrl,
    error,
    isPending,
  } = usePhoneAuth();

  if (isConnected) return null;

  // Show verification iframe for OTP
  if (step === "verify" && verifyUrl) {
    return (
      <AuthCard title="Sign in with Phone" error={error}>
        <VerifyIframe
          url={verifyUrl}
          onCancel={cancel}
          statusMessage={isPending ? "Waiting for verification..." : undefined}
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Sign in with Phone" error={error}>
      <PhoneForm
        countryCode={countryCode}
        phoneNumber={phoneNumber}
        onCountryCodeChange={setCountryCode}
        onPhoneNumberChange={setPhoneNumber}
        onSubmit={submit}
        isPending={isPending}
        countryCodes={COUNTRY_CODES}
      />
    </AuthCard>
  );
}
