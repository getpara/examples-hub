import { PropsWithChildren, useMemo } from 'react';
import { WalletList, WalletWithType } from '../types/Wallet.js';
import { CosmosExternalWalletProvider, CosmosExternalWalletProviderConfig } from './CosmosExternalWalletContext.js';
import { ChainInfo } from '@keplr-wallet/types';
import { ConfigureGrazArgs, GrazProvider } from '@getpara/graz';

export type ParaCosmosProviderConfig = {
  wallets: WalletList;
  chains: ChainInfo[];
  /**
   * If true, the initial connection request will request to connect to all passed in chains.
   * If false, the initial connection request will only request for the selectedChainId.
   * Note: this will not affect the chain that's shown in the Para modal. Even if multiple chains are connected the modal will only display what's passed in via `selectedChainId`
   */
  multiChain?: boolean;
  /**
   * Selected chain to display in the Para modal.
   */
  selectedChainId?: string;
  /**
   * Called with the newly selected chainId when a the chain value is changed in the Para modal.
   */
  /**
   * If true, the initial connection request will use the Graz useSuggestChainAndConnect hook to connect to the selected wallet
   * Ref: https://graz.sh/docs/hooks/useSuggestChainAndConnect
   */
  shouldUseSuggestChainAndConnect?: boolean;
  onSwitchChain: (chainId: string) => void;
};

export type ParaGrazProviderProps = Omit<ConfigureGrazArgs, 'config' | 'chains'>;

export type ParaCosmosProviderProps = {
  config: ParaCosmosProviderConfig;
  internalConfig: CosmosExternalWalletProviderConfig;
  grazProviderProps: ParaGrazProviderProps;
};

export function ParaCosmosProvider({
  children,
  config,
  internalConfig,
  grazProviderProps,
}: ParaCosmosProviderProps & PropsWithChildren) {
  const para = internalConfig.para;

  const { chains, wallets } = config;

  const walletsWithType: WalletWithType[] = [];

  wallets.forEach(w => {
    const wallet = w();
    walletsWithType.push(wallet);
  });

  const cosmosExternalWalletProviderProps = useMemo(
    () => ({
      ...config,
      ...internalConfig,
      wallets: walletsWithType,
    }),
    [walletsWithType, config, internalConfig],
  );

  return (
    // Casting Para as any here to avoid ts errors due to the graz version being behind.
    // TODO: update graz para sdk to current version
    <GrazProvider grazOptions={{ chains, autoReconnect: true, para: para as any, ...grazProviderProps }}>
      <CosmosExternalWalletProvider {...cosmosExternalWalletProviderProps}>{children}</CosmosExternalWalletProvider>
    </GrazProvider>
  );
}
