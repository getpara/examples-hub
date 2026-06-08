import { useCallback, useMemo } from "react";
import { getAvailableWallets, useAccount, useConnect, useDisconnect, WalletType } from "graz";
import { CHAIN_ID } from "@/config/constants";

export interface WalletOption {
  walletType: WalletType;
  name: string;
}

const WALLET_LABELS: Partial<Record<WalletType, string>> = {
  [WalletType.PARA]: "Para",
  [WalletType.KEPLR]: "Keplr",
  [WalletType.LEAP]: "Leap",
  [WalletType.COSMOSTATION]: "Cosmostation",
  [WalletType.WALLETCONNECT]: "WalletConnect",
};

function formatWalletName(walletType: WalletType) {
  return (
    WALLET_LABELS[walletType] ??
    walletType
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function useGrazWalletConnection() {
  const { data: accounts, isConnected } = useAccount({ chainId: [CHAIN_ID] as const });
  const { connect, status: connectStatus, error: connectError } = useConnect();
  const { disconnect, isLoading: isDisconnecting } = useDisconnect();

  const address = accounts?.[CHAIN_ID]?.bech32Address ?? "";

  const wallets = useMemo<WalletOption[]>(() => {
    return Object.entries(getAvailableWallets())
      .filter(([, isAvailable]) => isAvailable)
      .map(([walletType]) => {
        const typedWalletType = walletType as WalletType;
        return {
          walletType: typedWalletType,
          name: formatWalletName(typedWalletType),
        };
      });
  }, []);

  const paraWallet = wallets.find((wallet) => wallet.walletType === WalletType.PARA) ?? null;
  const otherWallets = wallets.filter((wallet) => wallet.walletType !== WalletType.PARA);

  const connectWallet = useCallback(
    (walletType: WalletType) => {
      connect({ walletType, chainId: CHAIN_ID });
    },
    [connect],
  );

  const disconnectWallet = useCallback(() => {
    disconnect({ chainId: [CHAIN_ID] });
  }, [disconnect]);

  return {
    address,
    isConnected,
    connectStatus,
    connectError,
    paraWallet,
    otherWallets,
    isDisconnecting,
    connectWallet,
    disconnectWallet,
  };
}
