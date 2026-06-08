"use client";

import { useCallback, useState } from "react";
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
        setError(new Error("Signer not ready. Please connect your wallet."));
        return;
      }

      setIsLoading(true);
      setError(null);
      setTxSignature(null);
      setStatus("pending");

      try {
        let toPubKey: PublicKey;
        try {
          toPubKey = new PublicKey(to);
        } catch {
          throw new Error("Invalid recipient address format.");
        }

        if (!PublicKey.isOnCurve(toPubKey)) {
          throw new Error("Invalid recipient address format.");
        }

        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat) || amountFloat <= 0) {
          throw new Error("Please enter a valid amount greater than 0.");
        }

        const balanceLamports = await connection.getBalance(signer.sender);
        const amountLamports = Math.floor(amountFloat * LAMPORTS_PER_SOL);

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
          throw new Error("Failed to estimate transaction fee.");
        }

        const totalCost = amountLamports + estimatedFee;
        if (totalCost > balanceLamports) {
          const requiredSol = (totalCost / LAMPORTS_PER_SOL).toFixed(4);
          const availableSol = (balanceLamports / LAMPORTS_PER_SOL).toFixed(4);
          throw new Error(
            `Insufficient balance. Transaction requires approximately ${requiredSol} SOL, but you have only ${availableSol} SOL available.`
          );
        }

        const signature = await signer.sendTransaction(tx);
        setTxSignature(signature);
        setStatus("confirming");

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
          await new Promise((resolve) => setTimeout(resolve, 500));
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
