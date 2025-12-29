"use client";

import { useState, useCallback } from "react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useParaSigner } from "./useParaSigner";

export function useSolTransfer() {
  const { signer, connection, isReady } = useParaSigner();
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "confirming" | "success" | "error">("idle");

  const transfer = useCallback(
    async (to: string, amount: string) => {
      if (!signer?.sender || !connection || !isReady) {
        setError(new Error("Signer not ready"));
        return;
      }

      setIsLoading(true);
      setError(null);
      setTxSignature(null);
      setStatus("pending");

      try {
        // Validate recipient address
        if (!PublicKey.isOnCurve(to)) {
          throw new Error("Invalid recipient address format");
        }

        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat) || amountFloat <= 0) {
          throw new Error("Please enter a valid amount greater than 0");
        }

        // Check balance
        const balanceLamports = await connection.getBalance(signer.sender);
        const toPubKey = new PublicKey(to);
        const amountLamports = amountFloat * LAMPORTS_PER_SOL;

        // Build transaction to estimate fee
        const tx = new Transaction();
        tx.add(
          SystemProgram.transfer({
            fromPubkey: signer.sender,
            toPubkey: toPubKey,
            lamports: BigInt(amountLamports),
          })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = signer.sender;

        const estimatedFee = await tx.getEstimatedFee(connection);
        if (estimatedFee === null) {
          throw new Error("Failed to estimate transaction fee");
        }

        const totalCost = amountLamports + estimatedFee;
        if (totalCost > balanceLamports) {
          const requiredSol = (totalCost / LAMPORTS_PER_SOL).toFixed(4);
          const availableSol = (balanceLamports / LAMPORTS_PER_SOL).toFixed(4);
          throw new Error(
            `Insufficient balance. Transaction requires approximately ${requiredSol} SOL, but you have only ${availableSol} SOL available.`
          );
        }

        // Send transaction
        const signature = await signer.sendTransaction(tx);
        setTxSignature(signature);
        setStatus("confirming");

        // Wait for confirmation
        let confirmed = false;
        while (!confirmed) {
          const statusResult = await connection.getSignatureStatus(signature, {
            searchTransactionHistory: true,
          });
          if (
            statusResult?.value?.confirmationStatus === "confirmed" ||
            statusResult?.value?.confirmationStatus === "finalized"
          ) {
            confirmed = true;
          }
          await new Promise((r) => setTimeout(r, 500));
        }

        setStatus("success");
      } catch (err) {
        console.error("Error sending transaction:", err);
        setError(err instanceof Error ? err : new Error("Failed to send transaction"));
        setStatus("error");
      } finally {
        setIsLoading(false);
      }
    },
    [signer, connection, isReady]
  );

  const reset = useCallback(() => {
    setTxSignature(null);
    setError(null);
    setStatus("idle");
  }, []);

  return {
    transfer,
    txSignature,
    isLoading,
    error,
    isReady,
    status,
    reset,
  };
}
