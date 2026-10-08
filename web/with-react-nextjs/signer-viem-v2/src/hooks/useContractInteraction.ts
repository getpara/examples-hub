import { useCallback, useEffect, useState } from "react";
import { formatEther, parseEther, type Hex } from "viem";
import { HOLESKY } from "@/lib/chain";
import { PARA_TEST_TOKEN } from "@/lib/contracts";
import { publicClient } from "@/lib/publicClient";
import { useParaSigner } from "@/hooks/useParaSigner";

export function useContractInteraction() {
  const { viemClient, account, address, isReady } = useParaSigner();
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [mintedAmount, setMintedAmount] = useState<string | null>(null);
  const [mintLimit, setMintLimit] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const reset = () => {
    setTxHash(null);
    setError(null);
  };

  const fetchContractData = useCallback(async () => {
    if (!address) {
      setTokenBalance(null);
      setMintedAmount(null);
      setMintLimit(null);
      return;
    }

    try {
      setIsDataLoading(true);
      setError(null);
      const [balance, minted, limit] = await Promise.all([
        publicClient.readContract({
          address: PARA_TEST_TOKEN.address,
          abi: PARA_TEST_TOKEN.abi,
          functionName: "balanceOf",
          args: [address],
        }),
        publicClient.readContract({
          address: PARA_TEST_TOKEN.address,
          abi: PARA_TEST_TOKEN.abi,
          functionName: "mintedAmount",
          args: [address],
        }),
        publicClient.readContract({
          address: PARA_TEST_TOKEN.address,
          abi: PARA_TEST_TOKEN.abi,
          functionName: "MINT_LIMIT",
        }),
      ]);

      setTokenBalance(formatEther(balance as bigint));
      setMintedAmount(formatEther(minted as bigint));
      setMintLimit(formatEther(limit as bigint));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch contract data"));
    } finally {
      setIsDataLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isReady) {
      void fetchContractData();
    }
  }, [isReady, fetchContractData]);

  const mint = async (amount: string) => {
    if (!viemClient || !account) {
      setError(new Error("Connect your Para wallet before minting tokens."));
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const hash = await viemClient.writeContract({
        address: PARA_TEST_TOKEN.address,
        abi: PARA_TEST_TOKEN.abi,
        account,
        chain: HOLESKY.chain,
        functionName: "mint",
        args: [parseEther(amount)],
      });
      setTxHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      await fetchContractData();
      return hash;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to mint tokens"));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const hasReachedLimit =
    mintedAmount !== null && mintLimit !== null ? Number.parseFloat(mintedAmount) >= Number.parseFloat(mintLimit) : false;

  return {
    mint,
    fetchContractData,
    tokenBalance,
    mintedAmount,
    mintLimit,
    txHash,
    isLoading,
    isDataLoading,
    isReady,
    hasReachedLimit,
    error,
    reset,
  };
}
