import { ReactNode, createContext, useContext, useEffect, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletList } from '../types/Wallet';
import { useExternalWalletProviderStore } from '@usecapsule/react-sdk';
import { SolanaExternalWalletContext, SolanaExternalWalletProvider } from './SolanaExternalWalletContext';

export const defaultWallet = {
  wallets: [],
};

export const CapsuleSolanaContext = createContext<{
  wallets: WalletList;
}>(defaultWallet);

interface CapsuleSolanaProviderProps {
  children: ReactNode;
  wallets: WalletList;
  endpoint: string;
}

export function CapsuleSolanaProvider({ children, wallets: walletFns, endpoint }: CapsuleSolanaProviderProps) {
  const updateExternalWalletProviderState = useExternalWalletProviderStore(state => state.updateState);
  const SolanaProvider = useExternalWalletProviderStore(state => state.SolanaProvider);
  const solanaContext = useExternalWalletProviderStore(state => state.solanaContext);

  useEffect(() => {
    if (!solanaContext || !SolanaProvider) {
      updateExternalWalletProviderState({
        SolanaProvider: SolanaExternalWalletProvider,
        solanaContext: SolanaExternalWalletContext,
      });
    }
  }, []);

  const value = useMemo(() => ({ wallets: walletFns }), [walletFns]);

  if (!solanaContext || !SolanaProvider) {
    return null;
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={[]} localStorageKey="capsuleSolanaExternal" autoConnect>
        <CapsuleSolanaContext.Provider value={value}>{children}</CapsuleSolanaContext.Provider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

export const useCapsuleSolana = () => useContext(CapsuleSolanaContext);
