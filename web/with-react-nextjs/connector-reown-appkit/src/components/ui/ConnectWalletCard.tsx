interface ConnectWalletCardProps {
  onConnect: () => void;
}

export function ConnectWalletCard({ onConnect }: ConnectWalletCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
      <div className="mb-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Get started</p>
        <h2 className="text-xl font-semibold tracking-tight text-card-foreground">Connect Wallet</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Open Reown AppKit and choose the Para wallet connector.
        </p>
      </div>

      <button type="button" onClick={onConnect} className="btn-primary w-full px-4 py-3">
        Connect Wallet
      </button>
    </div>
  );
}
