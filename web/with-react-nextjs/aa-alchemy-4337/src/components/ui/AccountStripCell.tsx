import type { ReactNode } from "react";
import { cx } from "@/lib/classNames";

interface AccountStripCellProps {
  label: string;
  children: ReactNode;
  isWide?: boolean;
  isMedium?: boolean;
  isBusy?: boolean;
}

export function AccountStripCell({ label, children, isWide = false, isMedium = false, isBusy = false }: AccountStripCellProps) {
  return (
    <div
      aria-busy={isBusy || undefined}
      className={cx(
        "grid min-w-0 flex-1 content-center gap-2 border-border px-gutter py-4 md:px-sheet-x",
        isWide ? "md:flex-[2.4_1_0]" : isMedium ? "md:flex-[1.6_1_0]" : "md:flex-[1_1_0]"
      )}>
      <span className="font-mono text-mono-label text-muted uppercase">{label}</span>
      <div className="flex min-h-7 min-w-0 items-center gap-2">{children}</div>
    </div>
  );
}
