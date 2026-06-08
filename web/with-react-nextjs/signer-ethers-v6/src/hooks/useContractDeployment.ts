"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useParaSigner } from "./useParaSigner";
import ParaTestToken from "@/contracts/artifacts/src/contracts/ParaTestToken.sol/ParaTestToken.json";

export interface DeploymentInfo {
  contractAddress: string;
  transactionHash: string;
  deployedBytecode: string;
}

export function useContractDeployment() {
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { signer } = useParaSigner();

  const deployContract = useCallback(async () => {
    if (!signer) {
      throw new Error("Signer not initialized. Please connect your wallet.");
    }

    setIsLoading(true);
    setError(null);
    setDeploymentInfo(null);

    try {
      const factory = new ethers.ContractFactory(ParaTestToken.abi, ParaTestToken.bytecode, signer);
      const contract = await factory.deploy();
      await contract.waitForDeployment();

      const contractAddress = await contract.getAddress();
      const deploymentTx = contract.deploymentTransaction();

      const info: DeploymentInfo = {
        contractAddress,
        transactionHash: deploymentTx?.hash ?? "",
        deployedBytecode: ParaTestToken.bytecode,
      };

      setDeploymentInfo(info);
      return info;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to deploy contract");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  const reset = useCallback(() => {
    setDeploymentInfo(null);
    setError(null);
  }, []);

  return {
    deployContract,
    deploymentInfo,
    isLoading,
    isReady: !!signer,
    error,
    reset,
  };
}
