interface UpgradeAccountProps {
  isUpgraded: boolean;
  isPending: boolean;
  isReady: boolean;
  adminKeyCount: number;
  sessionKeyCount: number;
  error: Error | null;
  onUpgrade: () => void;
}

export function UpgradeAccount({
  isUpgraded,
  isPending,
  isReady,
  adminKeyCount,
  sessionKeyCount,
  error,
  onUpgrade,
}: UpgradeAccountProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-fade-in-up-delayed">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">Porto upgrade</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Authorize a Porto admin key and upgrade the connected EOA in place.
          </p>
        </div>
        <span
          className={
            isUpgraded
              ? "rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success-foreground"
              : "rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
          }>
          {isUpgraded ? "Upgraded" : "Ready"}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm mb-6">
        <div className="rounded-xl bg-muted/60 p-3">
          <dt className="text-muted-foreground mb-1">Admin keys</dt>
          <dd className="font-mono text-card-foreground">{adminKeyCount}</dd>
        </div>
        <div className="rounded-xl bg-muted/60 p-3">
          <dt className="text-muted-foreground mb-1">Session keys</dt>
          <dd className="font-mono text-card-foreground">{sessionKeyCount}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onUpgrade}
        disabled={!isReady}
        data-testid="upgrade-account-button"
        className="btn-primary w-full px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none">
        {isPending ? "Upgrading..." : isUpgraded ? "Porto account active" : "Upgrade to Porto"}
      </button>

      {error && (
        <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}
