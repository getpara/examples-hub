import { formatEther, type Address } from "viem";
import { useBalance } from "wagmi";
import { sepolia } from "wagmi/chains";

export function useWagmiBalance(address?: Address) {
  const { data, isLoading, isFetching, refetch } = useBalance({
    address,
    chainId: sepolia.id,
  });

  return {
    balance: data ? formatEther(data.value) : null,
    isLoading,
    isRefreshing: isFetching && !isLoading,
    refresh: () => {
      void refetch();
    },
  };
}
