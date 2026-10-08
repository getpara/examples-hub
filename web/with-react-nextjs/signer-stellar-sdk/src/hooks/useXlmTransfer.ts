import { useState, useCallback } from "react";
import { TransactionBuilder, Operation, Asset, Networks, StrKey } from "@stellar/stellar-sdk";
import { horizon } from "@/lib/horizon";
import { useParaSigner } from "@/hooks/useParaSigner";

export function useXlmTransfer() {
  const { signer, isReady, address } = useParaSigner();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setTxHash(null);
    setError(null);
  }, []);

  const transfer = useCallback(
    async (destination: string, amount: string) => {
      if (!signer || !address || !isReady) {
        setError(new Error("Signer not ready"));
        return;
      }

      setIsLoading(true);
      setIsSubmitting(false);
      setError(null);
      setTxHash(null);

      try {
        if (!StrKey.isValidEd25519PublicKey(destination)) {
          throw new Error("Invalid recipient Stellar address format");
        }

        const amountFloat = Number.parseFloat(amount);
        if (Number.isNaN(amountFloat) || amountFloat <= 0) {
          throw new Error("Please enter a valid amount greater than 0");
        }

        const account = await horizon.loadAccount(address);

        const tx = new TransactionBuilder(account, {
          fee: "100",
          networkPassphrase: Networks.TESTNET,
        })
          .addOperation(
            Operation.payment({
              destination,
              asset: Asset.native(),
              amount: amountFloat.toFixed(7).replace(/0+$/, "").replace(/\.$/, ""),
            })
          )
          .setTimeout(30)
          .build();

        const { signedTxXdr } = await signer.signTransaction(tx.toXDR());
        const signedTx = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
        setIsSubmitting(true);
        const result = await horizon.submitTransaction(signedTx);
        setTxHash(result.hash);
      } catch (err) {
        console.error("Error sending transaction:", err);
        setError(err instanceof Error ? err : new Error("Failed to send transaction"));
      } finally {
        setIsLoading(false);
        setIsSubmitting(false);
      }
    },
    [signer, address, isReady]
  );

  return { transfer, txHash, isLoading, isSubmitting, error, isReady, reset };
}
