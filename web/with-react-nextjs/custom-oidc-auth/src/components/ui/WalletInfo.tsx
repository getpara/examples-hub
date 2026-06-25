interface WalletInfoProps {
  address: string;
}

export function WalletInfo({ address }: WalletInfoProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm animate-fade-in-up">
      <div className="border-b border-border/60 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <h2 className="text-sm font-semibold text-card-foreground">Connected wallet</h2>
        </div>
      </div>
      <div className="px-6 py-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Para wallet</p>
        <p
          className="break-all font-mono text-[13px] leading-relaxed text-card-foreground"
          data-testid="custom-oidc-wallet"
          title={address}
        >
          {address}
        </p>
      </div>
    </div>
  );
}
