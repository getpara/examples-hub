interface SignMessageProps {
  message: string;
  onSign: () => void;
  isPending: boolean;
  errorMessage: string | null;
  signature?: string;
}

const STATUS_STYLES = {
  error: "border-destructive/20 bg-destructive/10 text-destructive",
  pending: "border-border bg-muted text-muted-foreground",
  success: "border-success/20 bg-success/10 text-success-foreground",
} as const;

export function SignMessage({ message, onSign, isPending, errorMessage, signature }: SignMessageProps) {
  const statusMessage = isPending
    ? `Signing ${message}...`
    : errorMessage
      ? errorMessage
      : signature
        ? `${message} signed successfully.`
        : null;
  const statusClass = isPending ? STATUS_STYLES.pending : errorMessage ? STATUS_STYLES.error : STATUS_STYLES.success;

  return (
    <div className="space-y-4">
      {statusMessage && (
        <div className={`rounded-lg border p-4 ${statusClass}`}>
          <p className="text-sm">{statusMessage}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-card-foreground">Sign message</h2>
          <p className="mt-1 text-sm text-muted-foreground">EVM signing through the connected Para wallet</p>
        </div>
        <div className="space-y-4">
          <div className="px-6 pt-5">
            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Message</p>
              <p className="font-mono text-base font-semibold text-card-foreground">{message}</p>
            </div>
          </div>
          <div className="px-6 pb-5">
            <button
              type="button"
              onClick={onSign}
              disabled={isPending}
              className="btn-primary min-h-11 w-full px-4 text-sm">
              {isPending ? "Signing..." : "Sign message"}
            </button>
          </div>
        </div>
      </div>

      {signature && (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border/60 px-6 py-4">
            <h2 className="text-lg font-semibold text-card-foreground">Signature</h2>
          </div>
          <div className="px-6 py-5">
            <div className="break-all rounded-lg border border-border bg-muted p-4" data-testid="sign-signature-display">
              <code className="font-mono text-sm text-card-foreground">{signature}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
