import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { WalletList, WalletWithType } from '../types/Wallet.js';
import { useExternalWalletProviderStore } from '@usecapsule/react-sdk';
import { CosmosExternalWalletContext, CosmosExternalWalletProvider } from './CosmosExternalWalletContext.js';
import { ChainInfo } from '@keplr-wallet/types';
import { ConfigureGrazArgs, GrazProvider, WalletType, connect } from '@usecapsule/graz';

export const CapsuleCosmosContext = createContext<{
  selectedChainId?: string;
  wallets: WalletWithType[];
  chains: ChainInfo[];
  multiChain?: boolean;
  shouldUseSuggestChainAndConnect?: boolean;
  onSwitchChain: (chainId: string) => void;
}>({ wallets: [], chains: [], onSwitchChain: () => {} });

interface CapsuleCosmosProviderProps extends Omit<ConfigureGrazArgs, 'chains'> {
  children: ReactNode;
  wallets: WalletList;
  chains: ChainInfo[];
  /**
   * If true, the initial connection request will request to connect to all passed in chains.
   * If false, the initial connection request will only request for the selectedChainId.
   * Note: this will not affect the chain that's shown in the Capsule modal. Even if multiple chains are connected the modal will only display what's passed in via `selectedChainId`
   */
  multiChain?: boolean;
  /**
   * Selected chain to display in the Capsule modal.
   */
  selectedChainId?: string;
  /**
   * Called with the newly selected chainId when a the chain value is changed in the Capsule modal.
   */
  /**
   * If true, the initial connection request will use the Graz useSuggestChainAndConnect hook to connect to the selected wallet
   * Ref: https://graz.sh/docs/hooks/useSuggestChainAndConnect
   */
  shouldUseSuggestChainAndConnect?: boolean;
  onSwitchChain: (chainId: string) => void;
}

export function CapsuleCosmosProvider({
  children,
  wallets,
  chains,
  selectedChainId,
  multiChain,
  shouldUseSuggestChainAndConnect,
  onSwitchChain,
  ...grazOpts
}: CapsuleCosmosProviderProps) {
  const updateExternalWalletProviderState = useExternalWalletProviderStore(state => state.updateState);
  const CosmosProvider = useExternalWalletProviderStore(state => state.CosmosProvider);
  const cosmosContext = useExternalWalletProviderStore(state => state.cosmosContext);

  const connectCapsuleCosmosWallet = useCallback(async (): Promise<{ result?: unknown; error?: string }> => {
    if (!grazOpts.capsule) {
      return { error: 'No capsule instance passed to Graz' };
    }

    try {
      const chainId = multiChain ? chains.map(c => c.chainId) : selectedChainId;
      const result = await connect({ walletType: WalletType.CAPSULE_EMBEDDED, chainId });
      return { result };
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      return { error };
    }
  }, [connect]);

  useEffect(() => {
    if (!cosmosContext || !CosmosProvider) {
      updateExternalWalletProviderState({
        CosmosProvider: CosmosExternalWalletProvider,
        cosmosContext: CosmosExternalWalletContext,
        connectCapsuleCosmosWallet,
      });
    }
  }, []);

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
    <GrazProvider grazOptions={{ chains, autoReconnect: true, ...grazOpts }}>
      <CapsuleCosmosContext.Provider value={value}>{children}</CapsuleCosmosContext.Provider>
    </GrazProvider>
  );
}

export const useCapsuleCosmos = () => useContext(CapsuleCosmosContext);
