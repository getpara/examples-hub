"use client";

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
  const { connect, connectors, isSuccess } = useConnect();
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

  return {
    activeConnectorName: activeConnector?.name,
    address,
    connectWallet,
    connectors: connectorOptions,
    disconnectWallet: disconnect,
    isConnected,
  };
}
