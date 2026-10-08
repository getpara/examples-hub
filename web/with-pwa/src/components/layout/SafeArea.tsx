import type { ReactNode } from "react";

interface SafeAreaProps {
  edge: "top" | "bottom";
  children: ReactNode;
}

const EDGE_CLASSES: Record<SafeAreaProps["edge"], string> = {
  top: "sticky top-0 z-10 bg-background pt-[env(safe-area-inset-top)]",
  bottom: "bg-background pb-[env(safe-area-inset-bottom)]",
};

export function SafeArea({ edge, children }: SafeAreaProps) {
  return <div className={EDGE_CLASSES[edge]}>{children}</div>;
}
