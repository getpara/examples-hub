import type { ReactNode } from "react";

interface FlushPanelProps {
  children: ReactNode;
}

export function FlushPanel({ children }: FlushPanelProps) {
  return <div className="px-gutter pt-8 md:px-sheet-x">{children}</div>;
}
