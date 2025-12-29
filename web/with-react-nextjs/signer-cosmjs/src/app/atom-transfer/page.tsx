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
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">ATOM Transfer Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Send ATOM tokens from your wallet to another Cosmos address. This demonstrates basic
          token transfers on the Cosmos network.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Balance Display */}
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Your Balance:</h3>
            <button
              onClick={refetch}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>
                &#8635;
              </span>
            </button>
          </div>
          <div className="px-6 py-3">
            <p className="text-lg font-medium text-gray-900">
              {!address
                ? "Connect wallet"
                : isBalanceLoading
                  ? "Loading..."
                  : balance
                    ? `${balance} ${denom}`
                    : "N/A"}
            </p>
            {address && <p className="text-xs text-gray-500 mt-1">Address: {address}</p>}
          </div>
        </div>

        {error && <StatusAlert type="error" message={error.message} />}
        {txHash && (
          <StatusAlert type="success" message={`Transaction successful! Gas used: ${gasUsed}`} />
        )}

        <div className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
              Recipient Address
            </label>
            <input
              type="text"
              id="recipient"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none"
              placeholder="cosmos1..."
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount ({denom})
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
