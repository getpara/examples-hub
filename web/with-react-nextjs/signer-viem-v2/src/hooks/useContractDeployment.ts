"use client";

import { useState } from "react";
import type { Address, Hex } from "viem";
import { PARA_TEST_TOKEN_ABI, PARA_TEST_TOKEN_BYTECODE } from "@/lib/contracts";
import { CHAIN, publicClient } from "@/lib/viem";
import { useParaSigner } from "./useParaSigner";

interface DeploymentInfo {
  contractAddress: Address;
  transactionHash: Hex;
  deployedBytecode?: Hex;
}

export function useContractDeployment() {
  const { viemClient, account, isReady } = useParaSigner();
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reset = () => {
    setDeploymentInfo(null);
    setError(null);
  };

  const deployContract = async () => {
    if (!viemClient || !account) {
      setError(new Error("Connect your Para wallet before deploying a contract."));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const hash = await viemClient.deployContract({
        abi: PARA_TEST_TOKEN_ABI,
        account,
        bytecode: PARA_TEST_TOKEN_BYTECODE,
        chain: CHAIN,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (!receipt.contractAddress) {
        throw new Error("Deployment transaction did not return a contract address.");
      }

      const deployedBytecode = await publicClient.getCode({ address: receipt.contractAddress });
      setDeploymentInfo({
        contractAddress: receipt.contractAddress,
        transactionHash: hash,
        deployedBytecode,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to deploy contract"));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deployContract,
    deploymentInfo,
    isLoading,
    isReady,
    error,
    reset,
  };
}
