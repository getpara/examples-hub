import { useBalances } from "graz";
import { ICS_PROVIDER_TESTNET } from "@/lib/chain";

export function useGrazBalance(address: string) {
  const { data, isLoading, isFetching, refetch } = useBalances({
    chainId: ICS_PROVIDER_TESTNET.chainId,
    bech32Address: address,
    enabled: Boolean(address),
  });

  const minimalAmount = data
    ? Number(data.find((coin) => coin.denom === ICS_PROVIDER_TESTNET.denom)?.amount ?? "0")
    : null;

  return {
    balance: minimalAmount === null ? null : (minimalAmount / 10 ** ICS_PROVIDER_TESTNET.decimals).toString(),
    isUnfunded: minimalAmount === 0,
    isLoading,
    isRefreshing: isFetching && !isLoading,
    refresh: () => {
      void refetch();
    },
  };
}
