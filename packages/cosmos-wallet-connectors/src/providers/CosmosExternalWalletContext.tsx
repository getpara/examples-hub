import { PropsWithChildren, createContext, useCallback, useEffect, useMemo, useRef } from 'react';
import { ParaCosmosProviderConfig } from './ParaCosmosContext.js';
import {
  checkWallet,
  WalletType as GrazWalletType,
  useAccount,
  useActiveWalletType,
  useConnect,
  useDisconnect,
  useSuggestChainAndConnect,
  getChainInfo,
  getWallet as grazGetWallet,
} from '@getpara/graz';
import { useExternalWalletStore } from '../stores/useStore.js';
import { WalletWithType } from '../types/Wallet.js';
import ParaWeb, { AuthState, Wallet } from '@getpara/web-sdk';
import type { CommonChain, CommonWallet, TExternalWallet } from '@getpara/react-common';
import { formatEthHexAddress } from '../utils/formatEthHexAddress.js';

const defaultCosmosExternalWallet = {
  wallets: [],
  chains: [],
  chainId: undefined,
  disconnect: () => Promise.resolve(),
  switchChain: () => Promise.resolve({}),
  connectParaEmbedded: () => Promise.resolve({}),
  signMessage: () => Promise.resolve({}),
  signVerificationMessage: () => Promise.resolve({}),
};

export type CosmosExternalWalletContextType = {
  wallets: CommonWallet[];
  chains: CommonChain[];
  chainId?: string;
  disconnect: () => Promise<void>;
  switchChain: (chainId: string) => Promise<{ error?: string[] }>;
  connectParaEmbedded: () => Promise<{ result?: unknown; error?: string }>;
  signMessage: (message: string) => Promise<{ signature?: string; error?: string }>;
  signVerificationMessage: () => Promise<{
    address?: string;
    signature?: string;
    cosmosPublicKeyHex?: string;
    cosmosSigner?: string;
    error?: string;
    addressBech32?: string;
  }>;
};

