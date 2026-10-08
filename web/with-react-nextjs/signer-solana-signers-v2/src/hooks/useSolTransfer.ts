import { useState, useCallback } from "react";
import { Address } from "@solana/addresses";
import {
  createTransactionMessage,
  appendTransactionMessageInstruction,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  pipe,
  lamports,
} from "@solana/kit";
import { getBase64EncodedWireTransaction } from "@solana/transactions";
import { signTransactionMessageWithSigners } from "@solana/signers";
import { getTransferSolInstruction } from "@solana-program/system";
import { useParaSigner } from "@/hooks/useParaSigner";

const LAMPORTS_PER_SOL = 1_000_000_000;
const ESTIMATED_FEE_LAMPORTS = 5000;

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
        const balanceResponse = await rpc.getBalance(signer.address).send();
        const balanceLamports = Number(balanceResponse.value);
        const totalCost = amountFloat * LAMPORTS_PER_SOL + ESTIMATED_FEE_LAMPORTS;

        if (totalCost > balanceLamports) {
          const requiredSol = (totalCost / LAMPORTS_PER_SOL).toFixed(4);
          const availableSol = (balanceLamports / LAMPORTS_PER_SOL).toFixed(4);
          throw new Error(
            `Insufficient balance. Transaction requires approximately ${requiredSol} SOL, but you have only ${availableSol} SOL available.`
          );
        }

        const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

        const transferInstruction = getTransferSolInstruction({
          source: signer,
          destination: to as Address,
          amount: lamports(BigInt(Math.floor(amountFloat * LAMPORTS_PER_SOL))),
        });

        const transactionMessage = pipe(
          createTransactionMessage({ version: "legacy" }),
          (tx) => setTransactionMessageFeePayer(signer.address, tx),
          (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
          (tx) => appendTransactionMessageInstruction(transferInstruction, tx)
        );

        const signedTx = await signTransactionMessageWithSigners(transactionMessage);

        const signature = await rpc
          .sendTransaction(getBase64EncodedWireTransaction(signedTx), {
            encoding: "base64",
            skipPreflight: false,
            preflightCommitment: "processed",
          })
          .send();

        setTxSignature(signature);

        for (;;) {
          const receipt = await rpc.getSignatureStatuses([signature], { searchTransactionHistory: true }).send();
          const status = receipt?.value?.[0];

          if (status?.err) {
            throw new Error("Transaction failed on chain.");
          }

          if (status?.confirmationStatus === "confirmed" || status?.confirmationStatus === "finalized") {
            break;
          }

          if ((await rpc.getBlockHeight().send()) > latestBlockhash.lastValidBlockHeight) {
            throw new Error("Transaction expired before it was confirmed.");
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
