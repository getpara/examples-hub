"use client";

import { useAccount } from "@getpara/react-sdk";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { AuthCard } from "./AuthCard";
import { EmailForm } from "./EmailForm";
import { VerifyIframe } from "./VerifyIframe";

export function EmailAuth() {
  const { isConnected } = useAccount();
  const { email, setEmail, submit, cancel, step, verifyUrl, error, isPending } = useEmailAuth();

  if (isConnected) return null;

  // Show verification iframe for OTP
  if (step === "verify" && verifyUrl) {
    return (
      <AuthCard title="Sign in with Email" error={error}>
        <VerifyIframe
          url={verifyUrl}
          onCancel={cancel}
          statusMessage={isPending ? "Waiting for verification..." : undefined}
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Sign in with Email" error={error}>
      <EmailForm
        email={email}
        onEmailChange={setEmail}
        onSubmit={submit}
        isPending={isPending}
      />
    </AuthCard>
  );
}
