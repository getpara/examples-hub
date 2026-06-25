import Image from "next/image";

interface HeaderProps {
  isConnected: boolean;
  address: string;
  onDisconnect: () => void;
  isDisconnecting: boolean;
}

export function Header({ isConnected, address, onDisconnect, isDisconnecting }: HeaderProps) {
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <header className="sticky top-0 z-10 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <Image src="/para.svg" alt="Para" width={60} height={20} className="h-5 w-auto" priority />
          <span className="text-xs font-medium text-muted-foreground">Custom OIDC Example</span>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-2.5">
            <span
              className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground"
              data-testid="custom-oidc-address"
              data-address={address}
              title={address}>
              <span className="h-2 w-2 rounded-full bg-success" />
              {shortAddress}
            </span>
            <button
              type="button"
              onClick={onDisconnect}
              disabled={isDisconnecting}
              data-testid="custom-oidc-logout"
              className="btn-secondary px-3 py-1.5 text-xs">
              {isDisconnecting ? "Logging out…" : "Log out"}
            </button>
          </div>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">Not connected</span>
        )}
      </div>
    </header>
  );
}
