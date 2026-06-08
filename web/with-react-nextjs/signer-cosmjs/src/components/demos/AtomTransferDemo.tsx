"use client";

import { useState } from "react";
import { useBalance } from "@/hooks/useBalance";
import { useAtomTransfer } from "@/hooks/useAtomTransfer";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { ActionButton } from "@/components/ui/ActionButton";

export default function AtomTransferPage() {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");

  const { balance, isLoading: isBalanceLoading, refetch, address, denom } = useBalance();
  const { sendTokens, txHash, gasUsed, isLoading, isReady, error, reset } = useAtomTransfer();

  const handleSend = async () => {
    reset();
    await sendTokens(recipientAddress, amount);
    await refetch();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">ATOM Transfer Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Send ATOM tokens from your wallet to another Cosmos address. This demonstrates basic
          token transfers on the Cosmos network.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        {/* Balance Display */}
        <div className="mb-8 rounded-2xl border border-border bg-card">
          <div className="flex justify-between items-center px-6 py-3 border-b border-border/60 bg-muted/60">
            <h3 className="text-sm font-medium text-card-foreground">Your Balance:</h3>
            <button
              type="button"
              onClick={refetch}
              disabled={isBalanceLoading || !address}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>
                &#8635;
              </span>
            </button>
          </div>
          <div className="px-6 py-3">
            <p className="text-lg font-medium text-card-foreground">
              {!address
                ? "Connect wallet"
                : isBalanceLoading
                  ? "Loading..."
                  : balance
                    ? `${balance} ${denom}`
                    : "N/A"}
            </p>
            {address && <p className="text-xs text-muted-foreground mt-1">Address: {address}</p>}
          </div>
        </div>

        {error && <StatusAlert type="error" message={error.message} />}
        {txHash && (
          <StatusAlert type="success" message={`Transaction successful! Gas used: ${gasUsed}`} />
        )}

        <div className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="recipient" className="block text-sm font-medium text-foreground">
              Recipient Address
            </label>
            <input
              type="text"
              id="recipient"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="field-control"
              placeholder="cosmos1..."
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="amount" className="block text-sm font-medium text-foreground">
              Amount ({denom})
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
            disabled={!isReady || !recipientAddress || !amount}
            loadingText="Sending Transaction...">
            Send ATOM
          </ActionButton>

          {txHash && <TxResult hash={txHash} />}
        </div>
      </div>
    </div>
  );
}
