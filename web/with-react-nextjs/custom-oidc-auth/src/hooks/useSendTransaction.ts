"use client";

import { useCallback, useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "@getpara/react-sdk";
import { useParaEthersSigner } from "@getpara/react-sdk/evm";
import { useEthersProvider } from "./useEthersProvider";
import { SEPOLIA_CHAIN_ID } from "@/lib/para";

export const SELF_TRANSFER_ETH = "0.0001";

export interface UseSendTransactionReturn {
  send: () => Promise<void>;
  amount: string;
  txHash: string | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  reset: () => void;
}

// Sends a fixed self-transfer on Sepolia, signed by the embedded Para wallet. The signer
// comes from useParaEthersSigner (ethers AbstractSigner backed by Para MPC); the provider
// supplies nonce / gas / balance and broadcasts the signed tx.
export function useSendTransaction(): UseSendTransactionReturn {
  const { provider } = useEthersProvider();
  const { ethersSigner } = useParaEthersSigner({ provider });
  const { data: wallet } = useWallet();

  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async () => {
    if (!ethersSigner || !wallet?.address) {
      setError("Signer not ready — connect your wallet first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setTxHash(null);
    try {
      const amountWei = ethers.parseEther(SELF_TRANSFER_ETH);

      // Pre-check balance so an unfunded wallet gets a clear "use the faucet" message
      // instead of an opaque RPC rejection.
      const balanceWei = await provider.getBalance(wallet.address);
      const feeData = await provider.getFeeData();
      const gasLimit = BigInt(21000);
      const maxGasFee = gasLimit * (feeData.maxFeePerGas ?? BigInt(0));
      if (amountWei + maxGasFee > balanceWei) {
        throw new Error("Insufficient balance — request faucet funds first, then retry.");
      }

      // Self-transfer: send the test amount from the Para wallet back to itself.
      const tx: ethers.TransactionRequest = {
        to: wallet.address,
        value: amountWei,
        nonce: await provider.getTransactionCount(wallet.address),
        gasLimit,
        maxFeePerGas: feeData.maxFeePerGas ?? undefined,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
        chainId: SEPOLIA_CHAIN_ID,
      };

      const txResponse = await ethersSigner.sendTransaction(tx);
      setTxHash(txResponse.hash);
      await txResponse.wait();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setIsLoading(false);
    }
  }, [ethersSigner, provider, wallet?.address]);

  const reset = useCallback(() => {
    setTxHash(null);
    setError(null);
  }, []);

  return {
    send,
    amount: SELF_TRANSFER_ETH,
    txHash,
    isLoading,
    isReady: !!ethersSigner && !!wallet?.address,
    error,
    reset,
  };
}
