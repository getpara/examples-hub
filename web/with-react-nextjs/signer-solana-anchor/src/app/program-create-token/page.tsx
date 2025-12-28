"use client";

import { useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { ActionButton } from "@/components/ui/ActionButton";
import { useBalance } from "@/hooks/useBalance";
import { useCreateToken } from "@/hooks/useCreateToken";

export default function ProgramCreateTokenPage() {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");

  const account = useAccount();
  const { balance, isLoading: isBalanceLoading, refetch, address } = useBalance();
  const { createToken, txSignature, mintAddress, isLoading, isReady, error, reset } = useCreateToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    await createToken(tokenName, tokenSymbol);
    await refetch();
    setTokenName("");
    setTokenSymbol("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Create Token</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Deploy your own instance of a token program and create tokens. This demonstrates how to interact with Anchor
          programs using the Para SDK.
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
        {txSignature && <StatusAlert type="success" message="Token created successfully!" />}

        {mintAddress && (
          <Card title="Created Mint Address">
            <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-4 border border-gray-200">
              {mintAddress}
            </p>
            <a
              href={`https://solscan.io/token/${mintAddress}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
              View on Solscan
            </a>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="tokenName" className="block text-sm font-medium text-gray-700">
              Token Name
            </label>
            <input
              id="tokenName"
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="My Token"
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="tokenSymbol" className="block text-sm font-medium text-gray-700">
              Token Symbol
            </label>
            <input
              id="tokenSymbol"
              type="text"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              placeholder="MTK"
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <ActionButton
            onClick={() => {}}
            isLoading={isLoading}
            disabled={!tokenName || !tokenSymbol || !isReady || !account?.isConnected}
            loadingText="Creating Token...">
            Create Token
          </ActionButton>

          {txSignature && <TxResult signature={txSignature} />}
        </form>
      </div>
    </div>
  );
}
