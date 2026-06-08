"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { ActionButton } from "@/components/ui/ActionButton";
import { useEvmWalletConnection } from "@/hooks/useEvmWalletConnection";
import { useContractInteraction } from "@/hooks/useContractInteraction";

export default function ContractInteractionDemo() {
  const [amount, setAmount] = useState("");

  const wallet = useEvmWalletConnection();
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
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">Contract Interaction Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          This demo shows how to interact with a deployed contract. Mint CTT tokens by interacting with the smart
          contract. Each address can mint up to 10 CTT tokens.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <Card title="Contract Information">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Current Balance:</p>
                <p className="text-lg font-medium text-card-foreground">
                  {!wallet.isConnected
                    ? "Please connect your wallet"
                    : isDataLoading
                      ? "Loading..."
                      : tokenBalance
                        ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                        : "Unable to fetch balance"}
                </p>
              </div>
              <button
                type="button"
                onClick={fetchContractData}
                disabled={isDataLoading || !wallet.isConnected}
                className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
                title="Refresh data">
                {isDataLoading ? "Loading" : "Refresh"}
              </button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount Minted:</p>
              <p className="text-lg font-medium text-card-foreground">
                {!wallet.isConnected
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
            <label htmlFor="amount" className="block text-sm font-medium text-foreground">
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
              className="field-control"
            />
          </div>

          <ActionButton
            type="submit"
            onClick={() => {}}
            isLoading={isLoading}
            disabled={!amount || !isReady || !wallet.isConnected}
            loadingText="Minting Tokens...">
            Mint Tokens
          </ActionButton>

          {txHash && <TxResult hash={txHash} />}

          {hasReachedLimit && (
            <div className="mt-4 rounded-xl border border-border bg-muted/60 p-4 text-sm text-muted-foreground">
              <p>You have reached your minting limit. No more tokens can be minted to this address.</p>
            </div>
          )}
        </form>

        <div className="mt-8 text-center">
          <Link href="/token-transfer" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Go to Token Transfer Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
