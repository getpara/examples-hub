interface WalletInfoProps {
  address: string;
  partyId?: string;
  balance?: string;
  isFetchingBalance?: boolean;
  balanceError?: Error | null;
  onRefreshBalance?: () => void;
}

export function WalletInfo({
  address,
  partyId,
  balance,
  isFetchingBalance,
  balanceError,
  onRefreshBalance,
}: WalletInfoProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm animate-fade-in-up">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-2 w-2 rounded-full bg-success" />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {partyId ? "Canton partyId" : "Connected"}
        </p>
      </div>
      <p className="text-[13px] font-mono break-all leading-relaxed">{partyId || address}</p>

      {partyId && onRefreshBalance && (
        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-border/60">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Amulet balance</p>
            <p className="text-sm font-mono">
              {isFetchingBalance
                ? "…"
                : balanceError
                  ? <span className="text-destructive">error</span>
                  : balance !== undefined
                    ? `${Number(balance).toFixed(8)} Amulet`
                    : <span className="text-muted-foreground">not fetched</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefreshBalance}
            data-testid="canton-balance-refresh"
            disabled={isFetchingBalance}
            className="shrink-0 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {isFetchingBalance ? "Loading…" : balance !== undefined ? "Refresh" : "Fetch balance"}
          </button>
        </div>
      )}
    </div>
  );
}
