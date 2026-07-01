"use client";

import { useCallback, useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "@getpara/react-sdk";
import { useParaEthersSigner } from "@getpara/react-sdk/evm";
import { useEthersProvider } from "./useEthersProvider";
import { SEPOLIA_CHAIN_ID } from "@/lib/para";

export const SEND_AMOUNT_ETH = "0.001";
export const SEND_MIN_GAS_BUFFER_ETH = "0.0002";
export const SEND_MIN_BALANCE_WEI = ethers.parseEther(SEND_AMOUNT_ETH) + ethers.parseEther(SEND_MIN_GAS_BUFFER_ETH);
export const CUSTOM_LIMIT_DENIED_MESSAGE =
  "Custom limit exceeded. This send was denied by policy and was not signed.";
const POLICY_DENIED_CODE = "POLICY_DENIED";
const TRANSACTION_CONFIRMATION_TIMEOUT_MS = 120_000;
export type SendTransactionStatus = "idle" | "signing" | "submitted" | "confirmed" | "failed";

export interface UseSendTransactionReturn {
  send: () => Promise<void>;
  amount: string;
  txHash: string | null;
  status: SendTransactionStatus;
  recipientAddress: string | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  reset: () => void;
}

type TransactionErrorReason = Error | string | object | null;

function getStringProperty(reason: object, property: "code" | "message") {
  if (property === "code" && "code" in reason && typeof reason.code === "string") {
    return reason.code;
  }

  if (property === "message" && "message" in reason && typeof reason.message === "string") {
    return reason.message;
  }

  return "";
}

function getTransactionErrorMessage(reason: TransactionErrorReason) {
  if (typeof reason === "string") return reason;
  if (!reason) return "Transaction failed.";

  return getStringProperty(reason, "message") || "Transaction failed.";
}

function isPolicyDeniedError(reason: TransactionErrorReason) {
  return typeof reason === "object" && reason !== null && getStringProperty(reason, "code") === POLICY_DENIED_CODE;
}

// Sends a fixed Sepolia transfer back to the faucet, signed by the embedded Para wallet. The signer
// comes from useParaEthersSigner (ethers AbstractSigner backed by Para MPC); the provider
// supplies nonce / gas / balance and broadcasts the signed tx.
export function useSendTransaction(recipientAddress: string | null): UseSendTransactionReturn {
  const { provider } = useEthersProvider();
  const { ethersSigner } = useParaEthersSigner({ provider });
  const { data: wallet } = useWallet();

  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<SendTransactionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async () => {
    if (!ethersSigner || !wallet?.address) {
      setError("Signer not ready — connect your wallet first.");
      setStatus("failed");
      return;
    }
    if (!recipientAddress) {
      setError("Faucet return address unavailable — request faucet funds first.");
      setStatus("failed");
      return;
    }
    setIsLoading(true);
    setStatus("signing");
    setError(null);
    setTxHash(null);
    try {
      const amountWei = ethers.parseEther(SEND_AMOUNT_ETH);

      // Pre-check balance so an unfunded wallet gets a clear "use the faucet" message
      // instead of an opaque RPC rejection.
      const balanceWei = await provider.getBalance(wallet.address);
      const feeData = await provider.getFeeData();
      const gasLimit = BigInt(21000);
      const maxGasFee = gasLimit * (feeData.maxFeePerGas ?? BigInt(0));
      if (amountWei + maxGasFee > balanceWei) {
        throw new Error("Insufficient balance — request faucet funds first, then retry.");
      }

      // Return transfer: send the test amount from the Para wallet back to the faucet.
      const tx: ethers.TransactionRequest = {
        to: recipientAddress,
        value: amountWei,
        nonce: await provider.getTransactionCount(wallet.address),
        gasLimit,
        maxFeePerGas: feeData.maxFeePerGas ?? undefined,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
        chainId: SEPOLIA_CHAIN_ID,
      };

      const txResponse = await ethersSigner.sendTransaction(tx);

      setTxHash(txResponse.hash);
      setStatus("submitted");

      const receipt = await txResponse.wait(1, TRANSACTION_CONFIRMATION_TIMEOUT_MS);
      if (!receipt) {
        throw new Error("Transaction was submitted but confirmation is taking longer than expected. Check the hash on Sepolia.");
      }
      if (receipt?.status === 0) {
        throw new Error("Transaction was submitted but failed on-chain.");
      }
      setStatus("confirmed");
    } catch (err) {
      const reason =
        err instanceof Error || typeof err === "string" || (typeof err === "object" && err !== null) ? err : null;

      setStatus("failed");
      setError(isPolicyDeniedError(reason) ? CUSTOM_LIMIT_DENIED_MESSAGE : getTransactionErrorMessage(reason));
    } finally {
      setIsLoading(false);
    }
  }, [ethersSigner, provider, recipientAddress, wallet?.address]);

  const reset = useCallback(() => {
    setTxHash(null);
    setError(null);
    setStatus("idle");
  }, []);

  return {
    send,
    amount: SEND_AMOUNT_ETH,
    txHash,
    status,
    recipientAddress,
    isLoading,
    isReady: !!ethersSigner && !!wallet?.address,
    error,
    reset,
  };
}
