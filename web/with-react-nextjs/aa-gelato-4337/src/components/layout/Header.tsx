import Image from "next/image";

interface HeaderProps {
  isConnected: boolean;
  address: string;
  onConnect: () => void;
}

export function Header({ isConnected, address, onConnect }: HeaderProps) {
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/para.svg" alt="Para" width={60} height={20} className="h-5 w-auto" />
          <span className="text-xs font-medium text-muted-foreground">Gelato AA Example</span>
        </div>

        {isConnected ? (
          <button
            type="button"
            onClick={onConnect}
            data-testid="account-address-display"
            data-address={address}
            className="flex items-center gap-2.5 px-4 py-1.5 text-sm rounded-lg border border-border bg-card hover:bg-muted transition-all cursor-pointer">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="font-mono text-xs">{shortAddress}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            data-testid="header-connect-button"
            className="btn-primary px-5 py-1.5 text-sm">
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
