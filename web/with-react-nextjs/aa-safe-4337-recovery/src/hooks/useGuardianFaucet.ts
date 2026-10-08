import { useCallback } from "react";
import { useRequestFaucet } from "@getpara/react-sdk";

export function useGuardianFaucet() {
  const { requestFaucetAsync, isPending } = useRequestFaucet();

  const requestFunds = useCallback(async () => {
    const response = await requestFaucetAsync({ chain: "ETHEREUM_SEPOLIA" });
    return response.transactionHash;
  }, [requestFaucetAsync]);

  return { requestFunds, isPending };
}
