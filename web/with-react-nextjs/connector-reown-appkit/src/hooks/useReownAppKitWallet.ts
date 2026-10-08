import { useCallback } from "react";
import { useAppKit, useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { useAccount } from "wagmi";

export function useReownAppKitWallet() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { connector } = useAccount();
  const { disconnect } = useDisconnect();

  const openAppKit = useCallback(() => {
    void open();
  }, [open]);

  const disconnectWallet = useCallback(() => {
    void disconnect();
  }, [disconnect]);

  return {
    address: address ?? "",
    connectorName: connector?.name,
    isConnected,
    openAppKit,
    disconnectWallet,
  };
}
