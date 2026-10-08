import type { ReactNode } from "react";

interface AsideEmptyProps {
  children: ReactNode;
}

export function AsideEmpty({ children }: AsideEmptyProps) {
  return (
    <p className="grid min-h-50 place-content-center border border-dashed border-border-strong p-6 text-center text-caption text-muted">
      {children}
    </p>
  );
}
