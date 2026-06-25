import { useCallback, useState } from "react";
import { useRequestFaucet } from "@getpara/react-sdk";
import { FAUCET_CHAIN } from "@/lib/para";

export interface UseFaucetReturn {
  request: () => Promise<void>;
  txHash: string | null;
  isPending: boolean;
  error: string | null;
  reset: () => void;
}

// Requests testnet ETH for the active Para wallet on Sepolia. useRequestFaucet resolves
// the walletId from the active wallet, so no walletId is passed here. The response carries
// a funding tx hash — wait for it to confirm before the wallet has spendable funds.
export function useFaucet(): UseFaucetReturn {
  const { requestFaucetAsync, isPending } = useRequestFaucet();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async () => {
    setError(null);
    setTxHash(null);
    try {
      const { transactionHash } = await requestFaucetAsync({ chain: FAUCET_CHAIN });
      setTxHash(transactionHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Faucet request failed.");
    }
  }, [requestFaucetAsync]);

  const reset = useCallback(() => {
    setTxHash(null);
    setError(null);
  }, []);

  return { request, txHash, isPending, error, reset };
}
