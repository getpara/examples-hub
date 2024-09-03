import { ReactNode, createContext, useContext, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletList } from '../types/Wallet';

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
  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={[]} localStorageKey="capsuleSolanaExternal" autoConnect>
        <CapsuleSolanaContext.Provider value={useMemo(() => ({ wallets: walletFns }), [walletFns])}>
          {children}
        </CapsuleSolanaContext.Provider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

export const useCapsuleSolana = () => useContext(CapsuleSolanaContext);
