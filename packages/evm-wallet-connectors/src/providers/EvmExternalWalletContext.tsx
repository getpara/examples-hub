import { ReactNode, createContext, useEffect, useMemo, useState } from 'react';
import { useAccount, useSwitchChain, useConnect, useDisconnect, useEnsName, useEnsAvatar } from 'wagmi';
import { WagmiConnectorInstance } from '../types/Wallet';
import { CommonChain, CommonWallet } from '../types/CommonTypes';
import { isEIP6963Connector } from '../utils/isEIP6963Connector';
import { getWalletConnectUri } from '../utils/getWalletConnectUri';
import CapsuleWeb, { ExternalWalletType, isMobile } from '@usecapsule/web-sdk';
import { normalize } from 'viem/ens';

export const defaultEvmExternalWallet = {
  wallets: [],
  chains: [],
  chainId: undefined,
  username: undefined,
  avatar: undefined,
  disconnect: () => Promise.resolve(),
  switchChain: () => Promise.resolve({}),
};

export const EvmExternalWalletContext = createContext<{
  wallets: CommonWallet[];
  chains: CommonChain[];
  chainId: number;
  username: string;
  avatar?: string;
  disconnect: () => Promise<void>;
  switchChain: (chainId: number) => Promise<{ error?: string[] }>;
}>(defaultEvmExternalWallet);

interface EvmExternalWalletProviderProps {
  children: ReactNode;
  capsule: CapsuleWeb;
  onSwitchWallet: (args: { address?: string; error?: string }) => void;
}