export type CosmosExternalWalletProviderConfig = {
  onSwitchWallet?: (args: { address?: string; error?: string }) => void;
  para: ParaWeb;
  walletsWithFullAuth: TExternalWallet[];
  includeWalletVerification?: boolean;
  connectionOnly?: boolean;
  connectedWallet?: Omit<Wallet, 'signer'> | null;
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
  walletsWithFullAuth,
  connectedWallet,
  includeWalletVerification,
  connectionOnly,
}: CosmosExternalWalletProviderConfigFull & PropsWithChildren) {
  const { suggestAndConnectAsync } = useSuggestChainAndConnect();
  const {
    data: account,
    isConnecting,
    isReconnecting,
    isConnected,
  } = useAccount({
    chainId: multiChain ? chains.map(c => c.chainId) : (selectedChainId ?? ''),
    multiChain,
  });
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { walletType } = useActiveWalletType();
  const isLocalConnecting = useExternalWalletStore(state => state.isConnecting);
  const updateExternalWalletState = useExternalWalletStore(state => state.updateState);

  const ethAddress = multiChain
    ? account?.[selectedChainId]?.ethereumHexAddress?.toLowerCase()
    : account?.ethereumHexAddress?.toLowerCase();
  const address = multiChain ? account?.[selectedChainId]?.bech32Address : account?.bech32Address;

  const verificationMessage = useRef<string>();

  const reset = async () => {
    await disconnectAsync();
    await para.logout();
  };

  const switchChain = async (chainId: string) => {
    let error: string[];

    let changeResp: { address?: string; ethAddress?: string; error?: string } = {};

    try {
      let chainInfo;

      if (shouldUseSuggestChainAndConnect) {
        chainInfo = getChainInfo({ chainId });

        if (!chainInfo) {
          console.error('Chain not found.');
          return;
        }
      }

      const connectedWallet = await (shouldUseSuggestChainAndConnect
        ? suggestAndConnectAsync({ walletType, chainInfo })
        : connectAsync({ walletType, chainId }));

      changeResp.address = connectedWallet.accounts[chainId].bech32Address;
      changeResp.ethAddress = formatEthHexAddress(connectedWallet.accounts[chainId].address);
    } catch (err) {
      if (err.message === 'No wallet exists') {
        changeResp.error = err.message;
      } else {
        console.error('Graz connection error:', err);
        changeResp.error = 'An unknown error occurred.';
      }
    }
    onSwitchWallet(changeResp);

    if (!changeResp.error) {
      onSwitchChain(chainId);

      const storedExternalWallet = para.externalWallets[changeResp.ethAddress ?? ''];
      para.setExternalWallet({
        address: changeResp.ethAddress,
        type: 'COSMOS',
        provider: getProviderName(walletType),
        addressBech32: changeResp.address,
        withFullParaAuth: storedExternalWallet.isExternalWithParaAuth,
        withVerification: includeWalletVerification,
        isConnectionOnly: connectionOnly,
      });
    }
    return { error };
  };

  const login = async (ethAddress: string, address: string, isFullAuthWallet?: boolean, providerName?: string) => {
    try {
      return await para.loginExternalWallet({
        externalWallet: {
          address: ethAddress,
          type: 'COSMOS',
          provider: providerName,
          addressBech32: address,
          withFullParaAuth: isFullAuthWallet,
          withVerification: includeWalletVerification,
          isConnectionOnly: connectionOnly,
        },
      });
    } catch (err) {
      await reset();

      throw 'Error logging you in. Please try again.';
    }
  };

  useEffect(() => {
    const storedExternalWallet = para.externalWallets[ethAddress ?? ''];

    if (
      isConnected &&
      !isConnecting &&
      !isReconnecting &&
      !isLocalConnecting &&
      !!ethAddress &&
      !storedExternalWallet &&
      walletType !== GrazWalletType.PARA
    ) {
      reset();
    }
  }, [isConnecting, isLocalConnecting, isReconnecting, isConnected]);

  // Listen for wallet changes (from external provider -> Para or from Para -> external provider)
  useEffect(() => {
    const connect = async () => {
      if (
        !isLocalConnecting &&
        !isConnecting &&
        !isReconnecting &&
        connectedWallet &&
        connectedWallet.type === 'COSMOS' &&
        (connectedWallet.isExternal ? walletType !== connectedWallet.name?.toLowerCase() : walletType !== 'para')
      ) {
        const isLoggedIn = await para.isFullyLoggedIn();
        if (!isLoggedIn) {
          return;
        }

        const chainId = multiChain ? chains.map(c => c.chainId) : selectedChainId;
        await connectAsync({
          walletType: connectedWallet.isExternal
            ? (connectedWallet.name.toLowerCase() as GrazWalletType)
            : GrazWalletType.PARA,
          chainId,
        });
      }
    };

    connect();
  }, [isLocalConnecting, isConnecting, isReconnecting, walletType, connectedWallet]);

  const signMessage = async (message: string) => {
    const wallet = grazGetWallet(walletType);

    if (!wallet) {
      return { error: 'Connected wallet not found' };
    }

    try {
      const publicKey = (await wallet.getKey(selectedChainId)).pubKey;
      const signature = await wallet.signArbitrary(selectedChainId, address, message);

      return {
        address: ethAddress,
        addressBech32: address,
        signature: signature.signature,
        cosmosPublicKeyHex: Buffer.from(publicKey).toString('hex'),
        cosmosSigner: address,
      };
    } catch (e) {
      if (e.message.includes('Request rejected')) {
        return { error: 'Signature request rejected' };
      }
      return { error: 'An unknown error occurred' };
    }
  };

  const signVerificationMessage = async () => {
    const signature = await signMessage(verificationMessage.current);

    return signature;
  };

  const connect = async (
    walletType: GrazWalletType,
    chainId?: string | string[],
  ): Promise<{ authState?: AuthState; address?: string; ethAddress?: string; error?: string }> => {
    updateExternalWalletState({ isConnecting: true });

    const walletId = getWallet(walletType)?.id;
    const isFullAuthWallet = walletsWithFullAuth.includes(walletId.toUpperCase() as TExternalWallet);

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
    let ethAddress: string | undefined;
    let error: string | undefined;
    let authState: AuthState | undefined;

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

        const firstChain = !chainId ? selectedChainId : typeof _chainId === 'string' ? _chainId : _chainId[0];

        address = connectedWallet.accounts[firstChain].bech32Address;
        ethAddress = formatEthHexAddress(connectedWallet.accounts[firstChain].address);

        if (connectedWallet.accounts[firstChain]) {
          try {
            authState = await login(ethAddress, address, isFullAuthWallet, getProviderName(walletType));
            verificationMessage.current = authState.stage === 'verify' ? authState.signatureVerificationMessage : undefined;
          } catch (err) {
            authState = undefined;
            ethAddress = undefined;
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
    return { authState, address, ethAddress, error };
  };

  const getWallet = (walletType: GrazWalletType) =>
    incompleteWallets.find(w => w.grazType === walletType || w.grazMobileType === walletType);

  const getProviderName = (walletType: GrazWalletType) => getWallet(walletType)?.name;

  const wallets = incompleteWallets
    .map(wallet => {
      return {
        connect: () => connect(wallet.grazType),
        connectMobile: () => connect(wallet.grazType),
        getQrUri: () => '',
        type: 'COSMOS',
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
          signMessage,
          signVerificationMessage,
        }),
        [
          wallets,
          formattedChains,
          selectedChainId,
          disconnectAsync,
          switchChain,
          connectParaEmbedded,
          signMessage,
          signVerificationMessage,
        ],
      )}
    >
      {children}
    </CosmosExternalWalletContext.Provider>
  );
}
