import { useState } from "react";
import { isAddress, parseEther, type Hex } from "viem";
import { HOLESKY } from "@/lib/chain";
import { publicClient } from "@/lib/publicClient";
import { useParaSigner } from "@/hooks/useParaSigner";

export function useEthTransfer() {
  const { viemClient, account, isReady } = useParaSigner();
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reset = () => {
    setTxHash(null);
    setError(null);
  };

  const sendTransaction = async (to: string, amount: string) => {
    if (!viemClient || !account) {
      setError(new Error("Connect your Para wallet before sending ETH."));
      return null;
    }

    if (!isAddress(to)) {
      setError(new Error("Enter a valid recipient address."));
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const hash = await viemClient.sendTransaction({
        account,
        chain: HOLESKY.chain,
        to,
        value: parseEther(amount),
      });
      setTxHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      return hash;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to send transaction"));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendTransaction,
    txHash,
    isLoading,
    isReady,
    error,
    reset,
  };
}
