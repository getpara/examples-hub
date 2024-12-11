import { ReactNode, createContext, useEffect, useMemo, useState } from 'react';
import { CommonChain, CommonWallet } from '../types/CommonTypes.js';
import { useCapsuleCosmos } from './CapsuleCosmosContext.js';
import CapsuleWeb, { WalletType } from '@usecapsule/react-sdk';
import {
  checkWallet,
  WalletType as GrazWalletType,
  useAccount,
  useActiveChainIds,
  useActiveWalletType,
  useConnect,
  useDisconnect,
} from '@usecapsule/graz';

export const defaultCosmosExternalWallet = {
  wallets: [],
  chains: [],
  chainId: undefined,
  disconnect: () => Promise.resolve(),
  switchChain: () => Promise.resolve({}),
};

export const CosmosExternalWalletContext = createContext<{
  wallets: CommonWallet[];
  chains: CommonChain[];
  chainId: string;
  disconnect: () => Promise<void>;
  switchChain: (chainId: string) => Promise<{ error?: string[] }>;
}>(defaultCosmosExternalWallet);

interface CosmosExternalWalletProviderProps {
  children: ReactNode;
  capsule: CapsuleWeb;
  onSwitchWallet: (args: { address?: string; error?: string }) => void;
}

export function CosmosExternalWalletProvider({ children, capsule, onSwitchWallet }: CosmosExternalWalletProviderProps) {
  const { selectedChainId, wallets: incompleteWallets, chains, multiChain, onSwitchChain } = useCapsuleCosmos();
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
  const [isLocalConnecting, setIsLocalConnecting] = useState(false);

  const bufferAddress = multiChain ? account?.[selectedChainId]?.address.toString() : account?.address.toString();
  const address = multiChain ? account?.[selectedChainId]?.bech32Address : account?.bech32Address;

  const reset = async () => {
    await disconnectAsync();
    await capsule.logout(true);
  };

  const switchChain = async (chainId: string) => {
    let error: string[];

    const hasActiveChain = activeChainIds.includes(chainId);

    if (!hasActiveChain) {
      setIsLocalConnecting(true);
      let changeResp: { address?: string; bufferAddress?: string; error?: string };

      changeResp = await connect(walletType, chainId);
      // Calling onSwitchWallet here so the modal correctly processes any error from the reconnection.
      onSwitchWallet(changeResp);

      setIsLocalConnecting(false);

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
      await capsule.externalWalletLogin(bufferAddress, WalletType.COSMOS, providerName, address);
    } catch (err) {
      await reset();

      throw 'Error logging you in. Please try again.';
    }
  };

  useEffect(() => {
    const storedExternalWallet = capsule.externalWallets[bufferAddress ?? ''];

    if (
      !isConnecting &&
      !isReconnecting &&
      !isLocalConnecting &&
      address &&
      storedExternalWallet &&
      storedExternalWallet.address !== address
    ) {
      capsule.setExternalWallet(bufferAddress, WalletType.COSMOS, getProviderName(walletType), address);
    }
  }, [isConnecting, isReconnecting, address]);

  useEffect(() => {
    const storedExternalWallet = capsule.externalWallets[bufferAddress ?? ''];

    if (!isConnecting && !isReconnecting && !isLocalConnecting && !!bufferAddress && !storedExternalWallet) {
      reset();
    }
  }, [isConnecting, isReconnecting]);

  const connect = async (
    walletType: GrazWalletType,
    chainId?: string | string[],
  ): Promise<{ address?: string; bufferAddress?: string; error?: string }> => {
    setIsLocalConnecting(true);

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
        const connectedWallet = await connectAsync({ walletType, chainId: _chainId });

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
          error = 'An unknown error occurred.';
        }
      }
    }

    setIsLocalConnecting(false);
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

  return (
    <CosmosExternalWalletContext.Provider
      value={useMemo(
        () => ({ wallets, chains: formattedChains, chainId: selectedChainId, disconnect: disconnectAsync, switchChain }),
        [wallets, formattedChains, selectedChainId, disconnectAsync, switchChain],
      )}
    >
      {children}
    </CosmosExternalWalletContext.Provider>
  );
}
