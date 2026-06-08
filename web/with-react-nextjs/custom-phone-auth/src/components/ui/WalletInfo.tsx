interface WalletInfoProps {
  address?: string;
}

export function WalletInfo({ address }: WalletInfoProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border/60 px-6 py-4">
        <h2 className="text-lg font-semibold text-card-foreground">Connected wallet</h2>
        <p className="mt-1 text-sm text-muted-foreground">Para wallet address</p>
      </div>
      <div className="px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Address</p>
        <p
          className="mt-2 break-all font-mono text-sm font-medium text-card-foreground"
          data-testid="account-address-display"
          data-address={address}>
          {address ?? "No wallet connected"}
        </p>
      </div>
    </div>
  );
}
