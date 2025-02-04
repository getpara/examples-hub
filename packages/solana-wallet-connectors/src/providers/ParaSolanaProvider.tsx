import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletList } from '../types/Wallet.js';
import { useExternalWalletProviderStore } from '@getpara/react-sdk';
import { SolanaExternalWalletContext, SolanaExternalWalletProvider } from './SolanaExternalWalletContext.js';
import {
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  createDefaultWalletNotFoundHandler,
  SolanaMobileWalletAdapter,
} from '@solana-mobile/wallet-adapter-mobile';
import { type ConnectionConfig } from '@solana/web3.js';
import { Chain } from '@solana-mobile/mobile-wallet-adapter-protocol';

export const defaultWallet = {
  wallets: [],
};

export const ParaSolanaContext = createContext<{
  wallets: WalletList;
}>(defaultWallet);

interface ParaSolanaProviderProps {
  children: ReactNode;
  wallets: WalletList;
  /** Endpoint passed to the ConnectionProvider
   * Ref: https://solana-labs.github.io/solana-web3.js/classes/Connection.html
   */
  endpoint: string;
  /** Optional config for the Connection Provider
   * Ref: https://solana-labs.github.io/solana-web3.js/types/ConnectionConfig.html
   */
  connectionConfig?: ConnectionConfig;
  /** App identity for the Solana mobile wallet adapter
   * Ref: https://docs.solanamobile.com/reference/typescript/mobile-wallet-adapter#web3mobilewalletauthorize
   */
  appIdentity: {
    name?: string;
    uri?: string;
    icon?: string;
  };
  /** Chain to use for the Solana mobile wallet adapter
   * Ref: https://docs.solanamobile.com/reference/typescript/mobile-wallet-adapter#web3mobilewalletauthorize
   */
  chain: Chain;
}

export function ParaSolanaProvider({
  children,
  wallets: walletFns,
  endpoint,
  appIdentity,
  chain,
  connectionConfig,
}: ParaSolanaProviderProps) {
  const updateExternalWalletProviderState = useExternalWalletProviderStore(state => state.updateState);
  const SolanaProvider = useExternalWalletProviderStore(state => state.SolanaProvider);
  const solanaContext = useExternalWalletProviderStore(state => state.solanaContext);
  const [shouldAutoConnect, setShouldAutoConnect] = useState(true);

  // Only auto connect on initial render, after that rely on our connect function
  useEffect(() => {
    setShouldAutoConnect(false);
  }, []);

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
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <SolanaWalletProvider
        wallets={[
          new SolanaMobileWalletAdapter({
            addressSelector: createDefaultAddressSelector(),
            appIdentity,
            authorizationResultCache: createDefaultAuthorizationResultCache(),
            chain,
            onWalletNotFound: createDefaultWalletNotFoundHandler(),
          }),
        ]}
        localStorageKey="paraSolanaExternal"
        autoConnect={shouldAutoConnect}
      >
        <ParaSolanaContext.Provider value={value}>{children}</ParaSolanaContext.Provider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

export const useParaSolana = () => useContext(ParaSolanaContext);
