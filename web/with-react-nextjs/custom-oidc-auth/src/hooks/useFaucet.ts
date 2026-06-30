import { useCallback, useState } from "react";
import { useRequestFaucet } from "@getpara/react-sdk";
import { useEthersProvider } from "@/hooks/useEthersProvider";
import { FAUCET_CHAIN } from "@/lib/para";

const FAUCET_CONFIRMATION_TIMEOUT_MS = 120_000;

function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const response = "response" in error ? (error as { response?: { status?: unknown } }).response : undefined;
  return typeof response?.status === "number" ? response.status : undefined;
}

function getFaucetErrorMessage(error: unknown): string {
  if (getErrorStatus(error) === 429) {
    return "This wallet has already requested faucet funds recently. Try again later or sign in with a fresh wallet.";
  }

  return error instanceof Error ? error.message : "Faucet request failed.";
}

export interface UseFaucetReturn {
  request: () => Promise<void>;
  txHash: string | null;
  status: FaucetStatus;
  isPending: boolean;
  error: string | null;
  reset: () => void;
}

export type FaucetStatus = "idle" | "requesting" | "submitted" | "confirmed" | "failed";

// Requests testnet ETH for the active Para wallet on Sepolia. useRequestFaucet resolves
// the walletId from the active wallet, so no walletId is passed here. The response carries
// a funding tx hash — wait for it to confirm before the wallet has spendable funds.
export function useFaucet(): UseFaucetReturn {
  const { provider } = useEthersProvider();
  const { requestFaucetAsync, isPending } = useRequestFaucet();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [status, setStatus] = useState<FaucetStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async () => {
    setError(null);
    setTxHash(null);
    setStatus("requesting");
    try {
      const { transactionHash } = await requestFaucetAsync({ chain: FAUCET_CHAIN });
      setTxHash(transactionHash);
      setStatus("submitted");

      const receipt = await provider.waitForTransaction(transactionHash, 1, FAUCET_CONFIRMATION_TIMEOUT_MS);
      if (!receipt) {
        throw new Error("Faucet transaction was submitted but confirmation is taking longer than expected. Check the hash on Sepolia.");
      }
      if (receipt?.status === 0) {
        throw new Error("Faucet transaction was submitted but failed on-chain.");
      }
      setStatus("confirmed");
    } catch (err) {
      setStatus("failed");
      setError(getFaucetErrorMessage(err));
    }
  }, [provider, requestFaucetAsync]);

  const reset = useCallback(() => {
    setTxHash(null);
    setError(null);
    setStatus("idle");
  }, []);

  return {
    request,
    txHash,
    status,
    isPending: isPending || status === "requesting" || status === "submitted",
    error,
    reset,
  };
}
