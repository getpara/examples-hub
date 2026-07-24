"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/ActionButton";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { useBalance } from "@/hooks/useBalance";
import { useSuiFaucet } from "@/hooks/useSuiFaucet";
import { useSuiWalletConnection } from "@/hooks/useSuiWalletConnection";
import { useSuiTransfer } from "@/hooks/useSuiTransfer";

export default function SuiTransferDemo() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const wallet = useSuiWalletConnection();
  const { balance, isLoading: isBalanceLoading, refetch, address } = useBalance();
  const { fund, isLoading: isFunding, error: fundError, success: fundSuccess } = useSuiFaucet();
  const { transfer, txDigest, isLoading, error, isReady, status, reset } = useSuiTransfer();

  const handleFund = async () => {
    await fund();
    await refetch();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    reset();
    await transfer(to, amount);
    await refetch();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">SUI Transfer Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Send SUI on Sui Testnet with a transaction signed by Para&apos;s Sui integration and executed over gRPC.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <Card title="Current Balance" description="Network: Sui Testnet">
          <div className="flex items-center justify-between gap-3">
            <p data-testid="sui-balance" className="text-lg font-medium text-card-foreground">
              {!address
                ? "Please connect your wallet"
                : isBalanceLoading
                  ? "Loading..."
                  : balance !== null
                    ? `${parseFloat(balance).toFixed(4)} SUI`
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

        <div className="mt-4">
          <ActionButton
            onClick={handleFund}
            isLoading={isFunding}
            disabled={!address}
            loadingText="Funding..."
            data-testid="sui-fund-button">
            Fund with Faucet
          </ActionButton>
        </div>

        {fundSuccess && (
          <StatusAlert
            type="success"
            message="Faucet request submitted! Refresh the balance in a moment."
            data-testid="sui-fund-success"
          />
        )}
        {fundError && <StatusAlert type="error" message={fundError.message} />}
        {error && <StatusAlert type="error" message={error.message} />}
        {status === "confirming" && (
          <StatusAlert type="info" message="Transaction signed. Executing on-chain." />
        )}
        {txDigest && status === "success" && (
          <StatusAlert type="success" message="Transaction executed successfully!" />
        )}

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
              placeholder="0x..."
              required
              disabled={isLoading}
              className="field-control"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="amount" className="block text-sm font-medium text-foreground">
              Amount (SUI)
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
            isLoading={isLoading}
            disabled={!to || !amount || !isReady || !wallet.isConnected}
            loadingText="Sending Transaction...">
            Send Transaction
          </ActionButton>

          {txDigest && <TxResult digest={txDigest} />}
        </form>
      </div>
    </div>
  );
}
