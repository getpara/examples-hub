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
  WALLET_TYPES,
} from 'graz';
import { useExternalWalletStore } from '../stores/useStore.js';
import { WalletWithType } from '../types/Wallet.js';
import { AuthState, ExternalWalletInfo, rawSecp256k1PubkeyToRawAddress, TExternalWallet } from '@getpara/web-sdk';
import {
  defaultCosmosExternalWallet,
  DisconnectBaseOptions,
  DisconnectType,
  type ChainManagement,
  type CommonChain,
  type CommonWallet,
  type ConnectParaEmbedded,
  type ExternalWalletContextType,
  type ExternalWalletProviderConfig,
  type ExternalWalletProviderConfigBase,
  type SignArgs,
  type SignResult,
} from '@getpara/react-common';
import { formatEthHexAddress } from '../utils/formatEthHexAddress.js';
import { externalHooks, TExternalHooks } from './externalHooks.js';

export type CosmosSignResult = SignResult & {
  cosmosPublicKeyHex?: string;
  cosmosSigner?: string;
  addressBech32?: string;
};

export type CosmosExternalWalletContextType = ExternalWalletContextType<CosmosSignResult> &
  ChainManagement<string> &
  TExternalHooks &
  ConnectParaEmbedded;

export type CosmosExternalWalletProviderConfig = ExternalWalletProviderConfigBase;

export type CosmosExternalWalletProviderConfigFull = ExternalWalletProviderConfig<
  WalletWithType,
  Omit<ParaCosmosProviderConfig, 'wallets'>
>;

export const CosmosExternalWalletContext = createContext<CosmosExternalWalletContextType>(
  defaultCosmosExternalWallet as CosmosExternalWalletContextType,
);

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
  connectedWallet: connectedWalletProp,
  includeWalletVerification,
  connectionOnly,
}: CosmosExternalWalletProviderConfigFull & PropsWithChildren) {
  const { suggestAndConnectAsync } = useSuggestChainAndConnect();
  const {
    data: account,
    isConnecting,
    isReconnecting,
    isConnected,
  } = useAccount(
    multiChain
      ? {
          chainId: chains.map(c => c.chainId),
        }
      : selectedChainId
        ? {
            chainId: [selectedChainId],
          }
        : undefined,
  );
  const { connectAsync } = useConnect();
  const { disconnectAsync, status: disconnectStatus } = useDisconnect();
  const { walletType } = useActiveWalletType();
  const isLocalConnecting = useExternalWalletStore(state => state.isConnecting);
  const updateExternalWalletState = useExternalWalletStore(state => state.updateState);
  const isConnectError = useRef(false);

  const connectedWallet = connectedWalletProp ? para.findWallet(connectedWalletProp.id, connectedWalletProp.type) : null;

  const ethAddress = account?.[selectedChainId]?.ethereumHexAddress?.toLowerCase();
  const address = account?.[selectedChainId]?.bech32Address;

  const disconnectTypeRef = useRef<DisconnectType | undefined>();
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
        partnerId: para.partnerId,
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
          partnerId: para.partnerId,
          address,
          type: 'COSMOS',
          provider,
          providerId,
          addressBech32,
          withFullParaAuth,
          withVerification: includeWalletVerification,
          isConnectionOnly: connectionOnly,
        },
        uri: window?.location.origin,
        chainId: selectedChainId,
      });
    } catch {
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
      !disconnectTypeRef.current
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
        !disconnectTypeRef.current &&
        !isConnectError.current
      ) {
        const isLoggedIn = await para.isFullyLoggedIn();

        if (!isLoggedIn) {
          return;
        }

        const chainId = multiChain ? chains.map(c => c.chainId) : selectedChainId;
        const targetWalletType = connectedWallet.isExternal
          ? (connectedWallet.name.toLowerCase() as GrazWalletType)
          : GrazWalletType.PARA;

        try {
          await connectAsync({
            walletType: targetWalletType,
            chainId,
          });
        } catch {
          isConnectError.current = true;
        }
      }
    };

    connect();
  }, [isLocalConnecting, isConnecting, isReconnecting, walletType, connectedWallet]);

  const signMessage = async ({ message, externalWallet }: SignArgs) => {
    let wallet, signAddress, signEthAddress;
    if (externalWallet) {
      const commonWallet = wallets.find(w => w.id === externalWallet.providerId);

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
        partnerId: para.partnerId,
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
    const isFullAuthWallet =
      walletsWithFullAuth === 'ALL' || walletsWithFullAuth.includes(walletId.toUpperCase() as TExternalWallet);

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

  const injectedWallets = WALLET_TYPES.filter(w => !incompleteWallets.some(iw => iw.grazType === w) && checkWallet(w))
    .map(w => {
      const wallet = grazGetWallet(w) as any;

      if (!wallet.eip6963ProviderInfo) {
        return undefined;
      }

      const eipInfo = wallet.eip6963ProviderInfo;
      return {
        grazType: w,
        // Using name here for the injected connector since that's the only common id across the networks
        id: eipInfo.name,
        internalId: eipInfo.name,
        iconUrl: eipInfo.icon,
        ...eipInfo,
      };
    })
    .filter(w => !!w);

  const allWallets: WalletWithType[] = [...incompleteWallets, ...injectedWallets];

  const getWallet = (walletType: GrazWalletType) =>
    allWallets.find(w => w.grazType === walletType || w.grazMobileType === walletType);

  const getProvider = (walletType: GrazWalletType) => {
    const wallet = getWallet(walletType);

    return {
      provider: wallet?.name,
      providerId: wallet?.id,
    };
  };

  const wallets = allWallets
    .map(wallet => {
      return {
        connect: () => connect(wallet.grazType),
        connectMobile: () => connect(wallet.grazType),
        type: 'COSMOS',
        ...wallet,
        // Using name here since that's the only common id across the networks
        id: wallet.name,
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

  const requestInfo = async (providerId: string): Promise<ExternalWalletInfo> => {
    const wallet = wallets.find(w => w.id === providerId);

    if (!wallet) {
      throw new Error(`Wallet for provider ${providerId} not found`);
    }

    disconnectTypeRef.current = 'ACCOUNT_LINKING';
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

  const disconnectBase = async (_?: string, { disconnectType }: DisconnectBaseOptions = {}): Promise<void> => {
    if (disconnectType) {
      disconnectTypeRef.current = disconnectType;
    }
    try {
      await disconnectAsync();
    } catch (e) {
      console.error('Error linking account:', e);
      throw new Error(e?.message ?? e);
    } finally {
      disconnectTypeRef.current = undefined;
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
          disconnectStatus,
          switchChain,
          connectParaEmbedded,
          signMessage,
          signVerificationMessage,
          requestInfo,
          disconnectBase,
          ...externalHooks,
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
