"use client";

import { useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { ActionButton } from "@/components/ui/ActionButton";
import { useContractInteraction } from "@/hooks/useContractInteraction";

export default function ContractInteractionPage() {
  const [amount, setAmount] = useState("");

  const account = useAccount();
  const {
    mint,
    fetchContractData,
    tokenBalance,
    mintedAmount,
    mintLimit,
    txHash,
    isLoading,
    isDataLoading,
    isReady,
    hasReachedLimit,
    error,
    reset,
  } = useContractInteraction();

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    await mint(amount);
    setAmount("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Contract Interaction</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          This demo shows how to interact with a deployed contract. Mint CTT tokens by interacting with the smart
          contract. Each address can mint up to 10 CTT tokens.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card title="Contract Information">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Current Balance:</p>
                <p className="text-lg font-medium text-gray-900">
                  {!account?.isConnected
                    ? "Please connect your wallet"
                    : isDataLoading
                      ? "Loading..."
                      : tokenBalance
                        ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                        : "Unable to fetch balance"}
                </p>
              </div>
              <button
                onClick={fetchContractData}
                disabled={isDataLoading || !account?.isConnected}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                title="Refresh data">
                <span className={`inline-block ${isDataLoading ? "animate-spin" : ""}`}>&#8635;</span>
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount Minted:</p>
              <p className="text-lg font-medium text-gray-900">
                {!account?.isConnected
                  ? "Please connect your wallet"
                  : isDataLoading
                    ? "Loading..."
                    : mintedAmount && mintLimit
                      ? `${parseFloat(mintedAmount).toFixed(4)} / ${parseFloat(mintLimit).toFixed(4)} CTT`
                      : "Unable to fetch minted amount"}
              </p>
            </div>
          </div>
        </Card>

        {error && <StatusAlert type="error" message={error.message} />}
        {txHash && <StatusAlert type="success" message={`Successfully minted ${amount || "tokens"} CTT!`} />}

        <form onSubmit={handleMint} className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount to Mint (CTT)
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
            disabled={!amount || !isReady || !account?.isConnected}
            loadingText="Minting Tokens...">
            Mint Tokens
          </ActionButton>

          {txHash && <TxResult hash={txHash} />}

          {hasReachedLimit && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 text-yellow-800">
              <p>You have reached your minting limit. No more tokens can be minted to this address.</p>
            </div>
          )}
        </form>

        <div className="mt-8 text-center">
          <a href="/token-transfer" className="text-gray-900 hover:text-gray-950 text-sm font-medium">
            → Go to Token Transfer Demo
          </a>
        </div>
      </div>
    </div>
  );
}
