import { PropsWithChildren, createContext, useCallback, useEffect, useMemo, useRef } from 'react';
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
import { getWalletConnectUri } from '../utils/getWalletConnectUri.js';
import { normalize } from 'viem/ens';
import { useExternalWalletStore } from '../stores/useStore.js';
import {
  defaultEvmExternalWallet,
  type BalanceManagement,
  type ChainManagement,
  type CommonChain,
  type CommonWallet,
  type ConnectParaEmbedded,
  type ExternalWalletContextType,
  type ExternalWalletProviderConfigBase,
  type SignArgs,
  type TExternalWallet,
} from '@getpara/react-common';
import { AuthState, ExternalWalletInfo, isMobile } from '@getpara/web-sdk';
import { etherUnits, formatUnits } from 'viem';

type SignOptions = Partial<
  Pick<Parameters<ReturnType<typeof useSignMessage>['signMessageAsync']>[0], 'account' | 'connector'>
>;

export type EvmExternalWalletContextType = ExternalWalletContextType &
  ChainManagement<number> &
  BalanceManagement &
  ConnectParaEmbedded & {
    username?: string;
    avatar?: string;
  };

export const EvmExternalWalletContext = createContext<EvmExternalWalletContextType>(defaultEvmExternalWallet);

export type EvmExternalWalletProviderConfig = ExternalWalletProviderConfigBase;

