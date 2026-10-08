import type { ReactNode } from "react";

interface SheetProps {
  children: ReactNode;
}

export function Sheet({ children }: SheetProps) {
  return (
    <div className="mx-auto grid w-full max-w-sheet flex-1 content-start divide-y divide-border border-border md:border-x">
      {children}
    </div>
  );
}
