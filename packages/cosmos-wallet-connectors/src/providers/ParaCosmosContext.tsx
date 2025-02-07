import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { WalletList, WalletWithType } from '../types/Wallet.js';
import { useClient, useExternalWalletProviderStore } from '@getpara/react-sdk';
import { CosmosExternalWalletContext, CosmosExternalWalletProvider } from './CosmosExternalWalletContext.js';
import { ChainInfo } from '@keplr-wallet/types';
import { ConfigureGrazArgs, GrazProvider, WalletType, connect } from '@getpara/graz';

export const ParaCosmosContext = createContext<{
  selectedChainId?: string;
  wallets: WalletWithType[];
  chains: ChainInfo[];
  multiChain?: boolean;
  shouldUseSuggestChainAndConnect?: boolean;
  onSwitchChain: (chainId: string) => void;
}>({ wallets: [], chains: [], onSwitchChain: () => {} });

interface ParaCosmosProviderProps extends Omit<ConfigureGrazArgs, 'chains'> {
  children: ReactNode;
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
}

export function ParaCosmosProvider({
  children,
  wallets,
  chains,
  selectedChainId,
  multiChain,
  shouldUseSuggestChainAndConnect,
  onSwitchChain,
  ...grazOpts
}: ParaCosmosProviderProps) {
  const updateExternalWalletProviderState = useExternalWalletProviderStore(state => state.updateState);
  const CosmosProvider = useExternalWalletProviderStore(state => state.CosmosProvider);
  const cosmosContext = useExternalWalletProviderStore(state => state.cosmosContext);
  const para = (grazOpts.para as any) ?? useClient();

  const connectParaCosmosWallet = useCallback(async (): Promise<{ result?: unknown; error?: string }> => {
    if (!para) {
      return { error: 'No para instance available' };
    }

    try {
      const chainId = multiChain ? chains.map(c => c.chainId) : selectedChainId;
      const result = await connect({ walletType: WalletType.PARA, chainId });
      return { result };
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      return { error };
    }
  }, [para, connect]);

  useEffect(() => {
    if (!cosmosContext || !CosmosProvider) {
      updateExternalWalletProviderState({
        CosmosProvider: CosmosExternalWalletProvider,
        cosmosContext: CosmosExternalWalletContext,
      });
    }
  }, []);

  useEffect(() => {
    updateExternalWalletProviderState({
      connectParaCosmosWallet,
    });
  }, [para]);

  const walletsWithType: WalletWithType[] = [];

  wallets.forEach(w => {
    const wallet = w();
    walletsWithType.push(wallet);
  });

  const value = useMemo(
    () => ({
      selectedChainId,
      wallets: walletsWithType,
      chains,
      multiChain,
      shouldUseSuggestChainAndConnect,
      onSwitchChain,
    }),
    [selectedChainId, walletsWithType, chains, multiChain, shouldUseSuggestChainAndConnect, onSwitchChain],
  );

  if (!cosmosContext || !CosmosProvider) {
    return null;
  }

  return (
    <GrazProvider grazOptions={{ chains, autoReconnect: true, ...grazOpts, para }}>
      <ParaCosmosContext.Provider value={value}>{children}</ParaCosmosContext.Provider>
    </GrazProvider>
  );
}

export const useParaCosmos = () => useContext(ParaCosmosContext);
