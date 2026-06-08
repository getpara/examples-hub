interface GlobalWalletActionsProps {
  portfolioCount: number;
  supportedChains: string[];
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function GlobalWalletActions({
  portfolioCount,
  supportedChains,
  isRefreshing,
  onRefresh,
}: GlobalWalletActionsProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-fade-in-up-delayed">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">Portfolio</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Rhinestone returns balances for the supported chain set.
          </p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {portfolioCount} tokens
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {supportedChains.map((chain) => (
          <span
            key={chain}
            className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-card-foreground">
            {chain}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        data-testid="refresh-portfolio-button"
        className="btn-primary w-full px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none">
        {isRefreshing ? "Refreshing..." : "Refresh portfolio"}
      </button>
    </div>
  );
}
