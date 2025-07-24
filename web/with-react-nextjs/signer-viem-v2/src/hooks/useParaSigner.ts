import { useAccount, useWallet } from "@getpara/react-sdk";
import { useViem } from "@/context/ParaProvider";

export function useParaSigner() {
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const { publicClient, walletClient, account } = useViem();
  
  const address = wallet?.address as `0x${string}` | undefined;
  const walletId = wallet?.id;

  return {
    isConnected,
    address,
    walletId,
    publicClient,
    walletClient,
    account,
  };
}