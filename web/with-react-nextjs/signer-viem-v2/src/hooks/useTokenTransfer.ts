"use client";

import { useCallback, useEffect, useState } from "react";
import { formatEther, formatUnits, isAddress, parseUnits, type Address, type Hex } from "viem";
import { ERC20_ABI } from "@/lib/contracts";
import { CHAIN, publicClient } from "@/lib/viem";
import { useParaSigner } from "./useParaSigner";

export function useTokenTransfer(contractAddress: string) {
  const { viemClient, account, address, isReady } = useParaSigner();
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState("CTT");
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const reset = () => {
    setTxHash(null);
    setError(null);
  };

  const fetchBalances = useCallback(async () => {
    if (!address || !isAddress(contractAddress)) {
      setEthBalance(null);
      setTokenBalance(null);
      return;
    }

    try {
      setIsBalanceLoading(true);
      setError(null);
      const tokenAddress = contractAddress as Address;
      const [ethBalanceWei, balance, symbol, decimals] = await Promise.all([
        publicClient.getBalance({ address }),
        publicClient.readContract({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
        publicClient.readContract({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: "symbol",
        }),
        publicClient.readContract({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: "decimals",
        }),
      ]);

      setEthBalance(formatEther(ethBalanceWei));
      setTokenSymbol(symbol as string);
      setTokenDecimals(decimals as number);
      setTokenBalance(formatUnits(balance as bigint, decimals as number));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch token balances"));
    } finally {
      setIsBalanceLoading(false);
    }
  }, [address, contractAddress]);

  useEffect(() => {
    if (isReady) {
      void fetchBalances();
    }
  }, [isReady, fetchBalances]);

  const transfer = async (to: string, amount: string) => {
    if (!viemClient || !account) {
      setError(new Error("Connect your Para wallet before transferring tokens."));
      return;
    }

    if (!isAddress(contractAddress) || !isAddress(to)) {
      setError(new Error("Enter valid contract and recipient addresses."));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const hash = await viemClient.writeContract({
        address: contractAddress as Address,
        abi: ERC20_ABI,
        account,
        chain: CHAIN,
        functionName: "transfer",
        args: [to, parseUnits(amount, tokenDecimals)],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setTxHash(hash);
      await fetchBalances();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to transfer tokens"));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    transfer,
    fetchBalances,
    ethBalance,
    tokenBalance,
    tokenSymbol,
    txHash,
    isLoading,
    isBalanceLoading,
    isReady,
    error,
    reset,
  };
}
