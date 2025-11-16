"use client";

import { useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useAccountAddress } from "@/hooks/useAccountAddress";
import { DEFAULT_CHAIN } from "@/config/chains";
import { IBC_TRANSFER_PORT, IBC_TRANSFER_CHANNEL } from "@/config/constants";
import { coins, MsgTransferEncodeObject } from "@cosmjs/stargate";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";

export default function IBCTransferPage() {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [destinationChannel, setDestinationChannel] = useState(IBC_TRANSFER_CHANNEL);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const account = useAccount();
  const { signingClient } = useParaSigner();
  const address = useAccountAddress();

  const sendIBCTransfer = async () => {
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setTxHash(null);

    try {
      if (!account?.isConnected || !address) {
        throw new Error("Please connect your wallet to send an IBC transfer.");
      }

      if (!signingClient) {
        throw new Error("Signing client not initialized. Please try reconnecting.");
      }

      if (!recipientAddress) {
        throw new Error("Please enter a recipient address.");
      }

      const amountInMinimalDenom = Math.floor(parseFloat(amount) * Math.pow(10, DEFAULT_CHAIN.coinDecimals));
      if (isNaN(amountInMinimalDenom) || amountInMinimalDenom <= 0) {
        throw new Error("Invalid amount. Please enter a valid positive number.");
      }

      setStatus({
        show: true,
        type: "info",
        message: "Please confirm the IBC transfer in your wallet...",
      });

      // Create timeout timestamp (1 hour from now) in nanoseconds
      const timeoutTimestamp = BigInt(Date.now() + 3600000) * BigInt(1000000);

      const transferMsg: MsgTransferEncodeObject = {
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: MsgTransfer.fromPartial({
          sourcePort: IBC_TRANSFER_PORT,
          sourceChannel: destinationChannel,
          token: coins(amountInMinimalDenom, DEFAULT_CHAIN.coinMinimalDenom)[0],
          sender: address,
          receiver: recipientAddress,
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
      setStatus({
        show: true,
        type: "success",
        message: `IBC transfer initiated! Gas used: ${result.gasUsed}`,
      });
    } catch (error) {
      console.error("Error sending IBC transfer:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to send IBC transfer. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">IBC Transfer Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transfer tokens across different Cosmos chains using the Inter-Blockchain Communication protocol.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200 bg-gray-50">
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">IBC Transfer Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Source Chain:</span>{" "}
                <span className="font-medium">{DEFAULT_CHAIN.chainName}</span>
              </div>
              <div>
                <span className="text-gray-600">Token:</span>{" "}
                <span className="font-medium">{DEFAULT_CHAIN.coinDenom}</span>
              </div>
              <div>
                <span className="text-gray-600">Timeout:</span>{" "}
                <span className="font-medium">1 hour</span>
              </div>
            </div>
          </div>
        </div>

        {status.show && (
          <div
            className={`mb-4 rounded-none border ${
              status.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : status.type === "error"
                ? "bg-red-50 border-red-500 text-red-700"
                : "bg-gray-50 border-gray-500 text-gray-700"
            }`}>
            <p className="px-6 py-4 break-words">{status.message}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-3">
            <label
              htmlFor="channel"
              className="block text-sm font-medium text-gray-700">
              IBC Channel
            </label>
            <input
              type="text"
              id="channel"
              value={destinationChannel}
              onChange={(e) => setDestinationChannel(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none"
              placeholder="channel-0"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="recipient"
              className="block text-sm font-medium text-gray-700">
              Recipient Address (on destination chain)
            </label>
            <input
              type="text"
              id="recipient"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none"
              placeholder="osmo1... or juno1..."
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700">
              Amount ({DEFAULT_CHAIN.coinDenom})
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none"
              placeholder="0.1"
              step="0.000001"
              min="0"
            />
          </div>

          <button
            onClick={sendIBCTransfer}
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !account?.isConnected || !recipientAddress || !amount || !destinationChannel}>
            {isLoading ? "Sending IBC Transfer..." : "Send IBC Transfer"}
          </button>

          {txHash && (
            <div className="mt-8 rounded-none border border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Transaction Details:</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Transaction Hash:</p>
                    <p className="text-sm font-mono bg-white p-4 border border-gray-200 break-all">
                      {txHash}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Note:</p>
                    <p className="text-sm text-gray-600">
                      IBC transfers may take a few minutes to complete. You can track the packet relay status on the respective chain explorers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}