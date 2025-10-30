import { PropsWithChildren, createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useAccount,
  useSwitchChain,
  useConnect,
  useDisconnect,
  useEnsName,
  useEnsAvatar,
  useSignMessage,
  useSwitchAccount,
  useConnections,
  useBalance,
} from 'wagmi';
import { ParaDetails, WagmiConnectorInstance } from '../types/Wallet.js';
import { isEIP6963Connector } from '../utils/isEIP6963Connector.js';
import { emitWalletConnectUri } from '../utils/getWalletConnectUri.js';
import { normalize } from 'viem/ens';
import { useExternalWalletStore } from '../stores/useStore.js';
import {
  defaultEvmExternalWallet,
  DisconnectBaseOptions,
  DisconnectType,
  FarcasterMiniAppManagement,
  openMobileUrl,
  type BalanceManagement,
  type ChainManagement,
  type CommonChain,
  type CommonWallet,
  type ConnectParaEmbedded,
  type ExternalWalletContextType,
  type ExternalWalletProviderConfigBase,
  type SignArgs,
} from '@getpara/react-common';
import { AuthState, ExternalWalletInfo, isMobile } from '@getpara/web-sdk';
import { etherUnits, formatUnits } from 'viem';
import { externalHooks, TExternalHooks } from './externalHooks.js';

type SignOptions = Partial<
  Pick<Parameters<ReturnType<typeof useSignMessage>['signMessageAsync']>[0], 'account' | 'connector'>
>;

export type EvmExternalWalletContextType = ExternalWalletContextType &
  ChainManagement<number> &
  BalanceManagement &
  ConnectParaEmbedded &
  TExternalHooks & {
    username?: string;
    avatar?: string;
  } & FarcasterMiniAppManagement & { verificationStage: 'verifying' | 'switchingChain' };

export const EvmExternalWalletContext = createContext<EvmExternalWalletContextType>({
  ...defaultEvmExternalWallet,
  farcasterStatus: undefined,
  verificationStage: undefined,
} as EvmExternalWalletContextType);

export type EvmExternalWalletProviderConfig = ExternalWalletProviderConfigBase;

