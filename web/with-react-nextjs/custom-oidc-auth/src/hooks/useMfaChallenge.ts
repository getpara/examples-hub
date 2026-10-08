import { useCallback, useEffect, useRef, useState } from "react";
import type { StateSnapshot } from "@getpara/react-sdk";
import { useClient, useEnrollMfa, useVerifyMfa } from "@getpara/react-sdk";

export type MfaMode = "enroll" | "verify";

export interface MfaEnrollment {
  uri: string;
  backupCodes: string[];
}

export function useMfaChallenge() {
  const para = useClient();
  const { enrollMfaAsync } = useEnrollMfa();
  const { verifyMfaAsync } = useVerifyMfa();

  const [mode, setMode] = useState<MfaMode | null>(null);
  const [enrollment, setEnrollment] = useState<MfaEnrollment | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isCodeRejected, setIsCodeRejected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasEnrolled = useRef(false);

  const beginEnrollment = useCallback(async () => {
    if (hasEnrolled.current) return;
    hasEnrolled.current = true;
    setIsEnrolling(true);
    setError(null);
    try {
      const { uri, backupCodes } = await enrollMfaAsync();
      setEnrollment({ uri, backupCodes });
    } catch (enrollError) {
      hasEnrolled.current = false;
      setError(enrollError instanceof Error ? enrollError.message : "Could not start two-factor setup.");
    } finally {
      setIsEnrolling(false);
    }
  }, [enrollMfaAsync]);

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
        setMode(null);
        setEnrollment(null);
        setAttemptsRemaining(null);
        setIsCodeRejected(false);
        setError(null);
        hasEnrolled.current = false;
      }
    });
    return () => unsubscribe();
  }, [para, beginEnrollment]);

  const verify = useCallback(
    async (code: string) => {
      setIsVerifying(true);
      setIsCodeRejected(false);
      setError(null);
      try {
        const result = await verifyMfaAsync({ code });
        if (result.ok) {
          setAttemptsRemaining(null);
          return true;
        }
        setAttemptsRemaining(result.attemptsRemaining ?? null);
        setIsCodeRejected(true);
        return false;
      } catch (verifyError) {
        setError(verifyError instanceof Error ? verifyError.message : "Could not verify your code.");
        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [verifyMfaAsync]
  );

  return { mode, enrollment, isEnrolling, isVerifying, attemptsRemaining, isCodeRejected, error, verify };
}

export type UseMfaChallengeReturn = ReturnType<typeof useMfaChallenge>;
