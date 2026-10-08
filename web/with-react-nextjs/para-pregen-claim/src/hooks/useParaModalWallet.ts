import { useAccount, useModal, useWallet } from "@getpara/react-sdk-lite";

export function useParaModalWallet() {
  const { openModal, isOpen } = useModal();
  const { isConnected, isLoading } = useAccount();
  const { data: wallet } = useWallet();

  return {
    address: wallet?.address ?? "",
    isConnected,
    isLoading,
    isModalOpen: isOpen,
    openModal,
  };
}