export function EvmExternalWalletProvider({
  children,
  onSwitchWallet,
  para,
  walletsWithFullAuth,
  connectedWallet: connectedWalletProp,
  includeWalletVerification,
  connectionOnly,
}: EvmExternalWalletProviderConfig & PropsWithChildren) {
  const { connectAsync, connectors: untypedConnectors } = useConnect();
  const connections = useConnections();
  const {
    address: wagmiAddress,
    isConnecting,
    isReconnecting,
    chainId,
    connector: connectedConnector,
    isConnected,
  } = useAccount();
  const { switchAccount: wagmiSwitchAccount } = useSwitchAccount();
  const { chains, switchChainAsync } = useSwitchChain();
  const { disconnectAsync, status: disconnectStatus } = useDisconnect();
  const { data: ensName, refetch: refetchEnsName } = useEnsName({ address: wagmiAddress });
  const { data: ensAvatar, refetch: refetchEnsAvatar } = useEnsAvatar({
    name: normalize(ensName),
  });
  const { signMessageAsync } = useSignMessage();

  const connectedWallet = connectedWalletProp ? para.findWallet(connectedWalletProp.id, connectedWalletProp.type) : null;

  const disconnectTypeRef = useRef<DisconnectType | undefined>();
  const verificationMessage = useRef<string>();
  const { refetch: getBalance } = useBalance({ address: wagmiAddress });

  const connectors = untypedConnectors as WagmiConnectorInstance[];
  const connectionsRef = useRef(connections);
  const connectorsRef = useRef(connectors);
  const [verificationStage, setVerificationStage] = useState<'verifying' | 'switchingChain'>('verifying');

  const isLocalConnecting = useExternalWalletStore(state => state.isConnecting);
  const updateExternalWalletState = useExternalWalletStore(state => state.updateState);

  const getStoredExternalWallets = () => {
    const storedExternalWalletsString = localStorage.getItem('@CAPSULE/externalWallets');

    let storedExternalWallets = {};
    if (storedExternalWalletsString) {
      storedExternalWallets = JSON.parse(storedExternalWalletsString);
    }

    return storedExternalWallets;
  };

  const switchAccount = useCallback(
    (connectorName: string) => {
      const connector = connectionsRef.current.find(c => {
        const paraDetails = c.connector?.paraDetails as ParaDetails | undefined;
        return [paraDetails?.name, paraDetails?.id, paraDetails?.internalId].includes(connectorName);
      })?.connector;

      if (!connector) {
        console.warn(`connector not found: ${connectorName}`);
        return;
      }

      wagmiSwitchAccount({ connector });
    },
    [wagmiSwitchAccount],
  );

  const findConnectorAndAccount = (externalWallet: ExternalWalletInfo): SignOptions => {
    let connector;
    switch (true) {
      case !!externalWallet.providerId:
        {
          connector = connectionsRef.current.find(c => c.connector?.name === externalWallet.providerId)?.connector;
        }
        break;
    }

    return { connector, account: externalWallet.address as `0x${string}` };
  };

  const getWalletBalance = useCallback(
    // Format from wei to eth
    async () => {
      const { data: balance } = await getBalance();
      return balance ? formatUnits(balance.value, etherUnits.wei) : undefined;
    },
    [chainId, wagmiAddress, getBalance],
  );

  useEffect(() => {
    const storedExternalWallet = getStoredExternalWallets()[wagmiAddress ?? ''];
    // Don't reset if user is connected via Para (embedded session)
    if (connectedConnector?.id === 'para') {
      return;
    }

    if (
      !isConnecting &&
      !isReconnecting &&
      !isLocalConnecting &&
      !!wagmiAddress &&
      !storedExternalWallet &&
      !disconnectTypeRef.current &&
      para.isReady &&
      !para.isFarcasterMiniApp
    ) {
      reset();
    }
  }, [isConnected, isLocalConnecting, wagmiAddress, connectedConnector, para.isReady, para.isFarcasterMiniApp]);

  useEffect(() => {
    const storedExternalWallet = Object.values(para.externalWallets || {})[0];

    // If the user is using an external EVM wallet we want to watch for wallet changes and log them in to a different user when the wallet changes
    if (
      !isLocalConnecting &&
      isConnected &&
      storedExternalWallet?.type === 'EVM' &&
      storedExternalWallet?.address !== wagmiAddress &&
      connectedConnector?.id !== 'para' &&
      !disconnectTypeRef.current
    ) {
      switchWallet(wagmiAddress);
    }
  }, [isLocalConnecting, wagmiAddress, isConnected]);

  useEffect(() => {
    // If the connected connector is using WC, pull the name from the Para details so we correctly compare it to the connected wallet name
    const connectedConnectorName =
      connectedConnector?.name === 'WalletConnect'
        ? (connectedConnector as WagmiConnectorInstance)?.paraDetails?.name
        : connectedConnector?.name;

    if (
      !isLocalConnecting &&
      !isConnecting &&
      !isReconnecting &&
      connectedWallet &&
      connectedConnector &&
      connectedWallet.type === 'EVM' &&
      connectedConnectorName !== connectedWallet.name
    ) {
      switchAccount(connectedWallet.isExternal ? connectedWallet.name : 'Para');
    }
  }, [isLocalConnecting, isConnecting, isReconnecting, connectedWallet, wagmiSwitchAccount]);

  // If nothing is connected automatically connect to the Para connector if available
  // This is mainly used to ensure any race conditions are handled when chains are switched in another external wallet connector when using full Para auth
  useEffect(() => {
    const connectPara = async () => {
      if (!isLocalConnecting && !isConnecting && !isReconnecting && !isConnected && !connectedConnector) {
        // Only attempt to connect if we have wallets and the user is logged in
        if (Object.values(para.wallets).length === 0 || !(await para.isFullyLoggedIn())) {
          return;
        }

        connectParaEmbedded();
      }
    };

    connectPara();
  }, [isLocalConnecting, isConnecting, isReconnecting, isConnected, connectedConnector]);

  const reset = async () => {
    await disconnectAsync();
    await para.logout();
  };

  // Create wallet_addEthereumChain params from configured chains
  const getChainParams = (chainId: number) => {
    const chain = chains.find(c => c.id === chainId);
    if (!chain) return null;

    return {
      chainId: `0x${chainId.toString(16)}`,
      chainName: chain.name,
      nativeCurrency: {
        name: chain.nativeCurrency.name,
        symbol: chain.nativeCurrency.symbol,
        decimals: chain.nativeCurrency.decimals,
      },
      rpcUrls: [chain.rpcUrls.default.http[0]],
      blockExplorerUrls: chain.blockExplorers?.default ? [chain.blockExplorers.default.url] : undefined,
    };
  };

  const signMessage = async ({ message, externalWallet }: SignArgs) => {
    let signOpts: SignOptions = {};

    const connector = findConnector(
      externalWallet ? externalWallet.providerId : getConnectorInfo(connectedConnector).providerId,
    );

    const signUri = isMobile() && connector.type === 'walletConnect' ? connector.paraDetails?.deeplinkUri : undefined;

    const openApp = () => {
      if (signUri) {
        openMobileUrl(signUri);
      }
    };

    openApp();

    if (externalWallet) {
      signOpts = findConnectorAndAccount(externalWallet);

      await switchAccount(externalWallet.providerId ?? '');
    }

    const address = (
      signOpts.account
        ? typeof signOpts.account === 'string'
          ? signOpts.account
          : signOpts.account.getAddress()
        : wagmiAddress
    ) as `0x${string}`;

    try {
      const signature = await signMessageAsync({
        message,
        account: address,
        ...signOpts,
      });

      return {
        address,
        signature,
      };
    } catch (e) {
      console.error('Error signing message:', e);
      console.error('Error signing message:', e.message, e.details);

      if (e.message.includes('Chain not configured') || e.details.includes('Chain not configured')) {
        setVerificationStage('switchingChain');

        const currentChainParams = getChainParams(chains[0]?.id ?? chainId);
        if (!currentChainParams) {
          return {
            error: `Chain ${chainId} not found in configuration`,
          };
        }

        try {
          await switchChainAsync({
            addEthereumChainParameter: currentChainParams,
            chainId: chains[0]?.id ?? chainId,
          });

          setVerificationStage('verifying');
          return await signMessage({ message, externalWallet });
        } catch (error) {
          console.error('Error adding chain:', error);
          return {
            error: `Error adding chain. You may need to add ${currentChainParams?.chainName} support to ${(connectedConnector as WagmiConnectorInstance)?.paraDetails?.name ?? connectedConnector?.name ?? 'the wallet'} manually.`,
          };
        }
      }

      switch (e.name) {
        case 'UserRejectedRequestError': {
          return { error: 'Signature request rejected' };
        }
        default: {
          return { error: 'An unknown error occurred' };
        }
      }
    }
  };

  const signVerificationMessage = async () => {
    setVerificationStage('verifying');
    const signature = await signMessage({ message: verificationMessage.current });

    return signature;
  };

  const switchChain = async (chainId: number) => {
    let error: string[];
    try {
      await switchChainAsync({ chainId });
    } catch (e) {
      // Invalid networks throws the same error as connection rejected requests, so catching the error using the detail string here.
      if (e.details.includes('Missing or invalid.')) {
        const chain = chains.find(c => c.id === chainId);
        error = [
          'Network not supported.',
          `You may need to add ${chain?.name} support to ${(connectedConnector as WagmiConnectorInstance)?.paraDetails?.name ?? connectedConnector?.name ?? 'the wallet'} manually.`,
        ];
      } else {
        switch (e.name) {
          case 'UserRejectedRequestError': {
            error = ['Change request rejected'];
            break;
          }
          default: {
            error = ['An unknown error occurred'];
            break;
          }
        }
      }
    }

    return { error };
  };

  const login = async ({ address, withFullParaAuth = false, providerId, provider }: Partial<ExternalWalletInfo>) => {
    try {
      refetchEnsName();
      refetchEnsAvatar();

      return await para.loginExternalWallet({
        externalWallet: {
          partnerId: para.partnerId,
          address,
          type: 'EVM',
          provider,
          providerId,
          withFullParaAuth,
          ensName,
          ensAvatar,
          isConnectionOnly: connectionOnly,
          withVerification: includeWalletVerification,
        },
        uri: window?.location.origin,
        chainId: (chains[0]?.id ?? chainId)?.toString(),
      });
    } catch (err) {
      await disconnectAsync();
      await para.logout();

      throw 'Error logging you in. Please try again.';
    }
  };

  const switchWallet = async (address: string) => {
    updateExternalWalletState({ isConnecting: true });
    let error: string;

    // If we're calling switch wallet with no address, treat it as if the user disconnected the wallet from the app and logout to reset the Para instance.
    if (!address) {
      await para.logout();
    } else {
      if (para.isExternalWalletAuth || para.isExternalWalletWithVerification) {
        await reset();
      } else {
        try {
          const loginInfo = getConnectorInfo(connectedConnector);

          await login({
            address,
            ...loginInfo,
          });
        } catch (err) {
          error = err;
        }
      }
    }

    onSwitchWallet?.({ address, error });
    updateExternalWalletState({ isConnecting: false });
  };

  const connectBase = async (connector: WagmiConnectorInstance): Promise<string | undefined> => {
    if (
      connector.type === 'walletConnect' ||
      connector.paraDetails?.internalId === 'WALLETCONNECT' ||
      connector.paraDetails?.showQrModal
    ) {
      await emitWalletConnectUri(connector, (connector as any).getUri);
    }

    const walletChainId = await connector.getChainId();

    const data = await connectAsync({
      // If the wallet is already on a supported chain, use that to avoid a chain switch prompt.
      chainId:
        chains.find(({ id }) => id === walletChainId)?.id ??
        // Fall back to the first chain provided.
        chains[0]?.id,
      connector,
    });
    return data.accounts?.[0];
  };

  const connect = async (
    connector: WagmiConnectorInstance,
  ): Promise<{ authState?: AuthState; address?: string; error?: string }> => {
    updateExternalWalletState({ isConnecting: true });
    await disconnectAsync();

    let authState: AuthState;
    let address: string | undefined;
    let error: string | undefined;

    try {
      address = await connectBase(connector);

      if (address) {
        try {
          const loginInfo = getConnectorInfo(connector);

          authState = await login({
            address,
            ...loginInfo,
          });
          verificationMessage.current = authState.signatureVerificationMessage;
        } catch (err) {
          address = undefined;
          error = err;
        }
      }
    } catch (e) {
      switch (e.name) {
        case 'UserRejectedRequestError': {
          error = 'Connection request rejected';
          break;
        }
        case 'ResourceUnavailableRpcError': {
          error = `${connector.name} not detected`;
          break;
        }
        default: {
          console.error('Wagmi connection error:', e.message);
          error = 'An unknown error occurred';
          break;
        }
      }
    }

    updateExternalWalletState({ isConnecting: false });
    return { address, authState, error };
  };

  const connectMobile = async (
    connector: WagmiConnectorInstance,
    isManualWalletConnect?: boolean,
  ): Promise<{ address?: string; error?: string }> => {
    const _isMobile = isManualWalletConnect !== undefined ? isManualWalletConnect : isMobile();
    // If on mobile and the connector contains the wallet connect modal connector, use it.
    const _connector =
      connector.walletConnectModalConnector && _isMobile ? connector.walletConnectModalConnector : connector;

    return await connect(_connector);
  };

  const findConnector = (providerId: string): WagmiConnectorInstance | undefined => {
    const connector = connectorsRef.current.find(w =>
      [w?.paraDetails?.name, w?.paraDetails?.id, w?.paraDetails?.internalId].includes(providerId),
    );

    // Moving getUri up a level so the qr event is properly emitted on connect
    return connector ? { ...connector, getUri: connector.paraDetails?.getUri } : undefined;
  };

  const requestInfo = async (providerId: string): Promise<ExternalWalletInfo> => {
    const connector = findConnector(providerId);

    disconnectTypeRef.current = 'ACCOUNT_LINKING';
    try {
      let address: string | undefined;

      // Check if connector is already connected
      if (connector.connected && connector.accounts?.[0]) {
        address = connector.accounts[0];
      } else {
        address = await connectBase(connector);
      }

      const providerId = wallets.find(w => w?.name === (connector?.paraDetails?.name ?? ''))?.name ?? connector?.name;

      return {
        partnerId: para.partnerId,
        address,
        type: 'EVM',
        providerId,
        provider: providerId,
        ensName,
        ensAvatar,
      };
    } catch (e) {
      throw new Error(e?.message ?? e);
    }
  };

  const disconnectBase = async (providerId?: string, { disconnectType }: DisconnectBaseOptions = {}): Promise<void> => {
    if (!providerId) {
      throw new Error('Provider ID is required to disconnect');
    }

    const connector = findConnector(providerId);

    if (disconnectType) {
      disconnectTypeRef.current = disconnectType;
    }
    try {
      await connector?.disconnect();
    } catch (e) {
      throw new Error(e?.message ?? e);
    } finally {
      disconnectTypeRef.current = undefined;
    }
  };

  // If an Eip6963 wallet is injected we want to remove the non Eip6963 connector and attach its metadata to the Eip6963 connector
  const nonEip6963ConnectorsByRdns = {};
  let walletConnectModalConnector: WagmiConnectorInstance;
  connectors
    .filter(c => !isEIP6963Connector(c))
    .forEach(c => {
      if (c.paraDetails) {
        nonEip6963ConnectorsByRdns[c.paraDetails.rdns] = c.paraDetails;

        if (c.paraDetails.isWalletConnectModalConnector) {
          walletConnectModalConnector = c;
        }
      }
    });
  const eip6963Names = connectors.filter(c => isEIP6963Connector(c)).map(c => c.name);
  const dedupedConnectors = connectors
    .map(c => {
      // Filter out the duplicated walletConnect connector with the modal
      // This connector will be attached to the WC connector that doesn't contain the modal for use on mobile
      if (c.paraDetails?.isWalletConnectModalConnector) {
        return;
      }
      // Remove any non EIP6963 connectors if they have a matching EIP6963 connectors
      if (!isEIP6963Connector(c) && eip6963Names.includes(c.name)) {
        return;
      }
      // Return the EIP6963 connectors
      if (isEIP6963Connector(c)) {
        const paraMetadata = nonEip6963ConnectorsByRdns[c.id];
        return { ...c, paraDetails: paraMetadata };
      }

      // Return the WC connector with the attached WC modal connector
      if (c.paraDetails?.internalId === 'WALLETCONNECT' && walletConnectModalConnector) {
        return { ...c, walletConnectModalConnector };
      }

      return c;
    })
    .filter(c => !!c);

  const wallets = dedupedConnectors
    .map(c => {
      // Remove the Safe connector when we are **not** inside a Safe App iframe
      if (c.paraDetails?.internalId === 'SAFE' && (typeof window === 'undefined' || window.parent === window)) {
        return undefined;
      }

      const connector = { ...c, ...c.paraDetails };

      const isInjected = !c.paraDetails && eip6963Names.includes(c.name);

      // If there is a para connector, use that not to injected
      if (isInjected && connectors.some(c => c.paraDetails?.rdns === c.id)) {
        return undefined;
      }

      return {
        ...connector,
        // Using name here since that's the only common id across the networks
        id: connector.name,
        internalId: connector.internalId ?? connector.name,
        isExtension: connector.isExtension ?? isInjected,
        installed: connector.installed ?? isInjected,
        iconUrl: connector.iconUrl ?? connector.icon,
        connect: () => connect(connector),
        connectMobile: (manual?: boolean) => connectMobile(connector, manual),
        type: 'EVM',
      } as CommonWallet;
    })
    .filter(Boolean); // remove undefined from map

  const getConnectorInfo = (connector: WagmiConnectorInstance): Partial<ExternalWalletInfo> => {
    const paraDetails = connector.paraDetails as ParaDetails | undefined;
    const withFullParaAuth = walletsWithFullAuth === 'ALL' || walletsWithFullAuth?.includes(paraDetails?.internalId);
    return {
      type: 'EVM',
      providerId: connector.name,
      provider: connector.name,
      withFullParaAuth,
    };
  };
  const formattedChains: CommonChain[] = chains.map(c => {
    return {
      id: c.id,
      name: c.name,
    };
  });

  const username = useMemo(() => ensName ?? wagmiAddress, [ensName, wagmiAddress]);

  const farcasterStatus = useMemo(() => {
    const connection = connections.find(
      c => (c.connector.paraDetails as ParaDetails | undefined)?.internalId === 'FARCASTER',
    );

    if (!connection) {
      return { isPresent: false as const };
    }

    const address = connection?.accounts?.[0];

    return address
      ? { isPresent: true as const, isConnected: true as const, address }
      : { isPresent: true as const, isConnected: false as const };
  }, [connections]);

  const connectParaEmbedded = useCallback(async (): Promise<{ result?: unknown; error?: string }> => {
    const paraConnectorInstance = connectors.find(c => c.id === 'para');
    if (!paraConnectorInstance) {
      return { error: 'No para connector instance' };
    }
    try {
      const result = await connectAsync({ connector: paraConnectorInstance });
      return { result };
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      return { error };
    }
  }, [connectors]);

  useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);

  useEffect(() => {
    connectorsRef.current = connectors;
  }, [connectors]);

  return (
    <EvmExternalWalletContext.Provider
      value={{
        wallets,
        chains: formattedChains,
        chainId,
        username,
        avatar: ensAvatar,
        disconnect: disconnectAsync,
        disconnectStatus,
        switchChain,
        connectParaEmbedded,
        signMessage,
        signVerificationMessage,
        getWalletBalance,
        requestInfo,
        disconnectBase,
        farcasterStatus,
        verificationStage,
        ...externalHooks,
      }}
    >
      {children}
    </EvmExternalWalletContext.Provider>
  );
}
