"use client";

import { useEffect } from "react";
import { ParaProvider } from "@/components/ParaProvider";
import { ConnectedHeader } from "@/components/layout/ConnectedHeader";

export function SolanaAnchorApp({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.solanaAnchorHydrated = "true";

    return () => {
      delete document.documentElement.dataset.solanaAnchorHydrated;
    };
  }, []);

  return (
    <div className="hydrated-app min-h-screen">
      <ParaProvider>
        <ConnectedHeader />
        <main>{children}</main>
      </ParaProvider>
    </div>
  );
}
