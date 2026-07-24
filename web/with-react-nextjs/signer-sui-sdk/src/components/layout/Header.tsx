import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  address: string;
  isConnected: boolean;
  onConnect: () => void;
  showBackLink: boolean;
}

export function Header({ address, isConnected, onConnect, showBackLink }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/para.svg" alt="Para" width={28} height={28} priority className="h-5 w-auto" />
            <span className="text-xs font-medium text-muted-foreground">Sui SDK</span>
          </Link>

          {showBackLink && (
            <Link
              href="/"
              className="hidden rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground sm:inline-flex">
              Back to demos
            </Link>
          )}
        </div>

        {isConnected ? (
          <button
            type="button"
            onClick={onConnect}
            data-testid="account-address-display"
            data-address={address}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-1.5 text-sm transition-all hover:bg-muted cursor-pointer">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="font-mono text-xs">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Loading"}
            </span>
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
