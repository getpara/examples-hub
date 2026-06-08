interface WalletInfoProps {
  address?: string;
}

function formatAddress(address?: string) {
  if (!address) {
    return "Unknown address";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletInfo({ address }: WalletInfoProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border/60 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <h2 className="text-sm font-semibold text-card-foreground">Connected wallet</h2>
        </div>
      </div>
      <div className="px-6 py-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Address</p>
        <p className="mt-2 break-all font-mono text-sm font-medium text-card-foreground" data-testid="account-address-display">
          {formatAddress(address)}
        </p>
      </div>
    </div>
  );
}
