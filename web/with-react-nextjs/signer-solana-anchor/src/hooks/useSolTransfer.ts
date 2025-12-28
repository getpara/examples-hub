"use client";

import { useState, useCallback } from "react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useParaSigner } from "./useParaSigner";

export function useSolTransfer() {
  const { connection, anchorProvider, address, isReady } = useParaSigner();

  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const constructTransaction = useCallback(
    async (toAddress: string, solAmount: string): Promise<Transaction> => {
      if (!address || !connection || !anchorProvider) {
        throw new Error("No sender address or connection available");
      }

      const fromPubKey = anchorProvider.wallet.publicKey;
      const toPubKey = new PublicKey(toAddress);
      const amountLamports = parseFloat(solAmount) * LAMPORTS_PER_SOL;

      const transaction = new Transaction();

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: fromPubKey,
          toPubkey: toPubKey,
          lamports: BigInt(amountLamports),
        })
      );

      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = fromPubKey;

      return transaction;
    },
    [address, connection, anchorProvider]
  );

  const validateTransaction = useCallback(
    async (toAddress: string, solAmount: string): Promise<void> => {
      if (!address || !connection || !anchorProvider) {
        throw new Error("No sender address or provider available");
      }

      // Validate address format
      if (!PublicKey.isOnCurve(toAddress)) {
        throw new Error("Invalid recipient address format.");
      }

      // Validate amount
      const amountFloat = parseFloat(solAmount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        throw new Error("Please enter a valid amount greater than 0.");
      }

      // Check balance
      const balanceLamports = await connection.getBalance(anchorProvider.wallet.publicKey);
      const transaction = await constructTransaction(toAddress, solAmount);
      const estimatedGas = await transaction.getEstimatedFee(connection);

      if (estimatedGas === null) {
        throw new Error("Failed to estimate transaction fee");
      }

      const totalCost = parseFloat(solAmount) * LAMPORTS_PER_SOL + estimatedGas;

      if (totalCost > balanceLamports) {
        const requiredSol = (totalCost / LAMPORTS_PER_SOL).toFixed(4);
        const availableSol = (balanceLamports / LAMPORTS_PER_SOL).toFixed(4);
        throw new Error(
          `Insufficient balance. Transaction requires approximately ${requiredSol} SOL, but you have only ${availableSol} SOL available.`
        );
      }
    },
    [address, connection, anchorProvider, constructTransaction]
  );

  const sendTransaction = useCallback(
    async (to: string, amount: string) => {
      if (!anchorProvider) {
        setError(new Error("Anchor provider not initialized. Please connect your wallet."));
        return;
      }

      setIsLoading(true);
      setError(null);
      setTxSignature(null);

      try {
        await validateTransaction(to, amount);

        const tx = await constructTransaction(to, amount);

        if (!anchorProvider.sendAndConfirm) {
          throw new Error("sendAndConfirm method not available on anchor provider");
        }

        const txResponse = await anchorProvider.sendAndConfirm(
          tx as unknown as Parameters<typeof anchorProvider.sendAndConfirm>[0]
        );

        setTxSignature(txResponse);
      } catch (err) {
        console.error("Error sending transaction:", err);
        setError(err instanceof Error ? err : new Error("Failed to send transaction"));
      } finally {
        setIsLoading(false);
      }
    },
    [anchorProvider, validateTransaction, constructTransaction]
  );

  const reset = useCallback(() => {
    setTxSignature(null);
    setError(null);
  }, []);

  return {
    sendTransaction,
    txSignature,
    isLoading,
    isReady,
    error,
    reset,
  };
}
