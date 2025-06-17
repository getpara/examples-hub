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
import { AuthState, ExternalWalletInfo, rawSecp256k1PubkeyToRawAddress, TExternalWallet } from '@getpara/web-sdk';
import type {
  ChainManagement,
  CommonChain,
  CommonWallet,
  ConnectParaEmbedded,
  ExternalWalletContextType,
  ExternalWalletProviderConfig,
  ExternalWalletProviderConfigBase,
  SignArgs,
  SignResult,
} from '@getpara/react-common';
import { formatEthHexAddress } from '../utils/formatEthHexAddress.js';

export const defaultCosmosExternalWallet = {
  wallets: [],
  chains: [],
  chainId: undefined,
  disconnect: () => Promise.resolve(),
  switchChain: () => Promise.resolve(),
  connectParaEmbedded: () => Promise.resolve({}),
  signMessage: () => Promise.resolve({}),
  signVerificationMessage: () => Promise.resolve({}),
  requestInfo: () => Promise.resolve({} as any),
  disconnectBase: () => Promise.resolve(),
};

export type CosmosSignResult = SignResult & {
  cosmosPublicKeyHex?: string;
  cosmosSigner?: string;
  addressBech32?: string;
};

export type CosmosExternalWalletContextType = ExternalWalletContextType<CosmosSignResult> &
  ChainManagement<string> &
  ConnectParaEmbedded;

export type CosmosExternalWalletProviderConfig = ExternalWalletProviderConfigBase;

export type CosmosExternalWalletProviderConfigFull = ExternalWalletProviderConfig<
  WalletWithType,
  Omit<ParaCosmosProviderConfig, 'wallets'>
