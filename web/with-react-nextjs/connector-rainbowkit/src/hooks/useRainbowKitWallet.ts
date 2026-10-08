import { useAccountModal, useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export function useRainbowKitWallet() {
  const { address, chain, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();

  const openConnect = () => openConnectModal?.();

  const openAccount = () => (chain ? openAccountModal?.() : openChainModal?.());

  return {
    address: address ?? "",
    isConnected,
    openConnect,
    openAccount,
  };
}
