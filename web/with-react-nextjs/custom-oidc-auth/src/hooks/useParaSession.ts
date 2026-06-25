import { useAccount, useClient, useLogout, useWallet } from "@getpara/react-sdk";
import { useE2ECleanup } from "@/lib/e2e-helpers";

// Session surface for the connected state: wallet address, connection flag, and logout.
// All values come from react-sdk hooks, so they stay in sync with the OIDC auth flow.
export function useParaSession() {
  const para = useClient();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const { logout, isPending: isDisconnecting } = useLogout();

  useE2ECleanup(para);

  return {
    address: wallet?.address ?? "",
    isConnected,
    isDisconnecting,
    disconnect: logout,
  };
}
