import { useAccount, useClient, useModal, useWallet } from "@getpara/react-sdk";
import { useE2ECleanup } from "@/hooks/useE2ECleanup";

export function useParaModalWallet() {
  const { openModal } = useModal();
  const { isConnected, isLoading } = useAccount();
  const { data: wallet } = useWallet();
  const para = useClient();

  useE2ECleanup(para);

  return {
    address: wallet?.address ?? "",
    isConnected,
    isRestoring: !isConnected && isLoading,
    openModal,
  };
}
