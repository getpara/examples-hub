import { useCallback, useState } from "react";
import { useRequestFaucet } from "@getpara/react-sdk";
import { useEthersProvider } from "@/hooks/useEthersProvider";
import { SEPOLIA } from "@/lib/chain";

const CONFIRMATION_TIMEOUT_MS = 120_000;
const TOO_MANY_REQUESTS = 429;

export type FaucetStatus = "idle" | "requesting" | "submitted" | "confirmed" | "failed";

function getResponseStatus(error: object) {
  if (!("response" in error) || typeof error.response !== "object" || error.response === null) return null;
  return "status" in error.response && typeof error.response.status === "number" ? error.response.status : null;
}

export function useFaucet() {
  const { provider } = useEthersProvider();
  const { requestFaucetAsync, isPending } = useRequestFaucet();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [status, setStatus] = useState<FaucetStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const request = useCallback(async () => {
    setError(null);
    setIsRateLimited(false);
    setTxHash(null);
    setStatus("requesting");
    try {
      const { transactionHash } = await requestFaucetAsync({ chain: SEPOLIA.faucetChain });
      setTxHash(transactionHash);
      setStatus("submitted");

      const receipt = await provider.waitForTransaction(transactionHash, 1, CONFIRMATION_TIMEOUT_MS);
      if (!receipt) {
        throw new Error("Faucet transaction was submitted but confirmation is taking longer than expected. Check the hash on Sepolia.");
      }
      if (receipt.status === 0) {
        throw new Error("Faucet transaction was submitted but failed on-chain.");
      }
      setStatus("confirmed");
    } catch (requestError) {
      setStatus("failed");
      setIsRateLimited(
        typeof requestError === "object" && requestError !== null && getResponseStatus(requestError) === TOO_MANY_REQUESTS
      );
      setError(requestError instanceof Error ? requestError.message : "Faucet request failed.");
    }
  }, [provider, requestFaucetAsync]);

  const reset = useCallback(() => {
    setTxHash(null);
    setError(null);
    setIsRateLimited(false);
    setStatus("idle");
  }, []);

  return {
    request,
    txHash,
    status,
    isPending: isPending || status === "requesting" || status === "submitted",
    error,
    isRateLimited,
    reset,
  };
}
