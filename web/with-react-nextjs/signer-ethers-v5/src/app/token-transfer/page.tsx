"use client";

import { useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { ActionButton } from "@/components/ui/ActionButton";
import { useTokenTransfer } from "@/hooks/useTokenTransfer";

const DEFAULT_CONTRACT = "0x83cC70475A0d71EF1F2F61FeDE625c8C7E90C3f2";

export default function TokenTransferPage() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT);

  const account = useAccount();
  const {
    transfer,
    fetchBalances,
    ethBalance,
    tokenBalance,
    tokenSymbol,
    txHash,
    isLoading,
    isBalanceLoading,
    isReady,
    error,
    reset,
  } = useTokenTransfer(contractAddress);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    await transfer(to, amount);
    setTo("");
    setAmount("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Token Transfer</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transfer {tokenSymbol} tokens using the Para SDK with ethers.js integration. The example shows querying for
          ERC20 token data directly from contract and submitting a transfer transaction.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 space-y-4">
          <Card title="Current Balances" description="Network: Holesky">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">ETH Balance (for gas fees):</p>
                  <p className="text-lg font-medium text-gray-900">
                    {!account?.isConnected
                      ? "Please connect your wallet"
                      : isBalanceLoading
                        ? "Loading..."
                        : ethBalance
                          ? `${parseFloat(ethBalance).toFixed(4)} ETH`
                          : "Unable to fetch balance"}
                  </p>
                </div>
                <button
                  onClick={fetchBalances}
                  disabled={isBalanceLoading || !account?.isConnected}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                  title="Refresh balances">
                  <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>&#8635;</span>
                </button>
              </div>
              <div>
                <p className="text-sm text-gray-600">{tokenSymbol} Balance:</p>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {!account?.isConnected
                      ? "Please connect your wallet"
                      : isBalanceLoading
                        ? "Loading..."
                        : tokenBalance
                          ? `${parseFloat(tokenBalance).toFixed(4)} ${tokenSymbol}`
                          : "Unable to fetch balance"}
                  </p>
                  {tokenBalance === "0.0" && (
                    <div className="bg-blue-50 border border-blue-200 p-3 text-sm">
                      <p className="text-blue-700 mb-2">
                        You don&apos;t have any {tokenSymbol} tokens yet. You&apos;ll need some tokens before you can
                        make transfers.
                      </p>
                      <a
                        href="/contract-interaction"
                        className="text-blue-900 hover:text-blue-950 font-medium underline">
                        Click here to mint some {tokenSymbol} tokens →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {error && <StatusAlert type="error" message={error.message} />}
        {txHash && <StatusAlert type="success" message="Tokens transferred successfully!" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="contractAddress" className="block text-sm font-medium text-gray-700">
              Token Contract Address
            </label>
            <input
              id="contractAddress"
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="to" className="block text-sm font-medium text-gray-700">
              Recipient Address
            </label>
            <input
              id="to"
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x..."
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount ({tokenSymbol})
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
            loadingText="Sending Tokens...">
            Send Tokens
          </ActionButton>

          {txHash && <TxResult hash={txHash} />}
        </form>
      </div>
    </div>
  );
}
