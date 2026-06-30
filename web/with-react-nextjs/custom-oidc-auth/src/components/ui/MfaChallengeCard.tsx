import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { MfaEnrollment, MfaMode } from "@/hooks/useMfaChallenge";

// Render the otpauth:// provisioning URI as a QR via the `qrcode` package. The
// auth secret is 20 bytes, so the URI runs ~130 chars — still long enough that the
// auto-version QR encoder must pick a higher version. `qrcode` handles that;
// react-qr-code (qr.js) threw "bad rs block" on a payload this size and took the
// whole enroll card down with it.
function OtpAuthQr({ uri, size }: { uri: string; size: number }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    QRCode.toString(uri, { type: "svg", errorCorrectionLevel: "M", margin: 1 })
      .then((markup) => {
        if (active) setSvg(markup);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [uri]);

  if (failed) {
    // Never crash the card on a QR failure — manual entry below is the fallback.
    return null;
  }
  if (!svg) {
    return <div style={{ width: size, height: size }} />;
  }
  return (
    <div
      style={{ width: size, height: size }}
      data-testid="custom-oidc-mfa-qr"
      // svg is the QR markup we just generated locally from the otpauth URI (not
      // user-supplied), so injecting it is safe.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

interface MfaChallengeCardProps {
  mode: MfaMode;
  enrollment: MfaEnrollment | null;
  isEnrolling: boolean;
  isVerifying: boolean;
  attemptsRemaining: number | null;
  error: string | null;
  onVerify: (code: string) => void;
}

const CODE_LENGTH = 6;

// Presentational only — no Para imports. The enroll path shows the QR + one-time backup
// codes, then the TOTP field; the verify path shows the TOTP field with a backup-code
// affordance. Loading/error/attempts state is driven by props (see useMfaChallenge).
export function MfaChallengeCard({
  mode,
  enrollment,
  isEnrolling,
  isVerifying,
  attemptsRemaining,
  error,
  onVerify,
}: MfaChallengeCardProps) {
  const [code, setCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  const isEnroll = mode === "enroll";
  // In enroll mode the user must scan the secret before the code field is usable. The
  // secret is null while it loads (isEnrolling) and also if enrollMfa() failed — in the
  // latter case the error banner below explains why, so only block on it, don't spin.
  const isWaitingForSecret = isEnroll && !enrollment;
  // Backup codes are free-form; TOTP is a fixed 6 digits.
  const canSubmit = useBackupCode ? code.trim().length > 0 : code.trim().length === CODE_LENGTH;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || isVerifying) return;
    onVerify(code.trim());
    setCode("");
  };

  return (
    <div className="w-full max-w-md animate-fade-in-up" data-testid="custom-oidc-mfa">
      <div className="overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/[0.04]">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-card-foreground">
            {isEnroll ? "Set up two-factor authentication" : "Two-factor authentication"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEnroll
              ? "Scan the QR code with an authenticator app, then enter the 6-digit code it shows."
              : "Enter the 6-digit code from your authenticator app to finish signing in."}
          </p>
        </div>

        {isEnroll && (
          <div className="mt-6 space-y-5">
            {isWaitingForSecret ? (
              <div
                className="flex h-52 items-center justify-center rounded-xl border border-border bg-muted"
                data-testid="custom-oidc-mfa-loading">
                <p className="text-sm text-muted-foreground">
                  {isEnrolling ? "Preparing your secret…" : "Two-factor setup is unavailable."}
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="rounded-xl border border-border bg-white p-4">
                    <OtpAuthQr uri={enrollment!.uri} size={176} />
                  </div>
                </div>

                {(() => {
                  // Manual-entry fallback: surface the base32 secret so a user whose
                  // camera/QR fails can still add the account by hand.
                  const secret = new URLSearchParams(enrollment!.uri.split("?")[1] ?? "").get("secret");
                  return secret ? (
                    <p className="text-center text-xs text-muted-foreground">
                      Can&apos;t scan? Enter this key manually:
                      <br />
                      <code className="break-all font-mono text-[11px] text-card-foreground" data-testid="custom-oidc-mfa-secret">
                        {secret}
                      </code>
                    </p>
                  ) : null;
                })()}

                <div className="rounded-xl border border-primary/20 bg-primary/[0.06] p-4">
                  <p className="text-sm font-semibold text-card-foreground">Save your backup codes</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Store these somewhere safe — they are your only way back in if you lose your
                    authenticator. They won&apos;t be shown again.
                  </p>
                  <ul
                    className="mt-3 grid grid-cols-2 gap-2 font-mono text-[13px] text-card-foreground"
                    data-testid="custom-oidc-mfa-backup-codes">
                    {enrollment!.backupCodes.map((backupCode) => (
                      <li key={backupCode} className="rounded-md bg-card px-2 py-1 text-center">
                        {backupCode}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            inputMode={useBackupCode ? "text" : "numeric"}
            autoComplete="one-time-code"
            value={code}
            onChange={(event) =>
              setCode(
                useBackupCode
                  ? event.target.value
                  : event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH)
              )
            }
            placeholder={useBackupCode ? "Backup code" : "123456"}
            disabled={isWaitingForSecret || isVerifying}
            data-testid="custom-oidc-mfa-input"
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-center font-mono text-lg tracking-[0.3em] text-card-foreground outline-none transition-colors placeholder:tracking-normal placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          />

          {error && (
            <div className="animate-fade-in rounded-xl border border-destructive/15 bg-destructive/8 px-4 py-3">
              <p className="break-words text-sm text-destructive" data-testid="custom-oidc-mfa-error">
                {error}
              </p>
            </div>
          )}

          {attemptsRemaining != null && !error && (
            <p className="text-center text-sm text-muted-foreground" data-testid="custom-oidc-mfa-attempts">
              {attemptsRemaining} attempt{attemptsRemaining === 1 ? "" : "s"} remaining.
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || isVerifying || isWaitingForSecret}
            data-testid="custom-oidc-mfa-submit"
            className="btn-primary w-full px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none">
            {isVerifying ? "Verifying…" : isEnroll ? "Verify and continue" : "Verify"}
          </button>
        </form>

        {!isEnroll && (
          <button
            type="button"
            onClick={() => {
              setUseBackupCode((prev) => !prev);
              setCode("");
            }}
            data-testid="custom-oidc-mfa-toggle-backup"
            className="mt-4 w-full text-center text-sm font-medium text-primary hover:underline">
            {useBackupCode ? "Use your authenticator code instead" : "Use a backup code instead"}
          </button>
        )}
      </div>
    </div>
  );
}
