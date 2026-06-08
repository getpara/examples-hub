interface SignMessageProps {
  message: string;
  onSign: () => void;
  isPending: boolean;
  errorMessage: string | null;
  signature?: string;
}

export function SignMessage({ message, onSign, isPending, errorMessage, signature }: SignMessageProps) {
  return (
    <div
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-fade-in-up-delayed">
      <div className="px-6 py-4 border-b border-border/60">
        <h2 className="text-sm font-semibold">Sign Message</h2>
      </div>

      <div className="p-6 space-y-4">
        {errorMessage && (
          <div className="rounded-xl bg-destructive/8 border border-destructive/15 px-4 py-3 animate-fade-in">
            <p className="text-sm text-destructive">
              {errorMessage || "Signing failed. Please try again."}
            </p>
          </div>
        )}

        {signature && !errorMessage && (
          <div className="rounded-xl bg-success/8 border border-success/15 px-4 py-3 animate-fade-in">
            <p className="text-sm text-success-foreground">Message signed successfully!</p>
          </div>
        )}

        <div className="rounded-xl bg-muted/60 px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Message</p>
          <p className="text-sm font-mono font-medium">{message}</p>
        </div>

        <button
          type="button"
          onClick={onSign}
          data-testid="sign-submit-button"
          disabled={isPending}
          className="btn-primary w-full px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none">
          {isPending ? "Signing..." : `Sign ${message}`}
        </button>

        {signature && (
          <div className="animate-fade-in">
            <p className="text-xs text-muted-foreground mb-2">Signature</p>
            <div
              className="rounded-xl bg-muted/60 px-4 py-3 break-all"
              data-testid="sign-signature-display">
              <code className="text-xs font-mono text-muted-foreground leading-relaxed">
                {signature}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
