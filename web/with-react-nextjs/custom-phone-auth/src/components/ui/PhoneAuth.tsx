import type { CountryCodeOption, PhoneAuthStep } from "@/types/auth";
import { AuthCard } from "./AuthCard";
import { PhoneForm } from "./PhoneForm";
import { VerifyIframe } from "./VerifyIframe";

interface PhoneAuthProps {
  countryCode: string;
  countryCodes: readonly CountryCodeOption[];
  error: string | null;
  isPending: boolean;
  onCancel: () => void;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (phone: string) => void;
  onSubmit: () => void;
  phoneNumber: string;
  step: PhoneAuthStep;
  verifyUrl: string | null;
}

export function PhoneAuth({
  countryCode,
  countryCodes,
  error,
  isPending,
  onCancel,
  onCountryCodeChange,
  onPhoneNumberChange,
  onSubmit,
  phoneNumber,
  step,
  verifyUrl,
}: PhoneAuthProps) {
  if (step === "verify" && verifyUrl) {
    return (
      <AuthCard title="Verify phone" description="Complete the Para SMS verification challenge." error={error}>
        <VerifyIframe
          url={verifyUrl}
          onCancel={onCancel}
          statusMessage={isPending ? "Waiting for verification..." : undefined}
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Sign in with phone" description="Use Para phone auth with your own input and OTP UI." error={error}>
      <PhoneForm
        countryCode={countryCode}
        phoneNumber={phoneNumber}
        onCountryCodeChange={onCountryCodeChange}
        onPhoneNumberChange={onPhoneNumberChange}
        onSubmit={onSubmit}
        isPending={isPending}
        countryCodes={countryCodes}
      />
    </AuthCard>
  );
}
