interface WalletInfoProps {
  walletAddress: string;
  portoAccountAddress: string | null;
  chainName: string;
  relayUrl: string;
  isLoading: boolean;
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletInfo({
  walletAddress,
  portoAccountAddress,
  chainName,
  relayUrl,
  isLoading,
}: WalletInfoProps) {
  const accountAddress = portoAccountAddress ?? walletAddress;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-card-foreground">Account</h2>
        <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success-foreground">
          EIP-7702
        </span>
      </div>

      <dl className="space-y-4">
        <div>
          <dt className="text-sm text-muted-foreground mb-1">Para EOA</dt>
          <dd className="font-mono text-sm text-card-foreground">{shortAddress(walletAddress)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground mb-1">Porto account</dt>
          <dd className="font-mono text-sm text-card-foreground">
            {isLoading ? "Checking..." : shortAddress(accountAddress)}
          </dd>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-muted/60 p-3">
            <dt className="text-sm text-muted-foreground mb-1">Chain</dt>
            <dd className="text-sm font-medium text-card-foreground">{chainName}</dd>
          </div>
          <div className="rounded-xl bg-muted/60 p-3">
            <dt className="text-sm text-muted-foreground mb-1">Relay</dt>
            <dd className="text-sm font-mono text-card-foreground">{relayUrl.replace("https://", "")}</dd>
          </div>
        </div>
      </dl>
    </div>
  );
}
