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
import { WagmiConnectorInstance } from '../types/Wallet.js';
import { isEIP6963Connector } from '../utils/isEIP6963Connector.js';
import { getWalletConnectUri } from '../utils/getWalletConnectUri.js';
import { normalize } from 'viem/ens';
import { useExternalWalletStore } from '../stores/useStore.js';
import type { CommonChain, CommonWallet, TExternalWallet } from '@getpara/react-common';
import ParaWeb, { AuthState, isMobile, Wallet } from '@getpara/web-sdk';
import { etherUnits, formatUnits } from 'viem';

const defaultEvmExternalWallet = {
  wallets: [],
  chains: [],
  chainId: undefined,
  username: undefined,
  avatar: undefined,
  balance: undefined,
  disconnect: () => Promise.resolve(),
  switchChain: () => Promise.resolve({}),
  connectParaEmbedded: () => Promise.resolve({}),
  signMessage: () => Promise.resolve({}),
  signVerificationMessage: () => Promise.resolve({}),
  getWalletBalance: () => Promise.resolve(undefined),
};

export type EvmExternalWalletContextType = {
  wallets: CommonWallet[];
  chains: CommonChain[];
  chainId?: number;
  username?: string;
  avatar?: string;
  balance?: string;
  disconnect: () => Promise<void>;
  switchChain: (chainId: number) => Promise<{ error?: string[] }>;
  connectParaEmbedded: () => Promise<{ result?: unknown; error?: string }>;
  signMessage: (message: string) => Promise<{ signature?: string; error?: string }>;
  signVerificationMessage: () => Promise<{ address?: string; signature?: string; error?: string }>;
  getWalletBalance: () => Promise<string | undefined>;
};

export const EvmExternalWalletContext = createContext<EvmExternalWalletContextType>(defaultEvmExternalWallet);

export type EvmExternalWalletProviderConfig = {
  onSwitchWallet?: (args: { address?: string; error?: string }) => void;
  para: ParaWeb;
  walletsWithFullAuth: TExternalWallet[];
  includeWalletVerification?: boolean;
  connectionOnly?: boolean;
  connectedWallet?: Omit<Wallet, 'signer'> | null;
};

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

  const verificationMessage = useRef<string>();
  const { refetch: getBalance } = useBalance({ address: wagmiAddress });

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
      connectedConnector?.id !== 'para'
    ) {
      reset();
    }
  }, [isConnecting, isReconnecting, isLocalConnecting, wagmiAddress, connectedConnector]);

  useEffect(() => {
    const storedExternalWallet = Object.values(para.externalWallets || {})[0];

    // If the user is using an external EVM wallet we want to watch for wallet changes and log them in to a different user when the wallet changes
    if (
      !isLocalConnecting &&
      !isConnecting &&
      !isReconnecting &&
      storedExternalWallet?.type === 'EVM' &&
      storedExternalWallet?.address !== wagmiAddress &&
      connectedConnector?.id !== 'para'
    ) {
      switchWallet(wagmiAddress);
    }
  }, [isLocalConnecting, wagmiAddress, isReconnecting, isConnecting]);

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

  const connectors = untypedConnectors as WagmiConnectorInstance[];

  const reset = async () => {
    await disconnectAsync();
    await para.logout();
  };

  const signMessage = async (message: string) => {
    try {
      const signature = await signMessageAsync({
        message,
        account: wagmiAddress,
      });

      return {
        address: wagmiAddress,
        signature,
      };
    } catch (e) {
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
    const signature = await signMessage(verificationMessage.current);

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

  const login = async ({
    address,
    walletId,
    connectorName,
  }: {
    address: string;
    walletId?: string;
    connectorName?: string;
  }) => {
    try {
      refetchEnsName();
      refetchEnsAvatar();

      return await para.loginExternalWallet({
        externalWallet: {
          address,
          type: 'EVM',
          provider: connectorName,
          withFullParaAuth: walletsWithFullAuth?.includes((walletId?.toUpperCase() ?? '') as TExternalWallet),
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
          await login({
            address,
            connectorName: connectedConnector?.name,
            walletId: getParaDetails(connectedConnector.id)?.id,
          });
        } catch (err) {
          error = err;
        }
      }
    }

    onSwitchWallet?.({ address, error });
    updateExternalWalletState({ isConnecting: false });
  };

  const connect = async (
    connector: WagmiConnectorInstance,
  ): Promise<{ authState?: AuthState; address?: string; error?: string }> => {
    updateExternalWalletState({ isConnecting: true });
    await disconnectAsync();

    const walletChainId = await connector.getChainId();
    let authState: AuthState;
    let address: string | undefined;
    let error: string | undefined;

    try {
      const data = await connectAsync({
        // If the wallet is already on a supported chain, use that to avoid a chain switch prompt.
        chainId:
          chains.find(({ id }) => id === walletChainId)?.id ??
          // Fall back to the first chain provided.
          chains[0]?.id,
        connector,
      });
      address = data.accounts?.[0];

      if (address) {
        try {
          authState = await login({
            address,
            connectorName: connector.name,
            walletId: connector.paraDetails.id,
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
          `${connector.name} not detected`;
          break;
        }
        default: {
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

  const getQrUri = (connector: WagmiConnectorInstance) => () => {
    return getWalletConnectUri(connector, connector.paraDetails?.getUri);
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
      if (c.paraDetails?.id === 'walletConnect' && walletConnectModalConnector) {
        return { ...c, walletConnectModalConnector };
      }

      return c;
    })
    .filter(c => !!c);

  const wallets = dedupedConnectors.map(c => {
    const connector = { ...c, ...c.paraDetails };

    return {
      ...connector,
      connect: () => connect(connector),
      connectMobile: isManualWalletConnect => connectMobile(connector, isManualWalletConnect),
      type: 'EVM',
      getQrUri: getQrUri(connector),
    } as CommonWallet;
  });

  const getParaDetails = (id: string) => connectors.find(w => w.id === id)?.paraDetails;

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
      }}
    >
      {children}
    </EvmExternalWalletContext.Provider>
  );
}
