import { useAccount, useClient, useLogout, useWallet } from "@getpara/react-sdk";
import { useE2ECleanup } from "@/lib/e2e-helpers";

export function useParaSession() {
  const para = useClient();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const { logout, isPending: isDisconnecting } = useLogout();

  useE2ECleanup(para);

  return {
    address: wallet?.address,
    isConnected,
    isDisconnecting,
    disconnect: logout,
  };
}
