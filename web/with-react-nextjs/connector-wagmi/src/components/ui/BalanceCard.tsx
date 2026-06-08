interface BalanceCardProps {
  balance: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export function BalanceCard({ balance, isLoading, onRefresh }: BalanceCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Network</p>
          <h2 className="mt-1 text-sm font-semibold text-card-foreground">Sepolia</h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          data-testid="account-refresh-balance"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          title="Refresh balance">
          Refresh
        </button>
      </div>
      <div className="px-6 py-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Balance</p>
        <p className="mt-2 text-lg font-semibold text-card-foreground" data-testid="account-balance-display">
          {isLoading ? "Loading..." : balance}
        </p>
      </div>
    </div>
  );
}
