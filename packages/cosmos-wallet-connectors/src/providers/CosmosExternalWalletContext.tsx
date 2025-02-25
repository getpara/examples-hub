import { PropsWithChildren, createContext, useCallback, useEffect, useMemo } from 'react';
import { ParaCosmosProviderConfig } from './ParaCosmosContext.js';
import {
  checkWallet,
  WalletType as GrazWalletType,
  useAccount,
  useActiveChainIds,
  useActiveWalletType,
  useConnect,
  useDisconnect,
  useSuggestChainAndConnect,
  getChainInfo,
} from '@getpara/graz';
import { useExternalWalletStore } from '../stores/useStore.js';
import { WalletWithType } from '../types/Wallet.js';
import ParaWeb, { WalletType } from '@getpara/web-sdk';
import type { CommonChain, CommonWallet } from '@getpara/react-common';

const defaultCosmosExternalWallet = {
  wallets: [],
  chains: [],
  chainId: undefined,
  disconnect: () => Promise.resolve(),
  switchChain: () => Promise.resolve({}),
  connectParaEmbedded: () => Promise.resolve({}),
};

export type CosmosExternalWalletContextType = {
  wallets: CommonWallet[];
  chains: CommonChain[];
  chainId?: string;
  disconnect: () => Promise<void>;
  switchChain: (chainId: string) => Promise<{ error?: string[] }>;
  connectParaEmbedded: () => Promise<{ result?: unknown; error?: string }>;
};

export type CosmosExternalWalletProviderConfig = {
  onSwitchWallet?: (args: { address?: string; error?: string }) => void;
  para: ParaWeb;
};

export type CosmosExternalWalletProviderConfigFull = {
  wallets: WalletWithType[];
} & Omit<ParaCosmosProviderConfig, 'wallets'> &
  CosmosExternalWalletProviderConfig;

export const CosmosExternalWalletContext = createContext<CosmosExternalWalletContextType>(defaultCosmosExternalWallet);