>;

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

  const isLinkingAccount = useRef(false);
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
      const { provider, providerId } = getProvider(walletType);
      para.setExternalWallet({
        address: changeResp.ethAddress,
        type: 'COSMOS',
        provider,
        providerId,
        addressBech32: changeResp.address,
        withFullParaAuth: storedExternalWallet.isExternalWithParaAuth,
        withVerification: includeWalletVerification,
        isConnectionOnly: connectionOnly,
      });
    }
    return { error };
  };

  const login = async ({
    address,
    addressBech32,
    withFullParaAuth,
    providerId,
    provider,
  }: Pick<ExternalWalletInfo, 'address' | 'addressBech32' | 'withFullParaAuth' | 'provider' | 'providerId'>) => {
    try {
      return await para.loginExternalWallet({
        externalWallet: {
          address,
          type: 'COSMOS',
          provider,
          providerId,
          addressBech32,
          withFullParaAuth,
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
      walletType !== GrazWalletType.PARA &&
      !isLinkingAccount.current
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
        (connectedWallet.isExternal ? walletType !== connectedWallet.name?.toLowerCase() : walletType !== 'para') &&
        !isLinkingAccount.current
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

  const signMessage = async ({ message, externalWallet }: SignArgs) => {
    let wallet, signAddress, signEthAddress;
    if (externalWallet) {
      const commonWallet = wallets.find(w => w.internalId === externalWallet.providerId);

      wallet = grazGetWallet((commonWallet as unknown as WalletWithType)?.grazType as GrazWalletType);
      signAddress = externalWallet.addressBech32;
      signEthAddress = externalWallet.address;
    } else {
      wallet = grazGetWallet(walletType);
      signAddress = address;
      signEthAddress = ethAddress;
    }

    if (!wallet) {
      return { error: 'Connected wallet not found' };
    }

    try {
      const publicKey = (await wallet.getKey(selectedChainId)).pubKey;
      const signature = await wallet.signArbitrary(selectedChainId, signAddress, message);

      return {
        address: signEthAddress,
        addressBech32: signAddress,
        signature: signature.signature,
        cosmosPublicKeyHex: Buffer.from(publicKey).toString('hex'),
        cosmosSigner: signAddress,
      };
    } catch (e) {
      if (e.message.includes('Request rejected')) {
        return { error: 'Signature request rejected' };
      }
      return { error: 'An unknown error occurred' };
    }
  };

  const signVerificationMessage = async () => {
    const signature = await signMessage({ message: verificationMessage.current });

    return signature;
  };

  const connectBase = async (walletType: GrazWalletType, chainId?: string | string[]): Promise<ExternalWalletInfo> => {
    if (!chainId) {
      await disconnectAsync();
    }

    const _chainId = chainId ?? (multiChain ? chains.map(c => c.chainId) : selectedChainId);

    if (!_chainId) {
      throw new Error('Chain id not provided.');
    }

    if (!walletType) {
      throw new Error('Graz wallet type not provided.');
    }

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

      const addressBech32 = connectedWallet.accounts[firstChain].bech32Address;

      let rawAddress;
      const accountAddress = connectedWallet.accounts[firstChain].address;
      if (!accountAddress || accountAddress.length === 0 || accountAddress.byteLength === 0) {
        // If address is empty, use pubKey instead
        const pubKey = connectedWallet.accounts[firstChain].pubKey;
        rawAddress = rawSecp256k1PubkeyToRawAddress(pubKey);
      } else {
        rawAddress = accountAddress;
      }
      const address = formatEthHexAddress(rawAddress);

      const { provider, providerId } = getProvider(walletType);

      return {
        type: 'COSMOS',
        address,
        addressBech32,
        provider,
        providerId,
      };
    } catch (e) {
      let error;
      if (e.message === 'No wallet exists') {
        error = e.message;
      } else {
        error = `Graz connection error: ${e?.message ?? e}`;
      }
      throw error;
    }
  };

  const connect = async (
    walletType: GrazWalletType,
    chainId?: string | string[],
  ): Promise<{ authState?: AuthState; address?: string; error?: string }> => {
    updateExternalWalletState({ isConnecting: true });

    const walletId = getWallet(walletType)?.id;
    const isFullAuthWallet = walletsWithFullAuth.includes(walletId.toUpperCase() as TExternalWallet);

    try {
      const externalWallet = await connectBase(walletType, chainId);

      const authState = await login({
        ...externalWallet,
        withFullParaAuth: isFullAuthWallet,
      });

      verificationMessage.current = authState.stage === 'verify' ? authState.signatureVerificationMessage : undefined;

      return {
        address: externalWallet.address,
        authState,
      };
    } catch (e) {
      return {
        error: e?.message ?? e,
      };
    } finally {
      updateExternalWalletState({ isConnecting: false });
    }
  };

  // The logic in the modal should prevent this from happening, logging for edge cases.

  const getWallet = (walletType: GrazWalletType) =>
    incompleteWallets.find(w => w.grazType === walletType || w.grazMobileType === walletType);

  const getProvider = (walletType: GrazWalletType) => {
    const wallet = getWallet(walletType);

    return {
      provider: wallet?.name,
      providerId: wallet?.internalId,
    };
  };

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

  const requestInfo = async (providerId: TExternalWallet): Promise<ExternalWalletInfo> => {
    const wallet = wallets.find(w => w.internalId === providerId);

    if (!wallet) {
      throw new Error(`Wallet for provider ${providerId} not found`);
    }

    isLinkingAccount.current = true;
    try {
      const externalWallet = await connectBase(
        (wallet as any).grazType,
        multiChain ? chains.map(c => c.chainId) : selectedChainId,
      );

      return externalWallet;
    } catch (e) {
      console.error('Error linking account:', e);
      throw new Error(e?.message ?? e);
    }
  };

  const disconnectBase = async (): Promise<void> => {
    isLinkingAccount.current = true;
    try {
      await disconnectAsync();
    } catch (e) {
      console.error('Error linking account:', e);
      throw new Error(e?.message ?? e);
    }
  };

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
          requestInfo,
          disconnectBase,
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
          requestInfo,
          disconnectBase,
        ],
      )}
    >
      {children}
    </CosmosExternalWalletContext.Provider>
  );
}
