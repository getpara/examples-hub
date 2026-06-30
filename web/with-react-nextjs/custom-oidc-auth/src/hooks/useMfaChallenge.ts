import { useCallback, useEffect, useRef, useState } from "react";
import type { StateSnapshot } from "@getpara/web-sdk";
import { useClient, useEnrollMfa, useVerifyMfa } from "@getpara/react-sdk";

// Login-time 2FA (ENG-6906). A login can return an MFA challenge before it completes:
// `awaiting_2fa_enrollment` (the user must set a factor up) or `awaiting_2fa` (the user
// must satisfy an existing factor). This hook surfaces that challenge from the SDK state
// and drives it with the useEnrollMfa / useVerifyMfa hooks, mirroring how useOidcAuth
// surfaces the passkey step from onStatePhaseChange.

export type MfaMode = "enroll" | "verify";

export interface MfaEnrollment {
  /** otpauth:// URI to render as a QR for the authenticator app. */
  uri: string;
  /** One-time backup codes — shown to the user exactly once. */
  backupCodes: string[];
}

export interface UseMfaChallengeReturn {
  /** Non-null while a login is parked on a 2FA challenge. */
  mode: MfaMode | null;
  /** Enrollment payload (QR uri + backup codes); only populated in `enroll` mode. */
  enrollment: MfaEnrollment | null;
  /** True while the enrollment secret is being fetched. */
  isEnrolling: boolean;
  /** True while a submitted code is being verified. */
  isVerifying: boolean;
  /** Attempts left after the last wrong code, or null when not applicable. */
  attemptsRemaining: number | null;
  /** Error message for a failed enroll/verify, or null. */
  error: string | null;
  /** Submit a TOTP or backup code. Returns true once the factor is satisfied. */
  verify: (code: string) => Promise<boolean>;
}

function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useMfaChallenge(): UseMfaChallengeReturn {
  const para = useClient();
  const { enrollMfaAsync } = useEnrollMfa();
  const { verifyMfaAsync } = useVerifyMfa();

  const [mode, setMode] = useState<MfaMode | null>(null);
  const [enrollment, setEnrollment] = useState<MfaEnrollment | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Enrollment is one-shot per challenge: enrollMfa() mints a fresh secret + backup
  // codes each call, so guard against the state subscription firing it twice.
  const hasEnrolled = useRef(false);

  // Pull the enrollment secret once, when the SDK parks the login on enrollment.
  const beginEnrollment = useCallback(async () => {
    if (hasEnrolled.current) return;
    hasEnrolled.current = true;
    setIsEnrolling(true);
    setError(null);
    try {
      const { uri, backupCodes } = await enrollMfaAsync();
      setEnrollment({ uri, backupCodes });
    } catch (enrollError) {
      hasEnrolled.current = false; // allow a retry on the next state tick
      setError(toMessage(enrollError, "Could not start two-factor setup."));
    } finally {
      setIsEnrolling(false);
    }
  }, [enrollMfaAsync]);

  // The provider owns the client subscription for its own bookkeeping; we add a second
  // subscriber purely to detect the 2FA hold and read the challenge mode (ENG-6906).
  useEffect(() => {
    if (!para) return;
    const unsubscribe = para.onStatePhaseChange((snapshot: StateSnapshot) => {
      const { authPhase } = snapshot;
      if (authPhase === "awaiting_2fa_enrollment") {
        setMode("enroll");
        void beginEnrollment();
      } else if (authPhase === "awaiting_2fa") {
        setMode("verify");
      } else {
        // Left the 2FA hold (advanced to the wallet, cancelled, or errored): reset so a
        // later login starts clean and stale backup codes never linger on screen.
        setMode(null);
        setEnrollment(null);
        setAttemptsRemaining(null);
        setError(null);
        hasEnrolled.current = false;
      }
    });
    return () => unsubscribe();
  }, [para, beginEnrollment]);

  const verify = useCallback(
    async (code: string): Promise<boolean> => {
      setIsVerifying(true);
      setError(null);
      try {
        // On { ok: true } the SDK has already re-polled the login status, so the auth
        // state advances toward the connected wallet on its own. On { ok: false } we
        // surface attemptsRemaining and stay on the prompt (ENG-6906).
        const result = await verifyMfaAsync({ code });
        if (result.ok) {
          setAttemptsRemaining(null);
          return true;
        }
        setAttemptsRemaining(result.attemptsRemaining ?? null);
        setError(
          result.attemptsRemaining != null
            ? `Incorrect code. ${result.attemptsRemaining} attempt${
                result.attemptsRemaining === 1 ? "" : "s"
              } remaining.`
            : "Incorrect code. Please try again."
        );
        return false;
      } catch (verifyError) {
        setError(toMessage(verifyError, "Could not verify your code."));
        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [verifyMfaAsync]
  );

  return { mode, enrollment, isEnrolling, isVerifying, attemptsRemaining, error, verify };
}
