"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "@getpara/react-sdk";
import { useParaEthersSigner } from "@getpara/react-sdk/evm";
import { provider } from "@/lib/provider";
import ParaTestToken from "@/contracts/artifacts/contracts/ParaTestToken.sol/ParaTestToken.json";

export type Operation = {
  type: "mint" | "transfer";
  recipient: string;
  amount: string;
};

const DEFAULT_CONTRACT_ADDRESS = "0x83cC70475A0d71EF1F2F61FeDE625c8C7E90C3f2";

export function useBatchTransactions(contractAddress: string = DEFAULT_CONTRACT_ADDRESS) {
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { data: wallet } = useWallet();
  const { ethersSigner: signer } = useParaEthersSigner({ provider });

  const fetchTokenData = useCallback(async () => {
    if (!wallet?.address || !provider) return;

    setIsBalanceLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, ParaTestToken.abi, provider);
      const balance = await contract.balanceOf(wallet.address);
      setTokenBalance(ethers.formatEther(balance));
    } catch (err) {
      console.error("Error fetching token data:", err);
      setTokenBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  }, [wallet?.address, provider, contractAddress]);

  useEffect(() => {
    fetchTokenData();
  }, [fetchTokenData]);

  const executeMulticall = useCallback(
    async (operations: Operation[]) => {
      if (!signer || !wallet?.address) {
        throw new Error("Signer not initialized. Please connect your wallet.");
      }

      if (operations.length === 0) {
        throw new Error("At least one operation is required.");
      }

      // Validate operations
      for (const op of operations) {
        if (!op.amount || parseFloat(op.amount) <= 0) {
          throw new Error("All operations must have a valid amount greater than 0.");
        }
        if (op.type === "transfer" && !op.recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
          throw new Error("Transfer operations require a valid recipient address.");
        }
      }

      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const contract = new ethers.Contract(contractAddress, ParaTestToken.abi, signer);
        const iface = new ethers.Interface(ParaTestToken.abi);

        // Prepare calldata for each operation
        const calldata = operations.map((op) => {
          if (op.type === "mint") {
            return iface.encodeFunctionData("mint", [ethers.parseEther(op.amount)]);
          } else {
            return iface.encodeFunctionData("transfer", [op.recipient, ethers.parseEther(op.amount)]);
          }
        });

        const tx = await contract.multicall(calldata);
        setTxHash(tx.hash);

        await tx.wait();
        await fetchTokenData();

        return tx.hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to execute batch operations");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [signer, wallet?.address, contractAddress, fetchTokenData]
  );

  const reset = useCallback(() => {
    setTxHash(null);
    setError(null);
  }, []);

  return {
    executeMulticall,
    fetchTokenData,
    tokenBalance,
    txHash,
    isLoading,
    isBalanceLoading,
    isReady: !!signer && !!wallet?.address,
    error,
    reset,
  };
}
