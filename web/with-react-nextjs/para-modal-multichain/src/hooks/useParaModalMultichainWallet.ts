import { useAccount, useModal, useWallet } from "@getpara/react-sdk";

export function useParaModalMultichainWallet() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();

  return {
    address: wallet?.address ?? "",
    isConnected,
    openModal,
  };
}
