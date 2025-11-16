import { useClient, useWallet, useAccount } from "@getpara/react-sdk";

/**
 * Hook that ensures the user is connected and returns the Para client and wallet ID.
 * Throws an error if not connected, which React Query will catch and handle.
 */
export function useRequireConnected() {
  const para = useClient();
  const { data: wallet } = useWallet();
  const { isConnected } = useAccount();

  if (!para || !wallet?.id || !isConnected) {
    throw new Error("Not connected");
  }

  return { para, walletId: wallet.id };
}