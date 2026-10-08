import { useCallback, useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "@getpara/react-sdk";
import { useParaEthersSigner } from "@getpara/react-sdk/evm";
import { useEthersProvider } from "@/hooks/useEthersProvider";
import { SEPOLIA } from "@/lib/chain";
import { SEND_AMOUNT_ETH } from "@/lib/transfer";

const CONFIRMATION_TIMEOUT_MS = 120_000;
const POLICY_DENIED_CODE = "POLICY_DENIED";

export type SendTransactionStatus = "idle" | "signing" | "submitted" | "confirmed" | "failed";

function readErrorMessage(error: object | string) {
  if (typeof error === "string") return error;
  return "message" in error && typeof error.message === "string" ? error.message : null;
}

function isPolicyDenied(error: object | string) {
  return typeof error === "object" && "code" in error && error.code === POLICY_DENIED_CODE;
}

export function useSendTransaction(recipientAddress: string) {
  const { provider } = useEthersProvider();
  const { ethersSigner } = useParaEthersSigner();
  const { data: wallet } = useWallet();

  const [txHash, setTxHash] = useState<string | null>(null);
  const [status, setStatus] = useState<SendTransactionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDenied, setIsDenied] = useState(false);

  const send = useCallback(async () => {
    setStatus("signing");
    setError(null);
    setIsDenied(false);
    setTxHash(null);
    try {
      if (!ethersSigner || !wallet?.address) {
        throw new Error("Signer not ready. Connect your wallet first.");
      }

      const amountWei = ethers.parseEther(SEND_AMOUNT_ETH);
      const balanceWei = await provider.getBalance(wallet.address);
      const feeData = await provider.getFeeData();
      const gasLimit = BigInt(21000);
      const maxGasFee = gasLimit * (feeData.maxFeePerGas ?? BigInt(0));
      if (amountWei + maxGasFee > balanceWei) {
        throw new Error("Insufficient balance. Request faucet funds first, then retry.");
      }

      const tx: ethers.TransactionRequest = {
        to: recipientAddress,
        value: amountWei,
        nonce: await provider.getTransactionCount(wallet.address),
        gasLimit,
        maxFeePerGas: feeData.maxFeePerGas ?? undefined,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
        chainId: SEPOLIA.chainId,
      };

      const signedTransaction = await ethersSigner.signTransaction(tx);
      const txResponse = await provider.broadcastTransaction(signedTransaction);
      setTxHash(txResponse.hash);
      setStatus("submitted");

      const receipt = await txResponse.wait(1, CONFIRMATION_TIMEOUT_MS);
      if (!receipt) {
        throw new Error("Transaction was submitted but confirmation is taking longer than expected. Check the hash on Sepolia.");
      }
      if (receipt.status === 0) {
        throw new Error("Transaction was submitted but failed on-chain.");
      }
      setStatus("confirmed");
    } catch (sendError) {
      const reason = typeof sendError === "string" || (typeof sendError === "object" && sendError !== null) ? sendError : null;
      setStatus("failed");
      setIsDenied(reason !== null && isPolicyDenied(reason));
      setError((reason && readErrorMessage(reason)) || "Transaction failed.");
    }
  }, [ethersSigner, provider, recipientAddress, wallet?.address]);

  const reset = useCallback(() => {
    setTxHash(null);
    setError(null);
    setIsDenied(false);
    setStatus("idle");
  }, []);

  return {
    send,
    amount: SEND_AMOUNT_ETH,
    txHash,
    status,
    isPending: status === "signing" || status === "submitted",
    isReady: Boolean(ethersSigner && wallet?.address),
    error,
    isDenied,
    reset,
  };
}
