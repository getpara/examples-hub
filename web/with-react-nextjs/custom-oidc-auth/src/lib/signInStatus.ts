const PHASE_MESSAGES: Record<string, string> = {
  authenticating_oauth: "Opening sign-in window…",
  processing_authentication: "Verifying your sign-in…",
  awaiting_2fa_enrollment: "Set up two-factor authentication to continue…",
  awaiting_2fa: "Enter your two-factor code to continue…",
  resolving_2fa: "Confirming two-factor…",
  awaiting_session_start: "Setting up your wallet…",
  waiting_for_session: "Setting up your wallet…",
  verifying_new_account: "Finishing account setup…",
};

export function describeSignInPhase(phase: string | null, hasPasskeyUrl: boolean) {
  if (hasPasskeyUrl) {
    return "Create a passkey to secure your wallet…";
  }

  return (phase && PHASE_MESSAGES[phase]) || "";
}
