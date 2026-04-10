"use client";

import { useState } from "react";
import { useBalance } from "@/hooks/useBalance";
import { useFriendbot } from "@/hooks/useFriendbot";
import { useXlmTransfer } from "@/hooks/useXlmTransfer";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { ActionButton } from "@/components/ui/ActionButton";
import { DataField } from "@/components/ui/DataField";

export default function SignTransactionPage() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const { balance, isLoading: isBalanceLoading, refetch, isReady: isBalanceReady, address } = useBalance();
  const { fund, isLoading: isFunding, error: fundError, success: fundSuccess } = useFriendbot();
  const { transfer, txHash, isLoading, error, isReady, status } = useXlmTransfer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady || !to || !amount) return;
    await transfer(to, amount);
    refetch();
  };

  const getBalanceDisplay = () => {
    if (!address) return "Please connect your wallet";
    if (isBalanceLoading) return "Loading...";
    if (balance) return `${parseFloat(balance).toFixed(4)} XLM`;
    return "Unable to fetch balance";
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">XLM Transfer Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Send XLM with your connected wallet. This demonstrates building and signing a classic Stellar payment
          transaction using the Para SDK with the{" "}
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">useStellarSigner</code>{" "}
          hook.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <DataField
          label="Current Balance:"
          value={getBalanceDisplay()}
          isLoading={isBalanceLoading}
          onRefresh={refetch}
          refreshDisabled={!isBalanceReady}
          subLabel="Network: Stellar Testnet"
          data-testid="stellar-balance"
        />

        <div className="mb-6">
          <ActionButton
            onClick={() => {
              fund().then(() => refetch());
            }}
            disabled={!isBalanceReady}
            isLoading={isFunding}
            loadingText="Funding..."
            data-testid="stellar-fund-button">
            Fund with Friendbot (Testnet)
          </ActionButton>
          {fundSuccess && <StatusAlert type="success" message="Account funded with 10,000 test XLM!" data-testid="stellar-fund-success" />}
          {fundError && <StatusAlert type="error" message={fundError.message} />}
        </div>

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
              placeholder="GABCD..."
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-hidden transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (XLM)
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

          {txHash && <TxResult signature={txHash} />}
        </form>
      </div>
    </div>
  );
}
