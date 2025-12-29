"use client";

import { useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { ActionButton } from "@/components/ui/ActionButton";
import { useBalance } from "@/hooks/useBalance";
import { useSolTransfer } from "@/hooks/useSolTransfer";

export default function SolTransferPage() {
  const [to, setTo] = useState("devwuNsNYACyiEYxRNqMNseBpNnGfnd4ZwNHL7sphqv");
  const [amount, setAmount] = useState("");

  const account = useAccount();
  const { balance, isLoading: isBalanceLoading, refetch, address } = useBalance();
  const { sendTransaction, txSignature, isLoading, isReady, error, reset } = useSolTransfer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    await sendTransaction(to, amount);
    await refetch();
    setTo("");
    setAmount("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">SOL Transfer</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Send SOL with your connected wallet. This demonstrates a basic SOL transfer using the Para SDK with Anchor
          integration via the{" "}
          <code className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-md">AnchorProvider</code>{" "}
          wallet adapter.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card title="Current Balance" description="Network: Devnet">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-gray-900">
              {!address
                ? "Please connect your wallet"
                : isBalanceLoading
                  ? "Loading..."
                  : balance
                    ? `${parseFloat(balance).toFixed(4)} SOL`
                    : "Unable to fetch balance"}
            </p>
            <button
              onClick={refetch}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>&#8635;</span>
            </button>
          </div>
        </Card>

        {error && <StatusAlert type="error" message={error.message} />}
        {txSignature && <StatusAlert type="success" message="Transaction confirmed and executed successfully!" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="to" className="block text-sm font-medium text-gray-700">
              Recipient Address
            </label>
            <input
              id="to"
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="5jHY..."
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (SOL)
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.01"
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <ActionButton
            onClick={() => {}}
            isLoading={isLoading}
            disabled={!to || !amount || !isReady || !account?.isConnected}
            loadingText="Sending Transaction...">
            Send Transaction
          </ActionButton>

          {txSignature && <TxResult signature={txSignature} />}
        </form>
      </div>
    </div>
  );
}
