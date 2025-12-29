"use client";

import { useState } from "react";
import { useIbcTransfer } from "@/hooks/useIbcTransfer";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { ActionButton } from "@/components/ui/ActionButton";
import { DEFAULT_CHAIN } from "@/config/chains";
import { IBC_TRANSFER_CHANNEL } from "@/config/constants";

export default function IBCTransferPage() {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [destinationChannel, setDestinationChannel] = useState(IBC_TRANSFER_CHANNEL);

  const { sendIbcTransfer, txHash, gasUsed, isLoading, isReady, error, reset } = useIbcTransfer();

  const handleSend = async () => {
    reset();
    await sendIbcTransfer(recipientAddress, amount, destinationChannel);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">IBC Transfer Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transfer tokens across different Cosmos chains using the Inter-Blockchain Communication
          protocol.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {/* IBC Info */}
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

        {error && <StatusAlert type="error" message={error.message} />}
        {txHash && (
          <StatusAlert
            type="success"
            message={`IBC transfer initiated! Gas used: ${gasUsed}`}
          />
        )}

        <div className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="channel" className="block text-sm font-medium text-gray-700">
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
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
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
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
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

          <ActionButton
            onClick={handleSend}
            isLoading={isLoading}
            disabled={!isReady || !recipientAddress || !amount || !destinationChannel}
            loadingText="Sending IBC Transfer...">
            Send IBC Transfer
          </ActionButton>

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
                      IBC transfers may take a few minutes to complete. You can track the packet
                      relay status on the respective chain explorers.
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
