"use client";

import { useState, useCallback } from "react";
import { TransactionBuilder, Operation, Asset, Networks, StrKey } from "@stellar/stellar-sdk";
import { useParaSigner } from "./useParaSigner";

export function useXlmTransfer() {
  const { signer, server, isReady, address } = useParaSigner();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "confirming" | "success" | "error">("idle");

  const transfer = useCallback(
    async (destination: string, amount: string) => {
      if (!signer || !server || !address || !isReady) {
        setError(new Error("Signer not ready"));
        return;
      }

      setIsLoading(true);
      setError(null);
      setTxHash(null);
      setStatus("pending");

      try {
        if (!StrKey.isValidEd25519PublicKey(destination)) {
          throw new Error("Invalid recipient Stellar address format");
        }

        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat) || amountFloat <= 0) {
          throw new Error("Please enter a valid amount greater than 0");
        }

        const account = await server.loadAccount(address);

        const tx = new TransactionBuilder(account, {
          fee: "100",
          networkPassphrase: Networks.TESTNET,
        })
          .addOperation(
            Operation.payment({
              destination,
              asset: Asset.native(),
              amount: amountFloat.toString(),
            })
          )
          .setTimeout(30)
          .build();

        setStatus("confirming");
        const { signedTxXdr } = await signer.signTransaction(tx.toXDR());
        const signedTx = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
        const result = await server.submitTransaction(signedTx);
        setTxHash(result.hash);
        setStatus("success");
      } catch (err) {
        console.error("Error sending transaction:", err);
        setError(err instanceof Error ? err : new Error("Failed to send transaction"));
        setStatus("error");
      } finally {
        setIsLoading(false);
      }
    },
    [signer, server, address, isReady]
  );

  return { transfer, txHash, isLoading, error, isReady, status };
}
