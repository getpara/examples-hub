import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useParaSigner } from "@/hooks/useParaSigner";
import { PARA_TEST_TOKEN } from "@/lib/contracts";

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
    setIsLoading(true);
    setError(null);
    setDeploymentInfo(null);

    try {
      if (!signer) {
        throw new Error("Signer not initialized. Please connect your wallet.");
      }

      const factory = new ethers.ContractFactory(PARA_TEST_TOKEN.abi, PARA_TEST_TOKEN.bytecode, signer);
      const contract = await factory.deploy();
      await contract.waitForDeployment();

      const contractAddress = await contract.getAddress();
      const deploymentTx = contract.deploymentTransaction();

      const info: DeploymentInfo = {
        contractAddress,
        transactionHash: deploymentTx?.hash ?? "",
        deployedBytecode: PARA_TEST_TOKEN.bytecode,
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
