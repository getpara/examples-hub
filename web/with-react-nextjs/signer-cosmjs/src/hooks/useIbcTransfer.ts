"use client";

import { useState, useCallback } from "react";
import { coins, MsgTransferEncodeObject } from "@cosmjs/stargate";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import { useParaSigner } from "./useParaSigner";
import { DEFAULT_CHAIN } from "@/config/chains";
import { IBC_TRANSFER_PORT } from "@/config/constants";

export function useIbcTransfer() {
  const [txHash, setTxHash] = useState<string | null>(null);
  const [gasUsed, setGasUsed] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { signingClient, address, isLoading: isSignerLoading } = useParaSigner();

  const sendIbcTransfer = useCallback(
    async (recipient: string, amount: string, channel: string) => {
      if (!address) {
        throw new Error("Please connect your wallet to send an IBC transfer.");
      }

      if (!signingClient) {
        throw new Error("Signing client not initialized. Please try reconnecting.");
      }

      if (!recipient) {
        throw new Error("Please enter a recipient address.");
      }

      const amountInMinimalDenom = Math.floor(
        parseFloat(amount) * Math.pow(10, DEFAULT_CHAIN.coinDecimals)
      );
      if (isNaN(amountInMinimalDenom) || amountInMinimalDenom <= 0) {
        throw new Error("Invalid amount. Please enter a valid positive number.");
      }

      setIsLoading(true);
      setError(null);
      setTxHash(null);
      setGasUsed(null);

      try {
        // Create timeout timestamp (1 hour from now) in nanoseconds
        const timeoutTimestamp = BigInt(Date.now() + 3600000) * BigInt(1000000);

        const transferMsg: MsgTransferEncodeObject = {
          typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
          value: MsgTransfer.fromPartial({
            sourcePort: IBC_TRANSFER_PORT,
            sourceChannel: channel,
            token: coins(amountInMinimalDenom, DEFAULT_CHAIN.coinMinimalDenom)[0],
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
        setGasUsed(result.gasUsed);
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
    setGasUsed(null);
    setError(null);
  }, []);

  return {
    sendIbcTransfer,
    txHash,
    gasUsed,
    isLoading: isLoading || isSignerLoading,
    isReady: !!signingClient && !!address,
    error,
    reset,
  };
}
