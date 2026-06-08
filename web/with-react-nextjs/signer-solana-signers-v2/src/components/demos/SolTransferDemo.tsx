"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/ActionButton";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { useBalance } from "@/hooks/useBalance";
import { useSolTransfer } from "@/hooks/useSolTransfer";
import { useSolanaWalletConnection } from "@/hooks/useSolanaWalletConnection";

export default function SolTransferDemo() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const wallet = useSolanaWalletConnection();
  const { balance, isLoading: isBalanceLoading, refetch, address } = useBalance();
  const { sendTransaction, txSignature, isLoading, isReady, error, reset } = useSolTransfer();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    reset();
    await sendTransaction(to, amount);
    await refetch();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">SOL Transfer Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Send SOL on Devnet with a transaction signed by Para's Solana Signers v2 integration.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <Card title="Current Balance" description="Network: Solana Devnet">
          <div className="flex items-center justify-between">
            <p className="text-lg font-medium text-card-foreground">
              {!address
                ? "Please connect your wallet"
                : isBalanceLoading
                  ? "Loading..."
                  : balance
                    ? `${parseFloat(balance).toFixed(4)} SOL`
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
        {txSignature && <StatusAlert type="success" message="Transaction confirmed and executed successfully!" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="to" className="block text-sm font-medium text-foreground">
              Recipient Address
            </label>
            <input
              id="to"
              type="text"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="Solana recipient address"
              required
              disabled={isLoading}
              className="field-control"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="amount" className="block text-sm font-medium text-foreground">
              Amount (SOL)
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
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

          {txSignature && <TxResult signature={txSignature} />}
        </form>
      </div>
    </div>
  );
}
