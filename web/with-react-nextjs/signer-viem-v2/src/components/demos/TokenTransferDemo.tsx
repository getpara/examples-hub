"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { ActionButton } from "@/components/ui/ActionButton";
import { useEvmWalletConnection } from "@/hooks/useEvmWalletConnection";
import { useTokenTransfer } from "@/hooks/useTokenTransfer";

const DEFAULT_CONTRACT = "0x83cC70475A0d71EF1F2F61FeDE625c8C7E90C3f2";

export default function TokenTransferDemo() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT);

  const wallet = useEvmWalletConnection();
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
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">Token Transfer Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Transfer {tokenSymbol} tokens using the Para SDK with a Viem wallet client. The example shows querying for
          ERC20 token data directly from contract and submitting a transfer transaction.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <div className="mb-8 space-y-4">
          <Card title="Current Balances" description="Network: Holesky">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">ETH Balance (for gas fees):</p>
                  <p className="text-lg font-medium text-card-foreground">
                    {!wallet.isConnected
                      ? "Please connect your wallet"
                      : isBalanceLoading
                        ? "Loading..."
                        : ethBalance
                          ? `${parseFloat(ethBalance).toFixed(4)} ETH`
                          : "Unable to fetch balance"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchBalances}
                  disabled={isBalanceLoading || !wallet.isConnected}
                  className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
                  title="Refresh balances">
                  {isBalanceLoading ? "Loading" : "Refresh"}
                </button>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{tokenSymbol} Balance:</p>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-card-foreground">
                    {!wallet.isConnected
                      ? "Please connect your wallet"
                      : isBalanceLoading
                        ? "Loading..."
                        : tokenBalance
                          ? `${parseFloat(tokenBalance).toFixed(4)} ${tokenSymbol}`
                          : "Unable to fetch balance"}
                  </p>
                  {tokenBalance === "0.0" && (
                    <div className="rounded-xl border border-border bg-muted/60 p-3 text-sm">
                      <p className="mb-2 text-muted-foreground">
                        You don&apos;t have any {tokenSymbol} tokens yet. You&apos;ll need some tokens before you can
                        make transfers.
                      </p>
                      <Link
                        href="/contract-interaction"
                        className="font-medium text-primary underline-offset-4 hover:underline">
                        Mint some {tokenSymbol} tokens
                      </Link>
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
            <label htmlFor="contractAddress" className="block text-sm font-medium text-foreground">
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
              className="field-control"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="to" className="block text-sm font-medium text-foreground">
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
              className="field-control"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="amount" className="block text-sm font-medium text-foreground">
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
              className="field-control"
            />
          </div>

          <ActionButton
            type="submit"
            onClick={() => {}}
            isLoading={isLoading}
            disabled={!to || !amount || !isReady || !wallet.isConnected}
            loadingText="Sending Tokens...">
            Send Tokens
          </ActionButton>

          {txHash && <TxResult hash={txHash} />}
        </form>
      </div>
    </div>
  );
}
