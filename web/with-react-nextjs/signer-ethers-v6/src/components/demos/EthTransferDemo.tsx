"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { ActionButton } from "@/components/ui/ActionButton";
import { useEvmWalletConnection } from "@/hooks/useEvmWalletConnection";
import { useBalance } from "@/hooks/useBalance";
import { useEthTransfer } from "@/hooks/useEthTransfer";

export default function EthTransferDemo() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const wallet = useEvmWalletConnection();
  const { balance, isLoading: isBalanceLoading, refetch, address } = useBalance();
  const { sendTransaction, txHash, isLoading, isReady, error, reset } = useEthTransfer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    await sendTransaction(to, amount);
    await refetch();
    setTo("");
    setAmount("");
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">ETH Transfer Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Send ETH with your connected wallet. This demonstrates a basic ETH transfer using the Para SDK with ethers.js
          integration.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <Card title="Current Balance" description="Network: Holesky">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-card-foreground">
              {!address
                ? "Please connect your wallet"
                : isBalanceLoading
                  ? "Loading..."
                  : balance
                    ? `${parseFloat(balance).toFixed(4)} ETH`
                    : "Unable to fetch balance"}
            </p>
            <button
              type="button"
              onClick={refetch}
              disabled={isBalanceLoading || !address}
              className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
              title="Refresh balance">
              {isBalanceLoading ? "Loading" : "Refresh"}
            </button>
          </div>
        </Card>

        {error && <StatusAlert type="error" message={error.message} />}
        {txHash && <StatusAlert type="success" message="Transaction confirmed and executed successfully!" />}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              Amount (ETH)
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
            loadingText="Sending Transaction...">
            Send Transaction
          </ActionButton>

          {txHash && <TxResult hash={txHash} />}
        </form>
      </div>
    </div>
  );
}
