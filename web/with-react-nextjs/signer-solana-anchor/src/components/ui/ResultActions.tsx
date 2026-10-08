import type { ReactNode } from "react";

export function ResultActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-x-5 gap-y-2">{children}</div>;
}
