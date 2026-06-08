interface WalletInfoProps {
  walletAddress: string;
  delegatedAccountAddress: string | null;
  isLoading: boolean;
  error: Error | null;
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletInfo({ walletAddress, delegatedAccountAddress, isLoading, error }: WalletInfoProps) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-fade-in-up">
      <div className="px-6 py-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <h2 className="text-sm font-semibold">Connected Wallets</h2>
        </div>
      </div>

      <div className="divide-y divide-border/60">
        <div className="px-6 py-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Para Wallet
          </p>
          <p className="text-[13px] font-mono break-all leading-relaxed">{walletAddress}</p>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Gelato EIP-7702 Account
          </p>
          {isLoading ? (
            <p className="text-[13px] font-mono text-muted-foreground">Preparing delegated account...</p>
          ) : error ? (
            <div className="rounded-xl bg-destructive/8 border border-destructive/15 px-4 py-3 animate-fade-in">
              <p className="text-sm text-destructive break-words">{error.message}</p>
            </div>
          ) : delegatedAccountAddress ? (
            <div className="rounded-xl bg-muted/60 px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Address</p>
              <p
                className="text-[13px] font-mono break-all leading-relaxed"
                data-testid="delegated-account-address"
                title={delegatedAccountAddress}>
                {formatAddress(delegatedAccountAddress)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Gelato operates in EIP-7702 mode and delegates smart account behavior to the connected EOA.
              </p>
            </div>
          ) : (
            <p className="text-[13px] font-mono text-muted-foreground">Not available</p>
          )}
        </div>
      </div>
    </div>
  );
}
