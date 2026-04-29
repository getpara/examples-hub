import Image from "next/image";

interface HeaderProps {
  isConnected: boolean;
  address: string;
  canClaim: boolean;
  onConnect: () => void;
}

export function Header({ isConnected, address, canClaim, onConnect }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-card/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <Image src="/para.svg" alt="Para" width={21} height={20} className="h-5 w-auto" />
          <span className="text-xs font-medium text-muted-foreground">Pregen Claim</span>
        </div>

        {isConnected ? (
          <button
            onClick={onConnect}
            data-testid="account-address-display"
            data-address={address}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-1.5 text-sm transition-all hover:bg-muted">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="font-mono text-xs">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </button>
        ) : (
          <button
            onClick={onConnect}
            data-testid="header-connect-button"
            disabled={!canClaim}
            className="btn-primary px-5 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-none">
            Begin claim
          </button>
        )}
      </div>
    </header>
  );
}
