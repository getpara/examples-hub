import { ReactNode, createContext, useMemo } from 'react';
import { CommonWallet } from '../types/commonTypes';
import CapsuleWeb from '@usecapsule/web-sdk';

export const defaultSolanaExternalWallet = {
  wallets: [],
  disconnect: () => Promise.resolve(),
};

export type SolanaExternalWalletContextType = {
  wallets: CommonWallet[];
  disconnect: () => Promise<void>;
};

export const SolanaExternalWalletContext = createContext<SolanaExternalWalletContextType>(defaultSolanaExternalWallet);

export interface SolanaExternalWalletProviderProps {
  children: ReactNode;
  capsule: CapsuleWeb;
  onSwitchWallet: (args: { address?: string; error?: string }) => void;
}

export function SolanaExternalWalletProvider({ children }: SolanaExternalWalletProviderProps) {
  const wallets = [] as CommonWallet[];

  const disconnect = () => Promise.resolve();

  return (
    <SolanaExternalWalletContext.Provider value={useMemo(() => ({ wallets, disconnect }), [wallets, disconnect])}>
      {children}
    </SolanaExternalWalletContext.Provider>
  );
}
