"use client";

import { useState, useCallback } from "react";
import { Address } from "@solana/addresses";
import {
  createTransactionMessage,
  appendTransactionMessageInstruction,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  pipe,
  lamports,
  Signature,
} from "@solana/kit";
import { compileTransaction, getBase64EncodedWireTransaction } from "@solana/transactions";
import { getTransferSolInstruction } from "@solana-program/system";
import { useParaSigner } from "./useParaSigner";

const LAMPORTS_PER_SOL = BigInt(1000000000);

export function useSolTransfer() {
  const { signer, rpc, isReady } = useParaSigner();

  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendTransaction = useCallback(
    async (to: string, amount: string) => {
      if (!signer || !rpc || !isReady) {
        setError(new Error("Signer not initialized. Please connect your wallet."));
        return;
      }

      if (!to || to.length < 32) {
        setError(new Error("Invalid recipient address format."));
        return;
      }

      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        setError(new Error("Please enter a valid amount greater than 0."));
        return;
      }

      setIsLoading(true);
      setError(null);
      setTxSignature(null);

      try {
        // Validate balance
        const balanceResponse = await rpc.getBalance(signer.address).send();
        const balanceLamports = balanceResponse.value;
        const amountLamports = parseFloat(amount) * Number(LAMPORTS_PER_SOL);
        const estimatedFee = 5000;
        const totalCost = amountLamports + estimatedFee;

        if (totalCost > Number(balanceLamports)) {
          const requiredSol = (totalCost / Number(LAMPORTS_PER_SOL)).toFixed(4);
          const availableSol = (Number(balanceLamports) / Number(LAMPORTS_PER_SOL)).toFixed(4);
          throw new Error(
            `Insufficient balance. Transaction requires approximately ${requiredSol} SOL, but you have only ${availableSol} SOL available.`
          );
        }

        // Construct transaction
        const response = await rpc.getLatestBlockhash().send();
        const { blockhash, lastValidBlockHeight } = response.value;

        const transferInstruction = getTransferSolInstruction({
          source: signer,
          destination: to as Address,
          amount: lamports(BigInt(Math.floor(amountFloat * Number(LAMPORTS_PER_SOL)))),
        });

        const transactionMessage = pipe(
          createTransactionMessage({ version: "legacy" }),
          (tx) => setTransactionMessageFeePayer(signer.address, tx),
          (tx) => setTransactionMessageLifetimeUsingBlockhash({ blockhash, lastValidBlockHeight }, tx),
          (tx) => appendTransactionMessageInstruction(transferInstruction, tx)
        );

        const tx = compileTransaction(transactionMessage);

        // Sign and send
        const signedTxs = await signer.modifyAndSignTransactions([tx]);
        const signedTx = signedTxs[0];
        const serializedTx = getBase64EncodedWireTransaction(signedTx);

        const txResponse = await rpc
          .sendTransaction(serializedTx, {
            encoding: "base64",
            skipPreflight: false,
            preflightCommitment: "processed",
          })
          .send();

        setTxSignature(txResponse as string);

        // Wait for confirmation
        let confirmed = false;
        while (!confirmed) {
          const signature = txResponse as unknown as Signature;
          const receipt = await rpc
            .getSignatureStatuses([signature], {
              searchTransactionHistory: true,
            })
            .send();

          if (
            receipt?.value?.[0]?.confirmationStatus === "confirmed" ||
            receipt?.value?.[0]?.confirmationStatus === "finalized"
          ) {
            confirmed = true;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (err) {
        console.error("Error sending transaction:", err);
        setError(err instanceof Error ? err : new Error("Failed to send transaction. Please try again."));
      } finally {
        setIsLoading(false);
      }
    },
    [signer, rpc, isReady]
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
