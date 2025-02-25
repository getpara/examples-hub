import { PropsWithChildren, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletList } from '../types/Wallet.js';
import { SolanaExternalWalletProvider, SolanaExternalWalletProviderConfig } from './SolanaExternalWalletContext.js';
import {
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  createDefaultWalletNotFoundHandler,
  SolanaMobileWalletAdapter,
} from '@solana-mobile/wallet-adapter-mobile';
import { type ConnectionConfig } from '@solana/web3.js';
import { Chain } from '@solana-mobile/mobile-wallet-adapter-protocol';

export interface ParaSolanaProviderConfig {
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

export type ParaSolanaProviderProps = {
  config: ParaSolanaProviderConfig;
  internalConfig: SolanaExternalWalletProviderConfig;
};

export function ParaSolanaProvider({ children, config, internalConfig }: ParaSolanaProviderProps & PropsWithChildren) {
  const { wallets: walletFns, endpoint, appIdentity, chain, connectionConfig } = config;

  const solanaExternalWalletProviderProps = useMemo(
    () => ({ wallets: walletFns, ...internalConfig }),
    [walletFns, internalConfig],
  );

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
        autoConnect={true}
      >
        <SolanaExternalWalletProvider {...solanaExternalWalletProviderProps}>{children}</SolanaExternalWalletProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
