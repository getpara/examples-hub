interface CantonOnboardCardProps {
  onOnboard: () => void;
  isPending: boolean;
  error: Error | null;
  multiHash?: string;
  partyId?: string;
}

export function CantonOnboardCard({
  onOnboard,
  isPending,
  error,
  multiHash,
  partyId,
}: CantonOnboardCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-fade-in-up-delayed">
      <div className="px-6 py-4 border-b border-border/60">
        <h2 className="text-sm font-semibold">Canton External Party</h2>
      </div>

      <div className="p-6 space-y-4">
        {error && (
          <div className="rounded-xl bg-destructive/8 border border-destructive/15 px-4 py-3 animate-fade-in">
            <p className="text-sm text-destructive">
              {error.message || "Onboarding failed. Please try again."}
            </p>
          </div>
        )}

        {partyId && !error && (
          <div className="rounded-xl bg-success/8 border border-success/15 px-4 py-3 animate-fade-in">
            <p className="text-sm text-success-foreground">External party allocated on Canton!</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">
          This will (1) ask Canton to prepare an external party for your Para-managed Ed25519 key,
          (2) sign the resulting hash with Para, and (3) submit the signature to allocate the party
          on the ledger.
        </p>

        <button
          type="button"
          onClick={onOnboard}
          data-testid="canton-onboard-button"
          disabled={isPending || Boolean(partyId)}
          className="btn-primary w-full px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none">
          {isPending
            ? "Onboarding..."
            : partyId
              ? "Onboarded"
              : "Onboard as Canton external party"}
        </button>

        {multiHash && (
          <div className="animate-fade-in">
            <p className="text-xs text-muted-foreground mb-2">multiHash (signed by Para)</p>
            <div className="rounded-xl bg-muted/60 px-4 py-3 break-all">
              <code className="text-xs font-mono text-muted-foreground leading-relaxed">
                {multiHash}
              </code>
            </div>
          </div>
        )}

        {partyId && (
          <div className="animate-fade-in">
            <p className="text-xs text-muted-foreground mb-2">Allocated partyId</p>
            <div
              className="rounded-xl bg-muted/60 px-4 py-3 break-all"
              data-testid="canton-party-id-display">
              <code className="text-xs font-mono text-muted-foreground leading-relaxed">
                {partyId}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
