import type { ReactNode } from "react";

interface StatusHintProps {
  children: ReactNode;
}

export function StatusHint({ children }: StatusHintProps) {
  return (
    <p role="status" className="text-center text-caption text-muted">
      {children}
    </p>
  );
}
