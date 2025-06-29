import { useAccount } from "@getpara/react-sdk";
import { useViem } from "@/context/ParaProvider";

export function useParaSigner() {
  const accountQuery = useAccount();
  const { publicClient, walletClient, account } = useViem();
  
  const isConnected = accountQuery.data?.isConnected ?? false;
  const address = accountQuery.data?.wallets?.[0]?.address as `0x${string}` | undefined;
  const walletId = accountQuery.data?.wallets?.[0]?.id;

  return {
    isConnected,
    address,
    walletId,
    publicClient,
    walletClient,
    account,
  };
}