export function EvmExternalWalletProvider({
  children,
  onSwitchWallet,
  para,
  walletsWithFullAuth,
  connectedWallet,
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
  const { disconnectAsync } = useDisconnect();
  const { data: ensName, refetch: refetchEnsName } = useEnsName({ address: wagmiAddress });
  const { data: ensAvatar, refetch: refetchEnsAvatar } = useEnsAvatar({
    name: normalize(ensName),
  });
  const { signMessageAsync } = useSignMessage();

  const isLinkingAccount = useRef(false);
  const verificationMessage = useRef<string>();
  const { refetch: getBalance } = useBalance({ address: wagmiAddress });

  const connectors = untypedConnectors as WagmiConnectorInstance[];
  const connectionsRef = useRef(connections);
  const connectorsRef = useRef(connectors);

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
      const connector = connections.find(c => c.connector.name === connectorName)?.connector;

      if (!connector) {
        console.warn(`connector not found: ${connectorName}`);
        return;
      }

      wagmiSwitchAccount({ connector });
    },
    [connections, wagmiSwitchAccount],
  );

  const findConnectorAndAccount = (externalWallet: ExternalWalletInfo): SignOptions => {
    let connector;
    switch (true) {
      case !!externalWallet.providerId:
        {
          connector = connectionsRef.current.find(
            c => (c.connector.paraDetails as ParaDetails | undefined)?.internalId === externalWallet.providerId,
          )?.connector;
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

    if (
      !isConnecting &&
      !isReconnecting &&
      !isLocalConnecting &&
      !!wagmiAddress &&
      !storedExternalWallet &&
      connectedConnector?.id !== 'para' &&
      !isLinkingAccount.current
    ) {
      reset();
    }
  }, [isConnected, isLocalConnecting, wagmiAddress, connectedConnector]);

  useEffect(() => {
    const storedExternalWallet = Object.values(para.externalWallets || {})[0];

    // If the user is using an external EVM wallet we want to watch for wallet changes and log them in to a different user when the wallet changes
    if (
      !isLocalConnecting &&
      isConnected &&
      storedExternalWallet?.type === 'EVM' &&
      storedExternalWallet?.address !== wagmiAddress &&
      connectedConnector?.id !== 'para' &&
      !isLinkingAccount.current
    ) {
      switchWallet(wagmiAddress);
    }
  }, [isLocalConnecting, wagmiAddress, isConnected]);

  useEffect(() => {
    if (
      !isLocalConnecting &&
      !isConnecting &&
      !isReconnecting &&
      connectedWallet &&
      connectedConnector &&
      connectedWallet.type === 'EVM' &&
      connectedConnector.name !== connectedWallet.name
    ) {
      switchAccount(connectedWallet.isExternal ? connectedWallet.name : 'Para');
    }
  }, [isLocalConnecting, isConnecting, isReconnecting, connectedWallet, wagmiSwitchAccount]);

  // If nothing is connected automatically connect to the Para connector if available
  // This is mainly used to ensure any race conditions are handled when chains are switched in another external wallet connector when using full Para auth
  useEffect(() => {
    if (!isLocalConnecting && !isConnecting && !isReconnecting && !isConnected && !connectedConnector) {
      if (Object.values(para.wallets).length === 0) {
        return;
      }

      connectParaEmbedded();
    }
  }, [isLocalConnecting, isConnecting, isReconnecting, isConnected, connectedConnector]);

  const reset = async () => {
    await disconnectAsync();
    await para.logout();
  };

  const signMessage = async ({ message, externalWallet }: SignArgs) => {
    let signOpts: SignOptions = {};
    if (externalWallet) {
      signOpts = findConnectorAndAccount(externalWallet);
    }

    try {
      const address = (
        signOpts.account
          ? typeof signOpts.account === 'string'
            ? signOpts.account
            : signOpts.account.getAddress()
          : wagmiAddress
      ) as `0x${string}`;

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
          verificationMessage.current = authState.stage === 'verify' ? authState.signatureVerificationMessage : undefined;
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

  // old solution, kept for reference
  // const getQrUri = (connector: WagmiConnectorInstance) => () => {
  //   return getWalletConnectUri(connector, connector.paraDetails?.getUri);
  // };

  const requestInfo = async (providerId: TExternalWallet): Promise<ExternalWalletInfo> => {
    const connector = connectors.find(c => c.paraDetails?.internalId === providerId);

    if (connector.isAuthorized) isLinkingAccount.current = true;
    try {
      const address = await connectBase(connector);

      return {
        address,
        type: 'EVM',
        providerId: connector.paraDetails?.internalId,
        provider: connector.name,
        ensName,
        ensAvatar,
      };
    } catch (e) {
      throw new Error(e?.message ?? e);
    }
  };

  const disconnectBase = async (providerId?: TExternalWallet): Promise<void> => {
    if (!providerId) {
      throw new Error('Provider ID is required to disconnect');
    }

    const connector = connectors.find(c => c.paraDetails?.internalId === providerId);

    isLinkingAccount.current = true;
    try {
      await connector.disconnect();
    } catch (e) {
      throw new Error(e?.message ?? e);
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
  const eip6963ids = connectors.filter(c => isEIP6963Connector(c)).map(c => c.id);
  const dedupedConnectors = connectors
    .map(c => {
      // Filter out the duplicated walletConnect connector with the modal
      // This connector will be attached to the WC connector that doesn't contain the modal for use on mobile
      if (c.paraDetails?.isWalletConnectModalConnector) {
        return;
      }
      // Remove any non EIP6963 connectors if they have a matching EIP6963 connectors
      if (!isEIP6963Connector(c) && eip6963ids.includes(c.paraDetails?.rdns)) {
        return;
      }
      // Return the EIP6963 connectors
      if (isEIP6963Connector(c)) {
        const paraMetadata = nonEip6963ConnectorsByRdns[c.id];
        return { ...c, paraDetails: paraMetadata };
      }

      // Return the WC connector with the attached WC modal connector
      if (c.paraDetails?.id === 'WALLETCONNECT' && walletConnectModalConnector) {
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

      // Detect WC‑capable connectors
      const supportsWalletConnect =
        connector.type === 'walletConnect' ||
        connector.paraDetails?.internalId === 'WALLETCONNECT' ||
        connector.paraDetails?.showQrModal;

      return {
        ...connector,
        connect: () => connect(connector),
        connectMobile: (manual?: boolean) => connectMobile(connector, manual),
        type: 'EVM',
        ...(supportsWalletConnect && { getQrUri: () => getWalletConnectUri(connector, connector.getUri) }),
      } as CommonWallet;
    })
    .filter(Boolean); // remove undefined from map

  const getConnectorInfo = (connector: WagmiConnectorInstance): Partial<ExternalWalletInfo> => {
    const paraDetails = connector.paraDetails as ParaDetails | undefined;
    const providerId = paraDetails?.internalId;
    const withFullParaAuth = walletsWithFullAuth?.includes(providerId);
    return {
      type: 'EVM',
      providerId,
      provider: paraDetails?.name,
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
        switchChain,
        connectParaEmbedded,
        signMessage,
        signVerificationMessage,
        getWalletBalance,
        requestInfo,
        disconnectBase,
      }}
    >
      {children}
    </EvmExternalWalletContext.Provider>
  );
}
