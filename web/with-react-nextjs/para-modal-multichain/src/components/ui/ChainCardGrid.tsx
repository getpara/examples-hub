import type { ReactNode } from "react";

interface ChainCardGridProps {
  children: ReactNode;
}

export function ChainCardGrid({ children }: ChainCardGridProps) {
  return (
    <div className="grid grid-cols-1 *:border-border max-md:[&>*+*]:border-t md:grid-cols-2 md:[&>*:nth-child(even)]:border-l md:[&>*:nth-child(n+3)]:border-t">
      {children}
    </div>
  );
}
