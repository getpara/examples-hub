import { useState, useCallback } from "react";
import { coin, type MsgTransferEncodeObject } from "@cosmjs/stargate";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import { useParaSigner } from "@/hooks/useParaSigner";
import { IBC_TRANSFER, ICS_PROVIDER_TESTNET, toMinimalDenom } from "@/lib/chain";

export function useIbcTransfer() {
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { signingClient, address } = useParaSigner();

  const sendIbcTransfer = useCallback(
    async (recipient: string, amount: string, channel: string) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        if (!address) {
          throw new Error("Please connect your wallet to send an IBC transfer.");
        }

        if (!signingClient) {
          throw new Error("Signing client not initialized. Please try reconnecting.");
        }

        if (!recipient) {
          throw new Error("Please enter a recipient address.");
        }

        const amountInMinimalDenom = toMinimalDenom(amount);
        if (isNaN(amountInMinimalDenom) || amountInMinimalDenom <= 0) {
          throw new Error("Invalid amount. Please enter a valid positive number.");
        }

        const timeoutTimestamp = BigInt(Date.now() + IBC_TRANSFER.timeoutMs) * BigInt(1000000);

        const transferMsg: MsgTransferEncodeObject = {
          typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
          value: MsgTransfer.fromPartial({
            sourcePort: IBC_TRANSFER.port,
            sourceChannel: channel,
            token: coin(amountInMinimalDenom, ICS_PROVIDER_TESTNET.denom),
            sender: address,
            receiver: recipient,
            timeoutHeight: undefined,
            timeoutTimestamp,
          }),
        };

        const result = await signingClient.signAndBroadcast(
          address,
          [transferMsg],
          "auto",
          "IBC Transfer via Para + CosmJS"
        );

        setTxHash(result.transactionHash);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to send IBC transfer");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [signingClient, address]
  );

  const reset = useCallback(() => {
    setTxHash(null);
    setError(null);
  }, []);

  return {
    sendIbcTransfer,
    txHash,
    isLoading,
    isReady: !!signingClient && !!address,
    error,
    reset,
  };
}
