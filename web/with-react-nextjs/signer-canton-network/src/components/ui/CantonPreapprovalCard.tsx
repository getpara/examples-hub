interface CantonPreapprovalCardProps {
  onInstall: () => void;
  isPending: boolean;
  error: Error | null;
  preparedHash?: string;
  updateId?: string;
}

export function CantonPreapprovalCard({
  onInstall,
  isPending,
  error,
  preparedHash,
  updateId,
}: CantonPreapprovalCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-fade-in-up-delayed">
      <div className="px-6 py-4 border-b border-border/60">
        <h2 className="text-sm font-semibold">Install TransferPreapproval</h2>
      </div>

      <div className="p-6 space-y-4">
        {error && (
          <div className="rounded-xl bg-destructive/8 border border-destructive/15 px-4 py-3 animate-fade-in">
            <p className="text-sm text-destructive">
              {error.message || "Preapproval install failed. Please try again."}
            </p>
          </div>
        )}

        {updateId && !error && (
          <div className="rounded-xl bg-success/8 border border-success/15 px-4 py-3 animate-fade-in">
            <p className="text-sm text-success-foreground">
              TransferPreapprovalProposal submitted — validator automation will accept it shortly.
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">
          After onboarding, every ledger write follows the same prepare → Para-sign → execute
          loop.
        </p>

        <button
          type="button"
          onClick={onInstall}
          data-testid="canton-preapproval-button"
          disabled={isPending || Boolean(updateId)}
          className="btn-primary w-full px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none">
          {isPending
            ? "Submitting..."
            : updateId
              ? "Submitted"
              : "Install TransferPreapproval"}
        </button>

        {preparedHash && (
          <div className="animate-fade-in">
            <p className="text-xs text-muted-foreground mb-2">preparedTransactionHash (signed by Para)</p>
            <div className="rounded-xl bg-muted/60 px-4 py-3 break-all">
              <code className="text-xs font-mono text-muted-foreground leading-relaxed">
                {preparedHash}
              </code>
            </div>
          </div>
        )}

        {updateId && (
          <div className="animate-fade-in">
            <p className="text-xs text-muted-foreground mb-2">updateId</p>
            <div
              className="rounded-xl bg-muted/60 px-4 py-3 break-all"
              data-testid="canton-preapproval-update-id-display">
              <code className="text-xs font-mono text-muted-foreground leading-relaxed">
                {updateId}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
