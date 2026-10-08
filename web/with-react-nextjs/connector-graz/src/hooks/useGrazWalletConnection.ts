import { useEffect, useMemo, useState } from "react";
import {
  getAvailableWallets,
  useAccount,
  useActiveWalletType,
  useConnect,
  useDisconnect,
  WALLET_TYPES,
  WalletType,
} from "graz";
import { ICS_PROVIDER_TESTNET } from "@/lib/chain";

const CHAIN_ID = ICS_PROVIDER_TESTNET.chainId;

interface UseGrazWalletConnectionOptions {
  onConnectSettled: () => void;
}

export interface GrazWalletOption {
  id: WalletType;
  isPara: boolean;
}

export function useGrazWalletConnection({ onConnectSettled }: UseGrazWalletConnectionOptions) {
  const { data: accounts, isConnected } = useAccount({ chainId: [CHAIN_ID] as const });
  const { walletType: activeWalletType } = useActiveWalletType();
  const { connect, status: connectStatus, error: connectError } = useConnect();
  const { disconnect, isLoading: isDisconnecting } = useDisconnect();
  const [selectedWalletType, setSelectedWalletType] = useState<WalletType>();

  useEffect(() => {
    if (connectStatus === "success" || connectStatus === "error") {
      onConnectSettled();
    }
  }, [connectStatus, onConnectSettled]);

  const wallets = useMemo<GrazWalletOption[]>(() => {
    const availability = getAvailableWallets();

    return WALLET_TYPES.filter((walletType) => availability[walletType]).map((walletType) => ({
      id: walletType,
      isPara: walletType === WalletType.PARA,
    }));
  }, []);

  const connectWallet = (walletId: string) => {
    const walletType = wallets.find((wallet) => wallet.id === walletId)?.id;

    if (walletType) {
      setSelectedWalletType(walletType);
      connect({ walletType, chainId: CHAIN_ID });
    }
  };

  const disconnectWallet = () => {
    disconnect({ chainId: [CHAIN_ID] });
  };

  const isConnecting = connectStatus === "pending";

  return {
    activeWalletType,
    address: accounts?.[CHAIN_ID]?.bech32Address ?? "",
    connectErrorMessage: connectError?.message ?? null,
    connectWallet,
    connectingWalletType: isConnecting ? selectedWalletType : undefined,
    disconnectWallet,
    isConnected,
    isConnecting,
    isDisconnecting,
    wallets,
  };
}
