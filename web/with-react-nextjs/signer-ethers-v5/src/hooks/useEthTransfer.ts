"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "@getpara/react-sdk";
import { useParaSigner } from "./useParaSigner";

const HOLESKY_CHAIN_ID = 17000;

export function useEthTransfer() {
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { data: wallet } = useWallet();
  const { signer, provider } = useParaSigner();

  const sendTransaction = useCallback(
    async (to: string, amount: string) => {
      if (!signer || !provider || !wallet?.address) {
        throw new Error("Signer not initialized. Please connect your wallet.");
      }

      if (!to.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid recipient address format.");
      }

      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        throw new Error("Please enter a valid amount greater than 0.");
      }

      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        // Validate balance
        const balanceWei = await provider.getBalance(wallet.address);
        const feeData = await provider.getFeeData();
        const gasLimit = ethers.BigNumber.from(21000);
        const maxGasFee = gasLimit.mul(feeData.maxFeePerGas ?? ethers.BigNumber.from(0));
        const amountWei = ethers.utils.parseEther(amount);
        const totalCost = amountWei.add(maxGasFee);

        if (totalCost.gt(balanceWei)) {
          const requiredEth = ethers.utils.formatEther(totalCost);
          const availableEth = ethers.utils.formatEther(balanceWei);
          throw new Error(
            `Insufficient balance. Transaction requires approximately ${requiredEth} ETH (including max gas fees), but only ${availableEth} ETH is available.`
          );
        }

        // Construct transaction
        const nonce = await provider.getTransactionCount(wallet.address);
        const tx: ethers.providers.TransactionRequest = {
          to,
          value: amountWei,
          nonce,
          gasLimit,
          maxFeePerGas: feeData.maxFeePerGas ?? undefined,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
          chainId: HOLESKY_CHAIN_ID,
          data: "0x",
        };

        const txResponse = await signer.sendTransaction(tx);
        setTxHash(txResponse.hash);

        // Wait for confirmation
        await txResponse.wait();

        return txResponse.hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to send transaction");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [signer, provider, wallet?.address]
  );

  const reset = useCallback(() => {
    setTxHash(null);
    setError(null);
  }, []);

  return {
    sendTransaction,
    txHash,
    isLoading,
    isReady: !!signer && !!provider && !!wallet?.address,
    error,
    reset,
  };
}
