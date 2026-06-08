import Image from "next/image";
import type { ReactNode } from "react";

interface HeaderProps {
  connectButton: ReactNode;
}

export function Header({ connectButton }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Image src="/para.svg" alt="Para" width={28} height={28} priority />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-card-foreground">Para</p>
            <p className="truncate text-xs text-muted-foreground">RainbowKit example</p>
          </div>
        </div>
        <div className="shrink-0">{connectButton}</div>
      </div>
    </header>
  );
}
