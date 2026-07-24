"use client";

import { useState, useCallback } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { isValidSuiAddress, MIST_PER_SUI } from "@mysten/sui/utils";
import { useParaSuiSignTransaction } from "@getpara/react-sdk-lite/chains/sui";
import { useParaSigner } from "./useParaSigner";

export function useSuiTransfer() {
  const { signer, client, isReady, address } = useParaSigner();
  // The Para mutation hook wraps signer.signTransaction (intent-wrap + blake2b + serialize).
  const { signTransactionAsync } = useParaSuiSignTransaction(signer);

  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "confirming" | "success" | "error">("idle");

  const reset = useCallback(() => {
    setTxDigest(null);
    setError(null);
    setStatus("idle");
  }, []);

  const transfer = useCallback(
    async (destination: string, amount: string) => {
      if (!signer || !address || !isReady) {
        setError(new Error("Signer not ready"));
        return;
      }

      setIsLoading(true);
      setError(null);
      setTxDigest(null);
      setStatus("pending");

      try {
        if (!isValidSuiAddress(destination)) {
          throw new Error("Invalid recipient Sui address format");
        }

        const amountFloat = Number.parseFloat(amount);
        if (Number.isNaN(amountFloat) || amountFloat <= 0) {
          throw new Error("Please enter a valid amount greater than 0");
        }
        const amountMist = BigInt(Math.round(amountFloat * Number(MIST_PER_SUI)));

        // Split `amountMist` off the gas coin and send it to the recipient.
        const tx = new Transaction();
        tx.setSender(address);
        const [coin] = tx.splitCoins(tx.gas, [amountMist]);
        tx.transferObjects([coin], destination);

        // Building resolves gas coins via the client, so the wallet must hold some Testnet SUI.
        const bytes = await tx.build({ client });

        setStatus("confirming");
        const { signature } = await signTransactionAsync(bytes);

        const result = await client.executeTransaction({ transaction: bytes, signatures: [signature] });
        const digest =
          result.$kind === "Transaction" ? result.Transaction.digest : result.FailedTransaction.digest;
        if (result.$kind !== "Transaction") {
          throw new Error(`Transaction failed to execute (digest ${digest})`);
        }

        setTxDigest(digest);
        setStatus("success");
      } catch (err) {
        console.error("Error sending transaction:", err);
        setError(err instanceof Error ? err : new Error("Failed to send transaction"));
        setStatus("error");
      } finally {
        setIsLoading(false);
      }
    },
    [signer, client, address, isReady, signTransactionAsync]
  );

  return { transfer, txDigest, isLoading, error, isReady, status, reset };
}
