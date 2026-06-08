import Image from "next/image";
import { formatAddress } from "@/utils/format";

interface HeaderProps {
  address?: string;
  isConnected: boolean;
  onConnect: () => void;
}

export function Header({ address, isConnected, onConnect }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Image src="/para.svg" alt="Para" width={28} height={28} priority />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-card-foreground">Para</p>
            <p className="truncate text-xs text-muted-foreground">Reown AppKit example</p>
          </div>
        </div>
        <button type="button" onClick={onConnect} className="btn-primary shrink-0 px-4 py-2 text-sm">
          {isConnected && address ? formatAddress(address) : "Connect Wallet"}
        </button>
      </div>
    </header>
  );
}
