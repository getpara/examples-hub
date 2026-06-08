"use client";

import { formatEther } from "viem";
import { useBalance } from "wagmi";
import { sepolia } from "wagmi/chains";
import { formatBalance } from "@/utils/format";

export function useWagmiBalance(address?: `0x${string}`) {
  const {
    data: balance,
    isLoading,
    refetch,
  } = useBalance({
    address,
    chainId: sepolia.id,
  });

  return {
    balance: balance ? `${formatBalance(formatEther(balance.value))} ETH` : "Unable to fetch balance",
    isLoading,
    refresh: () => refetch(),
  };
}
