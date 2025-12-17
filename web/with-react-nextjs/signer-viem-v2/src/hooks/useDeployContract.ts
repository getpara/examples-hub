"use client";

import { useState, useCallback } from "react";
import { useAccount } from "@getpara/react-sdk";
import { useViemClient } from "@getpara/react-sdk/evm";
import { http } from "viem";
import type { Hash, Address, Abi, Hex } from "viem";
import { publicClient, CHAIN } from "@/lib/viem";

export interface DeployContractParams {
  abi: Abi;
  bytecode: Hex;
  args?: unknown[];
}

export interface UseDeployContractResult {
  deployContract: (params: DeployContractParams) => Promise<Address>;
  isPending: boolean;
  contractAddress: Address | null;
  txHash: Hash | null;
  error: Error | null;
  reset: () => void;
}

export function useDeployContract(): UseDeployContractResult {
  const { isConnected, embedded } = useAccount();
  const address = embedded?.wallets?.[0]?.address as `0x${string}` | undefined;
  const { viemClient } = useViemClient({ address, walletClientConfig: { chain: CHAIN, transport: http() } });

  const [isPending, setIsPending] = useState(false);
  const [contractAddress, setContractAddress] = useState<Address | null>(null);
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setIsPending(false);
    setContractAddress(null);
    setTxHash(null);
    setError(null);
  }, []);

  const deployContract = useCallback(
    async (params: DeployContractParams): Promise<Address> => {
      if (!isConnected || !viemClient) {
        throw new Error("Wallet not connected");
      }

      setIsPending(true);
      setError(null);
      setTxHash(null);
      setContractAddress(null);

      try {
        const hash = await viemClient.deployContract({
          abi: params.abi,
          bytecode: params.bytecode,
          args: params.args ?? [],
        });

        setTxHash(hash);

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (!receipt.contractAddress) {
          throw new Error("Contract deployment failed - no address returned");
        }

        setContractAddress(receipt.contractAddress);
        setIsPending(false);
        return receipt.contractAddress;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to deploy contract");
        setError(error);
        setIsPending(false);
        throw error;
      }
    },
    [isConnected, viemClient]
  );

  return {
    deployContract,
    isPending,
    contractAddress,
    txHash,
    error,
    reset,
  };
}
