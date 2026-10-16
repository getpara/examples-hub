import { erc20Abi, type Address } from "viem";
import { arcPublicClient, basePublicClient } from "@/lib/publicClients";
import { USDC } from "@/lib/tokens";

export interface WalletBalances {
  baseUsdc: bigint;
  baseEth: bigint;
  arcUsdc: bigint;
}

export async function readWalletBalances(address: Address): Promise<WalletBalances> {
  const [baseUsdc, baseEth, arcUsdc] = await Promise.all([
    basePublicClient.readContract({
      address: USDC.baseAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    }),
    basePublicClient.getBalance({ address }),
    arcPublicClient.readContract({
      address: USDC.arcAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    }),
  ]);

  return { baseUsdc, baseEth, arcUsdc };
}
