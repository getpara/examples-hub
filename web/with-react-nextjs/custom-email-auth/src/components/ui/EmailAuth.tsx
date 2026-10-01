"use client";

import { AuthCard } from "./AuthCard";
import { EmailForm } from "./EmailForm";
import { VerifyIframe } from "./VerifyIframe";

interface EmailAuthProps {
  email: string;
  error: string | null;
  isPending: boolean;
  onCancel: () => void;
  onEmailChange: (email: string) => void;
  onOpenPasskey: () => void;
  onSubmit: () => void;
  passkeyUrl: string | null;
  step: "input" | "verify";
  verifyUrl: string | null;
}

export function EmailAuth({
  email,
  error,
  isPending,
  onCancel,
  onEmailChange,
  onOpenPasskey,
  onSubmit,
  passkeyUrl,
  step,
  verifyUrl,
}: EmailAuthProps) {
  if (step === "verify" && (verifyUrl || passkeyUrl)) {
    return (
      <AuthCard title="Verify email" description="Complete the Para verification challenge." error={error}>
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
    <AuthCard title="Sign in with email" description="Use Para email OTP with your own UI." error={error}>
      <EmailForm
        email={email}
        onEmailChange={onEmailChange}
        onSubmit={onSubmit}
        isPending={isPending}
      />
    </AuthCard>
  );
}
