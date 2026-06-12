import { VerifyIframe } from "./VerifyIframe";

interface AuthCardProps {
  email: string;
  error: string | null;
  isPending: boolean;
  isPasskeyWindowOpen: boolean;
  isReady: boolean;
  needsVerificationCode: boolean;
  onCancel: () => void;
  onEmailChange: (email: string) => void;
  onOpenPasskey: () => void;
  onSubmit: () => void;
  onSubmitVerificationCode: () => void;
  onVerificationCodeChange: (code: string) => void;
  passkeyUrl: string | null;
  verificationCode: string;
  verifyUrl: string | null;
}

export function AuthCard({
  email,
  error,
  isPending,
  isPasskeyWindowOpen,
  isReady,
  needsVerificationCode,
  onCancel,
  onEmailChange,
  onOpenPasskey,
  onSubmit,
  onSubmitVerificationCode,
  onVerificationCodeChange,
  passkeyUrl,
  verificationCode,
  verifyUrl,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md animate-fade-in-up">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/[0.04]">
        {verifyUrl ? (
          <VerifyIframe
            url={verifyUrl}
            onCancel={onCancel}
            statusMessage="Complete email verification, then continue with your passkey."
          />
        ) : needsVerificationCode ? (
          <div className="space-y-6">
            <div className="space-y-3 text-center">
              <h1 className="text-xl font-semibold tracking-tight text-card-foreground">Check your email</h1>
              <p className="text-[13px] font-mono text-muted-foreground leading-relaxed">
                Enter the verification code, then finish wallet setup with a passkey.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/8 border border-destructive/15 px-4 py-3 animate-fade-in">
                <p className="text-sm text-destructive break-words">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="verification-code" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Code
              </label>
              <input
                id="verification-code"
                inputMode="numeric"
                value={verificationCode}
                onChange={(event) => onVerificationCodeChange(event.target.value)}
                placeholder="123456"
                autoComplete="one-time-code"
                data-testid="custom-auth-otp-input"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <button
              type="button"
              onClick={onSubmitVerificationCode}
              disabled={isPending}
              data-testid="verify-code-button"
              className="btn-primary w-full px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none">
              {isPending ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        ) : passkeyUrl ? (
          <div className="space-y-6">
            <div className="space-y-3 text-center">
              <h1 className="text-xl font-semibold tracking-tight text-card-foreground">Verify your passkey</h1>
              <p className="text-[13px] font-mono text-muted-foreground leading-relaxed">
                Open the secure passkey window, finish verification, and this app will continue when the wallet is ready.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/8 border border-destructive/15 px-4 py-3 animate-fade-in">
                <p className="text-sm text-destructive break-words">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={onOpenPasskey}
              data-testid="open-passkey-button"
              className="btn-primary w-full px-4 py-2.5">
              {isPasskeyWindowOpen ? "Passkey window open" : "Open Passkey Verification"}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3 text-center">
              <h1 className="text-xl font-semibold tracking-tight text-card-foreground">Connect recovery signer</h1>
              <p className="text-[13px] font-mono text-muted-foreground leading-relaxed">
                Sign in with passkey verification, then use that wallet as the Safe recovery guardian.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/8 border border-destructive/15 px-4 py-3 animate-fade-in">
                <p className="text-sm text-destructive break-words">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                data-testid="custom-auth-email-input"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={!isReady || isPending}
              data-testid="auth-connect-button"
              className="btn-primary w-full px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none">
              {isPending ? "Preparing passkey..." : "Continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
