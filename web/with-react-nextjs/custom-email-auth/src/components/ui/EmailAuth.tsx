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
  onSubmit: () => void;
  step: "input" | "verify";
  verifyUrl: string | null;
}

export function EmailAuth({
  email,
  error,
  isPending,
  onCancel,
  onEmailChange,
  onSubmit,
  step,
  verifyUrl,
}: EmailAuthProps) {
  if (step === "verify" && verifyUrl) {
    return (
      <AuthCard title="Verify email" description="Complete the Para verification challenge." error={error}>
        <VerifyIframe
          url={verifyUrl}
          onCancel={onCancel}
          statusMessage={isPending ? "Waiting for verification..." : undefined}
        />
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
