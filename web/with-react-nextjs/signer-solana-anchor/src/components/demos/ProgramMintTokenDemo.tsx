"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/ActionButton";
import { Card } from "@/components/ui/Card";
import { DataField } from "@/components/ui/DataField";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { useBalance } from "@/hooks/useBalance";
import { useMintToken } from "@/hooks/useMintToken";
import { useSolanaWalletConnection } from "@/hooks/useSolanaWalletConnection";

export default function ProgramMintTokenDemo() {
  const [mintAccount, setMintAccount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const wallet = useSolanaWalletConnection();
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    reset();
    await mintToken(recipient, amount);
    await refetchSol();
  };

  const handleRefresh = () => {
    refetchSol();
    refetchToken();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">Mint Token Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Mint tokens from an existing Token-2022 mint by calling the deployed Anchor program with Para as the signer.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <Card title="Balances" description="Network: Solana Devnet">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">SOL Balance</p>
                <p className="text-lg font-medium text-card-foreground">
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
                type="button"
                onClick={handleRefresh}
                disabled={isSolBalanceLoading || isTokenBalanceLoading || !address}
                className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
                title="Refresh balances">
                {isSolBalanceLoading || isTokenBalanceLoading ? "Loading" : "Refresh"}
              </button>
            </div>

            {mintAccount && (
              <div>
                <p className="text-sm text-muted-foreground">Token Balance</p>
                <p className="text-lg font-medium text-card-foreground">
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
        {txSignature && <StatusAlert type="success" message="Tokens minted successfully!" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="mintAccount" className="block text-sm font-medium text-foreground">
              Mint Account Address
            </label>
            <input
              id="mintAccount"
              type="text"
              value={mintAccount}
              onChange={(event) => setMintAccount(event.target.value)}
              placeholder="Token mint address"
              required
              disabled={isLoading}
              className="field-control"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="recipient" className="block text-sm font-medium text-foreground">
              Recipient Address
            </label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="Recipient Solana address"
              required
              disabled={isLoading}
              className="field-control"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="amount" className="block text-sm font-medium text-foreground">
              Amount to Mint
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
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
            disabled={!mintAccount || !recipient || !amount || !isReady || !wallet.isConnected}
            loadingText="Minting Tokens...">
            Mint Tokens
          </ActionButton>

          {txSignature && (
            <div className="space-y-4">
              <TxResult signature={txSignature} />
              {mintAccount && <DataField label="Mint Account" value={mintAccount} mono />}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
