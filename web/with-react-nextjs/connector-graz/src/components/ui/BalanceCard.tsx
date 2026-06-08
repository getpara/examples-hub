interface BalanceCardProps {
  address: string;
  networkName: string;
  balanceLabel: string;
  isLoading: boolean;
  hasBalance: boolean;
  faucetUrl: string;
  onRefresh: () => void;
}

export function BalanceCard({
  address,
  networkName,
  balanceLabel,
  isLoading,
  hasBalance,
  faucetUrl,
  onRefresh,
}: BalanceCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-fade-in-up">
      <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold">Cosmos Wallet</h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          data-testid="account-refresh-balance"
          className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="rounded-xl bg-muted/60 px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Network</p>
          <p className="text-sm font-medium" data-testid="account-network-display">
            {networkName}
          </p>
        </div>

        <div className="rounded-xl bg-muted/60 px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Address</p>
          <p className="text-sm font-mono break-all" data-testid="account-address-full">
            {address}
          </p>
        </div>

        <div className="rounded-xl bg-muted/60 px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Balance</p>
          <p className="text-sm font-mono font-medium" data-testid="account-balance-display">
            {balanceLabel}
          </p>
        </div>

        {!hasBalance && !isLoading && (
          <div className="rounded-xl bg-primary/8 border border-primary/15 px-4 py-3 animate-fade-in">
            <p className="text-sm text-muted-foreground mb-3">
              Need testnet tokens before sending a transfer.
            </p>
            <a
              href={faucetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm font-medium text-foreground hover:text-primary transition-colors">
              Open faucet -&gt;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
