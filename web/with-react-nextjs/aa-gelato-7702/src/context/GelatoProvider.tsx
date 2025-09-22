"use client";

import { createContext, useContext, ReactNode } from "react";
import { useGelatoSmartWallet, type GelatoSmartWalletState, type SponsoredTransactionResult } from "@/hooks/useGelatoSmartWallet";

interface GelatoContextValue extends GelatoSmartWalletState {
  sendSponsoredTransaction: () => Promise<SponsoredTransactionResult>;
  isReady: boolean;
}

const GelatoContext = createContext<GelatoContextValue | null>(null);

export function GelatoProvider({ children }: { children: ReactNode }) {
  const gelatoWallet = useGelatoSmartWallet();

  return <GelatoContext.Provider value={gelatoWallet}>{children}</GelatoContext.Provider>;
}

export function useGelato() {
  const context = useContext(GelatoContext);
  if (!context) {
    throw new Error("useGelato must be used within a GelatoProvider");
  }
  return context;
}
