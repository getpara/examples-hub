import { useEffect, useMemo } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

interface UseWagmiWalletConnectionOptions {
  onConnectSuccess: () => void;
}

export interface WalletConnectorOption {
  id: string;
  name: string;
  isPara: boolean;
}

export function useWagmiWalletConnection({ onConnectSuccess }: UseWagmiWalletConnectionOptions) {
  const { address, connector: activeConnector, isConnected } = useAccount();
  const { connect, connectors, isPending, isSuccess, variables } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (isSuccess) {
      onConnectSuccess();
    }
  }, [isSuccess, onConnectSuccess]);

  const connectorOptions = useMemo<WalletConnectorOption[]>(
    () =>
      connectors.map((connector) => ({
        id: connector.id,
        isPara: connector.id === "para",
        name: connector.name,
      })),
    [connectors]
  );

  const connectWallet = (connectorId: string) => {
    const connector = connectors.find((item) => item.id === connectorId);

    if (connector) {
      connect({ connector });
    }
  };

  const pendingConnector = isPending ? variables?.connector : undefined;

  return {
    activeConnectorName: activeConnector?.name,
    address,
    connectWallet,
    connectingConnectorId: typeof pendingConnector === "object" ? pendingConnector.id : undefined,
    connectors: connectorOptions,
    disconnectWallet: disconnect,
    isConnected,
    isConnecting: isPending,
  };
}
