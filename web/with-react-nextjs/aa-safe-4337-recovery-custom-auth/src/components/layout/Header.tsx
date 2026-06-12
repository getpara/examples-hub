interface HeaderProps {
  isConnected: boolean;
  address: string;
  onDisconnect: () => void;
  isDisconnecting: boolean;
}

export function Header({ isConnected, address, onDisconnect, isDisconnecting }: HeaderProps) {
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-xs font-medium text-muted-foreground">Safe Recovery Custom Auth</span>
        </div>

        {isConnected ? (
          <button
            type="button"
            onClick={onDisconnect}
            disabled={isDisconnecting}
            data-testid="account-address-display"
            data-address={address}
            className="flex items-center gap-2.5 px-4 py-1.5 text-sm rounded-lg border border-border bg-card hover:bg-muted transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="font-mono text-xs">{isDisconnecting ? "Disconnecting..." : shortAddress}</span>
          </button>
        ) : (
          <span className="text-xs font-mono text-muted-foreground">Not connected</span>
        )}
      </div>
    </header>
  );
}