export function EvmExternalWalletProvider({ children, capsule, onSwitchWallet }: EvmExternalWalletProviderProps) {
  const { connectAsync, connectors: untypedConnectors } = useConnect();
  const { address: wagmiAddress, isConnecting, isReconnecting, chainId, connector: connectedConnector } = useAccount();
  const { chains, switchChainAsync } = useSwitchChain();
  const { disconnectAsync } = useDisconnect();
  const { data: ensName } = useEnsName({ address: wagmiAddress });
  const { data: ensAvatar } = useEnsAvatar({
    name: normalize(ensName),
  });

  const [isLocalConnecting, setIsLocalConnecting] = useState(false);

  useEffect(() => {
    const storedExternalWallet = capsule.externalWallets[wagmiAddress ?? ''];

    if (!isLocalConnecting && !!wagmiAddress && !storedExternalWallet) {
      reset();
    }
  }, []);

  useEffect(() => {
    const storedExternalWallet = capsule.externalWallets[capsule.currentExternalWalletAddresses?.[0] ?? ''];

    // If the user is using an external EVM wallet we want to watch for wallet changes and log them in to a different user when the wallet changes
    if (
      !isConnecting &&
      !isReconnecting &&
      storedExternalWallet?.type === ExternalWalletType.EVM &&
      storedExternalWallet?.address !== wagmiAddress
    ) {
      switchWallet(wagmiAddress);
    }
  }, [wagmiAddress, isReconnecting, isConnecting]);

  const connectors = untypedConnectors as WagmiConnectorInstance[];

  const reset = async () => {
    await disconnectAsync();
    await capsule.logout(true);
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
          `You may need to add ${chain?.name} support to ${(connectedConnector as WagmiConnectorInstance)?.capsuleDetails?.name ?? connectedConnector?.name ?? 'the wallet'} manually.`,
        ];
      } else {
        switch (e.name) {
          case 'UserRejectedRequestError': {
            error = ['Connection request rejected'];
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

  const login = async (address: string, connectorName?: string) => {
    try {
      await capsule.externalWalletLogin(address, ExternalWalletType.EVM, connectorName);
    } catch (err) {
      await disconnectAsync();
      await capsule.logout(true);

      throw 'Error logging you in. Please try again.';
    }
  };

  const switchWallet = async (address: string) => {
    setIsLocalConnecting(true);
    let error: string;

    // If we're calling switch wallet with no address, treat it as if the user disconnected the wallet from the app and logout to reset the Capsule instance.
    if (!address) {
      await capsule.logout(true);
    } else {
      try {
        await login(address, connectedConnector?.name);
      } catch (err) {
        error = err;
      }
    }

    onSwitchWallet({ address, error });
    setIsLocalConnecting(false);
  };

  const connect = async (connector: WagmiConnectorInstance): Promise<{ address?: string; error?: string }> => {
    setIsLocalConnecting(true);
    await disconnectAsync();

    const walletChainId = await connector.getChainId();
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
          await login(address, connector.name);
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

    setIsLocalConnecting(false);
    return { address, error };
  };

  const connectMobile = async (connector: WagmiConnectorInstance): Promise<{ address?: string; error?: string }> => {
    // If on mobile and the connector contains the wallet connect modal connector, use it.
    const _connector =
      connector.walletConnectModalConnector && isMobile() ? connector.walletConnectModalConnector : connector;

    return await connect(_connector);
  };

  const getQrUri = (connector: WagmiConnectorInstance) => () => {
    return getWalletConnectUri(connector, connector.capsuleDetails?.getUri);
  };

  // If an Eip6963 wallet is injected we want to remove the non Eip6963 connector and attach its metadata to the Eip6963 connector
  const nonEip6963ConnectorsByRdns = {};
  let walletConnectModalConnector: WagmiConnectorInstance;
  connectors
    .filter(c => !isEIP6963Connector(c))
    .forEach(c => {
      if (c.capsuleDetails) {
        nonEip6963ConnectorsByRdns[c.capsuleDetails.rdns] = c.capsuleDetails;

        if (c.capsuleDetails.isWalletConnectModalConnector) {
          walletConnectModalConnector = c;
        }
      }
    });
  const eip6963ids = connectors.filter(c => isEIP6963Connector(c)).map(c => c.id);
  const dedupedConnectors = connectors
    .map(c => {
      // Filter out the duplicated walletConnect connector with the modal
      // This connector will be attached to the WC connector that doesn't contain the modal for use on mobile
      if (c.capsuleDetails?.isWalletConnectModalConnector) {
        return;
      }
      // Remove any non EIP6963 connectors if they have a matching EIP6963 connectors
      if (!isEIP6963Connector(c) && eip6963ids.includes(c.capsuleDetails?.rdns)) {
        return;
      }
      // Return the EIP6963 connectors
      if (isEIP6963Connector(c)) {
        const capsuleMetadata = nonEip6963ConnectorsByRdns[c.id];
        return { ...c, capsuleDetails: capsuleMetadata };
      }

      // Return the WC connector with the attached WC modal connector
      if (c.capsuleDetails?.id === 'walletConnect' && walletConnectModalConnector) {
        return { ...c, walletConnectModalConnector };
      }

      return c;
    })
    .filter(c => !!c);

  const wallets = dedupedConnectors.map(c => {
    const connector = { ...c, ...c.capsuleDetails };

    return {
      ...connector,
      connect: () => connect(connector),
      connectMobile: () => connectMobile(connector),
      type: ExternalWalletType.EVM,
      getQrUri: getQrUri(connector),
    } as CommonWallet;
  });

  const formattedChains: CommonChain[] = chains.map(c => {
    return {
      id: c.id,
      name: c.name,
    };
  });

  const username = useMemo(() => ensName ?? wagmiAddress, [ensName, wagmiAddress]);

  const disconnect = disconnectAsync;

  return (
    <EvmExternalWalletContext.Provider
      value={useMemo(
        () => ({ wallets, chains: formattedChains, chainId, username, avatar: ensAvatar, disconnect, switchChain }),
        [wallets, formattedChains, chainId, username, ensAvatar, disconnect, switchChain],
      )}
    >
      {children}
    </EvmExternalWalletContext.Provider>
  );
}