export function CosmosExternalWalletProvider({
  children,
  onSwitchWallet,
  selectedChainId,
  wallets: incompleteWallets,
  chains,
  multiChain,
  shouldUseSuggestChainAndConnect,
  onSwitchChain,
  para,
}: CosmosExternalWalletProviderConfigFull & PropsWithChildren) {
  const { suggestAndConnectAsync } = useSuggestChainAndConnect();
  const {
    data: account,
    isConnecting,
    isReconnecting,
  } = useAccount({
    chainId: multiChain ? chains.map(c => c.chainId) : selectedChainId,
    multiChain,
  });
  const activeChainIds = useActiveChainIds();
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { walletType } = useActiveWalletType();
  const isLocalConnecting = useExternalWalletStore(state => state.isConnecting);
  const updateExternalWalletState = useExternalWalletStore(state => state.updateState);

  const bufferAddress = multiChain ? account?.[selectedChainId]?.address.toString() : account?.address.toString();
  const address = multiChain ? account?.[selectedChainId]?.bech32Address : account?.bech32Address;

  const reset = async () => {
    await disconnectAsync();
    await para.logout();
  };

  const switchChain = async (chainId: string) => {
    let error: string[];

    const hasActiveChain = activeChainIds.includes(chainId);

    if (!hasActiveChain) {
      updateExternalWalletState({ isConnecting: true });
      let changeResp: { address?: string; bufferAddress?: string; error?: string };

      changeResp = await connect(walletType, chainId);
      // Calling onSwitchWallet here so the modal correctly processes any error from the reconnection.
      onSwitchWallet(changeResp);

      updateExternalWalletState({ isConnecting: false });

      if (changeResp.error) {
        error = [changeResp?.error];
      }
    }

    if (!error) {
      onSwitchChain(chainId);
    }
    return { error };
  };

  const login = async (bufferAddress: string, address: string, providerName?: string) => {
    try {
      await para.externalWalletLogin({
        address: bufferAddress,
        type: WalletType.COSMOS,
        provider: providerName,
        addressBech32: address,
      });
    } catch (err) {
      await reset();

      throw 'Error logging you in. Please try again.';
    }
  };

  useEffect(() => {
    const storedExternalWallet = para.externalWallets[bufferAddress ?? ''];

    if (
      !isConnecting &&
      !isReconnecting &&
      !isLocalConnecting &&
      address &&
      storedExternalWallet &&
      storedExternalWallet.address !== address &&
      walletType !== GrazWalletType.PARA
    ) {
      para.setExternalWallet({
        address: bufferAddress,
        type: WalletType.COSMOS,
        provider: getProviderName(walletType),
        addressBech32: address,
      });
    }
  }, [isConnecting, isReconnecting, address]);

  useEffect(() => {
    const storedExternalWallet = para.externalWallets[bufferAddress ?? ''];

    if (
      !isConnecting &&
      !isReconnecting &&
      !isLocalConnecting &&
      !!bufferAddress &&
      !storedExternalWallet &&
      walletType !== GrazWalletType.PARA
    ) {
      reset();
    }
  }, [isConnecting, isReconnecting]);

  const connect = async (
    walletType: GrazWalletType,
    chainId?: string | string[],
  ): Promise<{ address?: string; bufferAddress?: string; error?: string }> => {
    updateExternalWalletState({ isConnecting: true });

    // chainID is passed in when switching chains, in that case we can skip disconnecting
    if (!chainId) {
      await disconnectAsync();
    }

    const _chainId = chainId ?? (multiChain ? chains.map(c => c.chainId) : selectedChainId);

    if (!_chainId) {
      console.error('Chain id not provided.');
      return;
    }

    let address: string | undefined;
    let bufferAddress: string | undefined;
    let error: string | undefined;

    // The logic in the modal should prevent this from happening, logging for edge cases.
    if (!walletType) {
      console.error('Graz wallet type not provided.');
      return;
    } else {
      try {
        let chainInfo;

        if (shouldUseSuggestChainAndConnect) {
          if (typeof _chainId !== 'string') {
            console.error('multiChain is not compatible with shouldUseSuggestChainAndConnect.');
            return;
          }

          chainInfo = getChainInfo({ chainId: _chainId });

          if (!chainInfo) {
            console.error('Chain not found.');
            return;
          }
        }

        const connectedWallet = await (shouldUseSuggestChainAndConnect
          ? suggestAndConnectAsync({ walletType, chainInfo })
          : connectAsync({ walletType, chainId: _chainId }));

        const firstChain = typeof _chainId === 'string' ? _chainId : _chainId[0];

        address = connectedWallet.accounts[firstChain].bech32Address;
        bufferAddress = connectedWallet.accounts[firstChain].address.toString();

        if (connectedWallet.accounts[firstChain]) {
          try {
            await login(bufferAddress, address, getProviderName(walletType));
          } catch (err) {
            bufferAddress = undefined;
            address = undefined;
            error = err;
          }
        }
      } catch (err) {
        if (err.message === 'No wallet exists') {
          error = err.message;
        } else {
          console.error('Graz connection error:', err);
          error = 'An unknown error occurred.';
        }
      }
    }

    updateExternalWalletState({ isConnecting: false });
    return { address, bufferAddress, error };
  };

  const getProviderName = (walletType: GrazWalletType) =>
    incompleteWallets.find(w => w.grazType === walletType || w.grazMobileType === walletType)?.name;

  const wallets = incompleteWallets
    .map(wallet => {
      return {
        connect: () => connect(wallet.grazType),
        connectMobile: () => connect(wallet.grazMobileType),
        getQrUri: () => '',
        type: WalletType.COSMOS,
        ...wallet,
        installed: checkWallet(wallet.grazType),
      } as CommonWallet;
    })
    .filter(w => !!w);

  const formattedChains: CommonChain[] = chains.map(c => {
    return {
      id: c.chainId,
      name: c.chainName,
    };
  });

  const connectParaEmbedded = useCallback(async (): Promise<{ result?: unknown; error?: string }> => {
    if (!para) {
      return { error: 'No para instance available' };
    }

    try {
      const chainId = multiChain ? chains.map(c => c.chainId) : selectedChainId;
      const result = await connectAsync({ walletType: GrazWalletType.PARA, chainId });
      return { result };
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      return { error };
    }
  }, [para, multiChain, chains, selectedChainId]);

  return (
    <CosmosExternalWalletContext.Provider
      value={useMemo(
        () => ({
          wallets,
          chains: formattedChains,
          chainId: selectedChainId,
          disconnect: disconnectAsync,
          switchChain,
          connectParaEmbedded,
        }),
        [wallets, formattedChains, selectedChainId, disconnectAsync, switchChain, connectParaEmbedded],
      )}
    >
      {children}
    </CosmosExternalWalletContext.Provider>
  );
}
