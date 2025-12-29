"use client";

import { useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { ActionButton } from "@/components/ui/ActionButton";
import { useBalance } from "@/hooks/useBalance";
import { useMintToken } from "@/hooks/useMintToken";

export default function ProgramMintTokenPage() {
  const [mintAccount, setMintAccount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const account = useAccount();
  const { balance: solBalance, isLoading: isSolBalanceLoading, refetch: refetchSol, address } = useBalance();
  const {
    mintToken,
    fetchBalance: refetchToken,
    txSignature,
    tokenBalance,
    isLoading,
    isBalanceLoading: isTokenBalanceLoading,
    isReady,
    error,
    reset,
  } = useMintToken(mintAccount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    await mintToken(recipient, amount);
    await refetchSol();
    setRecipient("");
    setAmount("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Mint Token</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Interact with deployed programs to mint tokens. Learn how to call program methods and handle the responses.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card title="Balances" description="Network: Devnet">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">SOL Balance:</p>
                <p className="text-lg font-medium text-gray-900">
                  {!address
                    ? "Please connect your wallet"
                    : isSolBalanceLoading
                      ? "Loading..."
                      : solBalance
                        ? `${parseFloat(solBalance).toFixed(4)} SOL`
                        : "Unable to fetch balance"}
                </p>
              </div>
              <button
                onClick={() => {
                  refetchSol();
                  refetchToken();
                }}
                disabled={isSolBalanceLoading || isTokenBalanceLoading || !address}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                title="Refresh balances">
                <span className={`inline-block ${isSolBalanceLoading || isTokenBalanceLoading ? "animate-spin" : ""}`}>
                  &#8635;
                </span>
              </button>
            </div>
            {mintAccount && (
              <div>
                <p className="text-sm text-gray-600">Token Balance:</p>
                <p className="text-lg font-medium text-gray-900">
                  {!address
                    ? "Please connect wallet"
                    : isTokenBalanceLoading
                      ? "Loading..."
                      : tokenBalance !== null
                        ? `${tokenBalance} tokens`
                        : "Unable to fetch"}
                </p>
              </div>
            )}
          </div>
        </Card>

        {error && <StatusAlert type="error" message={error.message} />}
        {txSignature && (
          <StatusAlert type="success" message={`Successfully minted ${amount || "tokens"} to ${recipient}!`} />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="mintAccount" className="block text-sm font-medium text-gray-700">
              Mint Account Address
            </label>
            <input
              id="mintAccount"
              type="text"
              value={mintAccount}
              onChange={(e) => setMintAccount(e.target.value)}
              placeholder="Enter the token mint address"
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
              Recipient Address
            </label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter recipient's address"
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount to Mint
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              step="0.01"
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <ActionButton
            onClick={() => {}}
            isLoading={isLoading}
            disabled={!mintAccount || !recipient || !amount || !isReady || !account?.isConnected}
            loadingText="Minting Tokens...">
            Mint Tokens
          </ActionButton>

          {txSignature && <TxResult signature={txSignature} />}
        </form>
      </div>
    </div>
  );
}
