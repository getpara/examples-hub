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
  onOpenPasskey: () => void;
  onPhoneNumberChange: (phone: string) => void;
  onSubmit: () => void;
  passkeyUrl: string | null;
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
  onOpenPasskey,
  onPhoneNumberChange,
  onSubmit,
  passkeyUrl,
  phoneNumber,
  step,
  verifyUrl,
}: PhoneAuthProps) {
  if (step === "verify" && (verifyUrl || passkeyUrl)) {
    return (
      <AuthCard title="Verify phone" description="Complete the Para SMS verification challenge." error={error}>
        {verifyUrl && (
          <VerifyIframe
            url={verifyUrl}
            onCancel={onCancel}
            statusMessage={isPending ? "Waiting for verification..." : undefined}
          />
        )}
        {passkeyUrl && (
          <button type="button" onClick={onOpenPasskey} className="btn-primary min-h-11 w-full px-4 text-sm">
            Open Passkey Verification
          </button>
        )}
        {!verifyUrl && (
          <button type="button" onClick={onCancel} className="btn-secondary min-h-11 w-full px-4 text-sm">
            Cancel
          </button>
        )}
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
