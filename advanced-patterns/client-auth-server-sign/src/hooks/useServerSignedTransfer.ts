import { useCallback, useState } from "react";
import { useEthersProvider } from "@/hooks/useEthersProvider";
import { useSessionExport } from "@/hooks/useSessionExport";
import { requestServerSignature, type ServerSignedTransaction } from "@/lib/signingApi";
import { buildTransferTransaction, serializeTransaction, validateTransferInput } from "@/lib/transaction";

export type TransferPhase = "idle" | "signing" | "confirming";

export function useServerSignedTransfer(from: string) {
  const { provider } = useEthersProvider();
  const { exportSession, isReady: isSessionReady } = useSessionExport();
  const [phase, setPhase] = useState<TransferPhase>("idle");
  const [result, setResult] = useState<ServerSignedTransaction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const send = useCallback(
    async (to: string, amount: string) => {
      setPhase("signing");
      setResult(null);
      setErrorMessage(null);

      try {
        validateTransferInput(to, amount);

        const transaction = await buildTransferTransaction(provider, from, to, amount);
        const serializedSession = await exportSession();
        const signed = await requestServerSignature({
          session: serializedSession,
          transaction: serializeTransaction(transaction),
        });

        setResult(signed);
        setPhase("confirming");
        await provider.waitForTransaction(signed.transactionHash, 1);

        return signed;
      } catch (error) {
        const failure = error instanceof Error ? error : new Error("Failed to send transaction");
        setErrorMessage(failure.message);
        throw failure;
      } finally {
        setPhase("idle");
      }
    },
    [exportSession, from, provider]
  );

  return {
    send,
    phase,
    isPending: phase !== "idle",
    isReady: Boolean(from) && isSessionReady,
    result,
    errorMessage,
  };
}
