interface WalletInfoProps {
  walletAddress: string;
  globalWalletAddress: string | null;
  isLoading: boolean;
  error: Error | null;
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletInfo({ walletAddress, globalWalletAddress, isLoading, error }: WalletInfoProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-card-foreground">Global wallet</h2>
        <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success-foreground">
          EIP-4337
        </span>
      </div>

      <dl className="space-y-4">
        <div>
          <dt className="text-sm text-muted-foreground mb-1">Para signer</dt>
          <dd className="font-mono text-sm text-card-foreground">{shortAddress(walletAddress)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground mb-1">Rhinestone address</dt>
          <dd className="font-mono text-sm text-card-foreground">
            {isLoading ? "Creating..." : globalWalletAddress ? shortAddress(globalWalletAddress) : "Not created"}
          </dd>
        </div>
      </dl>

      {error && (
        <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}
