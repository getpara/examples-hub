import Image from "next/image";

interface HeaderProps {
  address?: string;
  isConnected: boolean;
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Header({ address, isConnected }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Image src="/para.svg" alt="Para" width={28} height={28} priority />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-card-foreground">Para</p>
            <p className="truncate text-xs text-muted-foreground">Email auth example</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
          {isConnected && address ? truncateAddress(address) : "Disconnected"}
        </div>
      </div>
    </header>
  );
}
