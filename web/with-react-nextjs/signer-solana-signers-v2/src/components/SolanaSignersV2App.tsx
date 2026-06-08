"use client";

import { useEffect } from "react";
import { ParaProvider } from "@/components/ParaProvider";
import { ConnectedHeader } from "@/components/layout/ConnectedHeader";

export function SolanaSignersV2App({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.solanaSignersV2Hydrated = "true";

    return () => {
      delete document.documentElement.dataset.solanaSignersV2Hydrated;
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
