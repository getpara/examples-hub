"use client";

import { useState } from "react";
import { useBalance } from "@/hooks/useBalance";
import { useSolTransfer } from "@/hooks/useSolTransfer";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { ActionButton } from "@/components/ui/ActionButton";
import { DataField } from "@/components/ui/DataField";

export default function SolTransferPage() {
  const [to, setTo] = useState("devwuNsNYACyiEYxRNqMNseBpNnGfnd4ZwNHL7sphqv");
  const [amount, setAmount] = useState("");

  const { balance, isLoading: isBalanceLoading, refetch, isReady: isBalanceReady, address } = useBalance();
  const { transfer, txSignature, isLoading, error, isReady, status } = useSolTransfer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady || !to || !amount) return;
    await transfer(to, amount);
    if (status === "success") {
      refetch();
      setTo("");
      setAmount("");
    }
  };

  const getBalanceDisplay = () => {
    if (!address) return "Please connect your wallet";
    if (isBalanceLoading) return "Loading...";
    if (balance) return `${parseFloat(balance).toFixed(4)} SOL`;
    return "Unable to fetch balance";
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">SOL Transfer Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Send SOL with your connected wallet. This demonstrates a basic SOL transfer using the Para SDK with
          solana-web3.js integration via the{" "}
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">ParaSolanaWeb3Signer</code>{" "}
          provider.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <DataField
          label="Current Balance:"
          value={getBalanceDisplay()}
          isLoading={isBalanceLoading}
          onRefresh={refetch}
          refreshDisabled={!isBalanceReady}
          subLabel="Network: Devnet"
        />

        {error && <StatusAlert type="error" message={error.message} />}

        {status === "confirming" && <StatusAlert type="info" message="Transaction submitted. Waiting for confirmation..." />}

        {status === "success" && <StatusAlert type="success" message="Transaction confirmed and executed successfully!" />}

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
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-hidden transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
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
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-hidden transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <ActionButton
            type="submit"
            disabled={!to || !amount || !isReady}
            isLoading={isLoading}
            loadingText="Sending Transaction...">
            Send Transaction
          </ActionButton>

          {txSignature && <TxResult signature={txSignature} />}
        </form>
      </div>
    </div>
  );
}
