import { ReactNode, createContext, useMemo } from 'react';
import { CommonChain, CommonWallet } from '../types/commonTypes';
import CapsuleWeb from '@usecapsule/web-sdk';

export const defaultCosmosExternalWallet = {
  wallets: [],
  chains: [],
  chainId: undefined,
  disconnect: () => Promise.resolve(),
  switchChain: () => Promise.resolve({}),
};

export type CosmosExternalWalletContextType = {
  wallets: CommonWallet[];
  chains: CommonChain[];
  chainId: string;
  disconnect: () => Promise<void>;
  switchChain: (chainId: string) => Promise<{ error?: string[] }>;
};

export const CosmosExternalWalletContext = createContext<CosmosExternalWalletContextType>(defaultCosmosExternalWallet);

export interface CosmosExternalWalletProviderProps {
  children: ReactNode;
  capsule: CapsuleWeb;
  onSwitchWallet: (args: { address?: string; error?: string }) => void;
}

export function CosmosExternalWalletProvider({ children }: CosmosExternalWalletProviderProps) {
  const wallets = [] as CommonWallet[];
  const chains = [] as CommonChain[];
  const chainId = undefined;

  const disconnect = () => Promise.resolve();
  const switchChain = () => Promise.resolve({});

  return (
    <CosmosExternalWalletContext.Provider
      value={useMemo(
        () => ({ wallets, chains, chainId, disconnect, switchChain }),
        [wallets, chains, chainId, disconnect, switchChain],
      )}
    >
      {children}
    </CosmosExternalWalletContext.Provider>
  );
}
