import { ReactNode, createContext, useMemo } from 'react';
import { CommonChain, CommonWallet } from '../types/commonTypes';
import CapsuleWeb from '@usecapsule/web-sdk';

export const defaultEvmExternalWallet = {
  wallets: [],
  chains: [],
  chainId: undefined,
  username: undefined,
  avatar: undefined,
  disconnect: () => Promise.resolve(),
  switchChain: () => Promise.resolve({}),
};

export type EvmExternalWalletContextType = {
  wallets: CommonWallet[];
  chains: CommonChain[];
  chainId: number;
  username: string;
  avatar?: string;
  disconnect: () => Promise<void>;
  switchChain: (chainId: number) => Promise<{ error?: string[] }>;
};

export const EvmExternalWalletContext = createContext<EvmExternalWalletContextType>(defaultEvmExternalWallet);

export interface EvmExternalWalletProviderProps {
  children: ReactNode;
  capsule: CapsuleWeb;
  onSwitchWallet: (args: { address?: string; error?: string }) => void;
}

export function EvmExternalWalletProvider({ children }: EvmExternalWalletProviderProps) {
  const wallets = [] as CommonWallet[];
  const chains = [] as CommonChain[];
  const chainId = undefined;
  const username = undefined;
  const avatar = undefined;

  const disconnect = () => Promise.resolve();
  const switchChain = () => Promise.resolve({});

  return (
    <EvmExternalWalletContext.Provider
      value={useMemo(
        () => ({ wallets, chains, chainId, username, avatar, disconnect, switchChain }),
        [wallets, chains, chainId, username, avatar, disconnect, switchChain],
      )}
    >
      {children}
    </EvmExternalWalletContext.Provider>
  );
}
