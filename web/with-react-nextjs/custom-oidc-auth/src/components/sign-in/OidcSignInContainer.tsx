import type { FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { BackupCodeList } from "@/components/ui/BackupCodeList";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpInput";
import { QrCode } from "@/components/ui/QrCode";
import { SecretValue } from "@/components/ui/SecretValue";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { StatusHint } from "@/components/ui/StatusHint";
import { TextField } from "@/components/ui/TextField";
import type { UseMfaChallengeReturn } from "@/hooks/useMfaChallenge";
import type { UseOidcAuthReturn } from "@/hooks/useOidcAuth";
import { formatErrorMessage } from "@/lib/format";
import { describeMfaError, formatAttemptsRemaining, readOtpSecret } from "@/lib/mfaCopy";
import { describeSignInPhase } from "@/lib/signInStatus";
import { useMfaCodeEntry } from "@/lib/useMfaCodeEntry";
import { useQrCodeDataUrl } from "@/lib/useQrCodeDataUrl";

interface OidcSignInContainerProps {
  auth: UseOidcAuthReturn;
  mfa: UseMfaChallengeReturn;
  network: string;
}

const SIGN_IN_DESCRIPTION =
  "Sign in with your identity provider. Para secures the wallet with a passkey and two-factor authentication.";

export function OidcSignInContainer({ auth, mfa, network }: OidcSignInContainerProps) {
  const codeEntry = useMfaCodeEntry();
  const enrollmentUri = mfa.mode === "enroll" ? (mfa.enrollment?.uri ?? null) : null;
  const qrCode = useQrCodeDataUrl(enrollmentUri);

  if (!mfa.mode) {
    const status = describeSignInPhase(auth.authPhase, auth.hasPasskeyUrl);

    return (
      <SignInPanel title="Sign in with OIDC" description={SIGN_IN_DESCRIPTION} network={network}>
        {auth.error && (
          <Alert variant="destructive" title="Sign in failed" testId="custom-oidc-error">
            {formatErrorMessage(auth.error)}
          </Alert>
        )}
        <Button
          size="lg"
          fullWidth
          isLoading={auth.isPending}
          disabled={!auth.isReady}
          onClick={() => void auth.signIn()}
          data-testid="custom-oidc-signin">
          Sign in with OIDC Provider
        </Button>
        {status && (
          <StatusHint>
            <span data-testid="custom-oidc-status">{status}</span>
          </StatusHint>
        )}
      </SignInPanel>
    );
  }

  const isEnroll = mfa.mode === "enroll";
  const isWaitingForSecret = isEnroll && !mfa.enrollment;
  const secret = mfa.enrollment ? readOtpSecret(mfa.enrollment.uri) : null;
  const mfaError = describeMfaError({
    isCodeRejected: mfa.isCodeRejected,
    attemptsRemaining: mfa.attemptsRemaining,
    errorMessage: mfa.error,
  });

  const submitCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!codeEntry.canSubmit || mfa.isVerifying) return;
    codeEntry.markSubmitted();
    void mfa.verify(codeEntry.trimmedCode);
  };

  return (
    <div data-testid="custom-oidc-mfa">
      <SignInPanel
        title={isEnroll ? "Set up two-factor authentication" : "Two-factor authentication"}
        description={
          isEnroll
            ? "Scan the QR code with an authenticator app, then enter the 6-digit code it shows."
            : "Enter the 6-digit code from your authenticator app to finish signing in."
        }
        network={network}>
        {isWaitingForSecret && (
          <StatusHint>
            <span data-testid="custom-oidc-mfa-loading">
              {mfa.isEnrolling ? "Preparing your secret…" : "Two-factor setup is unavailable."}
            </span>
          </StatusHint>
        )}
        {mfa.enrollment && (
          <>
            {!qrCode.hasFailed && (
              <QrCode src={qrCode.dataUrl} label="QR code for your authenticator app" testId="custom-oidc-mfa-qr" />
            )}
            {secret && (
              <SecretValue label="Can’t scan? Enter this key manually:" value={secret} testId="custom-oidc-mfa-secret" />
            )}
            <BackupCodeList
              label="Save your backup codes. They are only shown once."
              codes={mfa.enrollment.backupCodes}
              testId="custom-oidc-mfa-backup-codes"
            />
          </>
        )}

        <form onSubmit={submitCode} className="grid gap-4">
          {codeEntry.isBackupCode ? (
            <TextField
              label="Backup code"
              autoComplete="one-time-code"
              value={codeEntry.code}
              onChange={(event) => codeEntry.setCode(event.target.value)}
              disabled={mfa.isVerifying}
              data-testid="custom-oidc-mfa-input"
              autoFocus
            />
          ) : (
            <OtpInput
              label="Verification code"
              length={codeEntry.codeLength}
              value={codeEntry.code}
              onChange={codeEntry.setCode}
              isInvalid={mfa.isCodeRejected && codeEntry.isSubmittedCode}
              disabled={isWaitingForSecret || mfa.isVerifying}
              data-testid="custom-oidc-mfa-input"
              autoFocus={!isEnroll}
            />
          )}
          {mfaError && (
            <Alert variant="destructive" title={mfaError.title} testId="custom-oidc-mfa-error">
              {mfaError.message}
            </Alert>
          )}
          {mfa.attemptsRemaining !== null && !mfaError && (
            <StatusHint>
              <span data-testid="custom-oidc-mfa-attempts">{formatAttemptsRemaining(mfa.attemptsRemaining)}</span>
            </StatusHint>
          )}
          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={mfa.isVerifying}
            disabled={!codeEntry.canSubmit || isWaitingForSecret}
            data-testid="custom-oidc-mfa-submit">
            {isEnroll ? "Verify and continue" : "Verify"}
          </Button>
        </form>

        {!isEnroll && (
          <Button
            variant="link"
            className="justify-self-center"
            onClick={codeEntry.toggleBackupCode}
            data-testid="custom-oidc-mfa-toggle-backup">
            {codeEntry.isBackupCode ? "Use your authenticator code instead" : "Use a backup code instead"}
          </Button>
        )}
      </SignInPanel>
    </div>
  );
}
