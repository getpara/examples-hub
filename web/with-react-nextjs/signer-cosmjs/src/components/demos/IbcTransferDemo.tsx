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
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">IBC Transfer Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Transfer tokens across different Cosmos chains using the Inter-Blockchain Communication
          protocol.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        {/* IBC Info */}
        <div className="mb-8 rounded-2xl border border-border bg-muted/60">
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-card-foreground mb-3">IBC Transfer Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Source Chain:</span>{" "}
                <span className="font-medium">{DEFAULT_CHAIN.chainName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Token:</span>{" "}
                <span className="font-medium">{DEFAULT_CHAIN.coinDenom}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Timeout:</span>{" "}
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
            <label htmlFor="channel" className="block text-sm font-medium text-foreground">
              IBC Channel
            </label>
            <input
              type="text"
              id="channel"
              value={destinationChannel}
              onChange={(e) => setDestinationChannel(e.target.value)}
              className="field-control"
              placeholder="channel-0"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="recipient" className="block text-sm font-medium text-foreground">
              Recipient Address (on destination chain)
            </label>
            <input
              type="text"
              id="recipient"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="field-control"
              placeholder="osmo1... or juno1..."
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="amount" className="block text-sm font-medium text-foreground">
              Amount ({DEFAULT_CHAIN.coinDenom})
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="field-control"
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
            <div className="mt-8 rounded-2xl border border-border bg-card">
              <div className="px-6 py-4 border-b border-border/60 bg-muted/60">
                <h3 className="text-sm font-medium text-card-foreground">Transaction Details:</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Transaction Hash:</p>
                    <p className="break-all rounded-xl bg-muted/60 px-4 py-3 font-mono text-xs leading-relaxed text-muted-foreground">
                      {txHash}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Note:</p>
                    <p className="text-sm text-muted-foreground">
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
