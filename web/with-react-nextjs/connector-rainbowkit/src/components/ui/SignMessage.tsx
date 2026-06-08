interface SignMessageProps {
  message: string;
  onSign: () => void;
  isPending: boolean;
  error: Error | null;
  signature?: string;
}

export function SignMessage({ message, onSign, isPending, error, signature }: SignMessageProps) {
  const showStatus = isPending || !!error || !!signature;

  const statusConfig = isPending
    ? {
        bg: "border-border bg-muted/60",
        text: "text-muted-foreground",
        message: `Signing "${message}"...`,
      }
    : error
      ? {
          bg: "border-destructive/15 bg-destructive/8",
          text: "text-destructive",
          message: error.message || `Failed to sign "${message}". Please try again.`,
        }
      : {
          bg: "border-success/15 bg-success/8",
          text: "text-success-foreground",
          message: `"${message}" signed successfully.`,
        };

  return (
    <>
      {showStatus && (
        <div className={`animate-fade-in rounded-xl border px-4 py-3 ${statusConfig.bg}`}>
          <p className={`text-sm ${statusConfig.text}`}>{statusConfig.message}</p>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Wagmi signing</p>
          <h2 className="text-xl font-semibold tracking-tight text-card-foreground">Sign Message</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Confirm the message signature with the connected wallet.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/60 px-4 py-3">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Message</p>
            <p className="font-mono text-sm font-semibold text-card-foreground">{message}</p>
          </div>
          <button
            type="button"
            onClick={onSign}
            disabled={isPending}
            className="btn-primary w-full px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none">
            {isPending ? "Signing..." : `Sign ${message}`}
          </button>
        </div>
      </div>

      {signature && (
        <div className="animate-fade-in rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-card-foreground">Signature</h2>
          <div
            className="mt-3 break-all rounded-xl border border-border bg-muted/60 px-4 py-3"
            data-testid="sign-signature-display">
            <code className="font-mono text-xs leading-5 text-card-foreground">{signature}</code>
          </div>
        </div>
      )}
    </>
  );
}
