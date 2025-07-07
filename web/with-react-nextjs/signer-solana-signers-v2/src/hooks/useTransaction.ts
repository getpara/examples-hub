import { useState, useCallback } from "react";
import { Address } from "@solana/addresses";
import { Signature } from "@solana/kit";
import { useParaSigner } from "./useParaSigner";
import { 
  constructSolTransferTransaction, 
  signAndSendTransaction, 
  waitForConfirmation,
  estimateTransactionFee
} from "@/utils/transaction";
import { validateSolanaAddress, validateSolAmount } from "@/utils/validation";
import { TRANSACTION_TIMEOUT_MS } from "@/config/constants";

export type TransactionStatus = 
  | "idle"
  | "validating"
  | "building"
  | "signing"
  | "sending"
  | "confirming"
  | "confirmed"
  | "error";

export interface TransactionError {
  code: string;
  message: string;
  details?: any;
}

export interface UseTransactionReturn {
  status: TransactionStatus;
  error: TransactionError | null;
  signature: string | null;
  estimatedFee: bigint | null;
  sendTransaction: (to: string, amount: string) => Promise<void>;
  reset: () => void;
}

export function useTransaction(): UseTransactionReturn {
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [error, setError] = useState<TransactionError | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [estimatedFee, setEstimatedFee] = useState<bigint | null>(null);
  
  const { signer, rpc } = useParaSigner();

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setSignature(null);
    setEstimatedFee(null);
  }, []);

  const sendTransaction = useCallback(async (to: string, amount: string) => {
    if (!signer || !rpc) {
      setError({ 
        code: "NO_SIGNER", 
        message: "Wallet not connected" 
      });
      return;
    }

    try {
      // Reset state
      setError(null);
      setSignature(null);
      
      // Validate inputs
      setStatus("validating");
      const addressValidation = validateSolanaAddress(to);
      if (!addressValidation.isValid) {
        throw { 
          code: "INVALID_ADDRESS", 
          message: addressValidation.error || "Invalid address" 
        };
      }

      const amountValidation = validateSolAmount(amount);
      if (!amountValidation.isValid) {
        throw { 
          code: "INVALID_AMOUNT", 
          message: amountValidation.error || "Invalid amount" 
        };
      }

      // Build transaction
      setStatus("building");
      const transaction = await constructSolTransferTransaction(
        signer,
        to as Address,
        amount,
        rpc
      );

      console.log("Built transaction:", {
        messageBytes: transaction.messageBytes?.length,
        signaturesCount: Object.keys(transaction.signatures || {}).length
      });

      // Estimate fee
      try {
        const fee = await estimateTransactionFee(transaction, rpc);
        setEstimatedFee(fee);
      } catch (feeError) {
        console.warn("Fee estimation failed:", feeError);
        // Continue even if fee estimation fails
        setEstimatedFee(BigInt(5000));
      }

      // Sign and send
      setStatus("signing");
      const sig = await signAndSendTransaction(transaction, signer, rpc);
      setSignature(sig as string);
      
      // Wait for confirmation
      setStatus("confirming");
      await waitForConfirmation(sig, rpc, TRANSACTION_TIMEOUT_MS);
      
      setStatus("confirmed");
    } catch (err: any) {
      setStatus("error");
      
      // Handle specific error types
      if (err.code) {
        setError(err);
      } else if (err.message?.includes("Insufficient balance")) {
        setError({ 
          code: "INSUFFICIENT_BALANCE", 
          message: err.message 
        });
      } else if (err.message?.includes("timeout")) {
        setError({ 
          code: "TIMEOUT", 
          message: "Transaction confirmation timeout" 
        });
      } else if (err.message?.includes("Network")) {
        setError({ 
          code: "NETWORK_ERROR", 
          message: "Network connection error. Please try again." 
        });
      } else {
        setError({ 
          code: "UNKNOWN", 
          message: err.message || "Transaction failed", 
          details: err 
        });
      }
    }
  }, [signer, rpc]);

  return {
    status,
    error,
    signature,
    estimatedFee,
    sendTransaction,
    reset
  };
}