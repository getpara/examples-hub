import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/vaultsFyi";

export function useTransactionContext(
  userAddress: string | undefined,
  network: string,
  vaultId: string | undefined,
) {
  return useQuery({
    queryKey: ["transactionContext", userAddress, network, vaultId],
    queryFn: () =>
      sdk.getTransactionsContext({
        path: {
          userAddress: userAddress!,
          network: network as "base",
          vaultId: vaultId!,
        },
      }),
    enabled: !!userAddress && !!vaultId,
  });
}
