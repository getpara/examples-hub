"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/ActionButton";
import { Card } from "@/components/ui/Card";
import { DataField } from "@/components/ui/DataField";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { useBalance } from "@/hooks/useBalance";
import { useCreateToken } from "@/hooks/useCreateToken";
import { useSolanaWalletConnection } from "@/hooks/useSolanaWalletConnection";

export default function ProgramCreateTokenDemo() {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");

  const wallet = useSolanaWalletConnection();
  const { balance, isLoading: isBalanceLoading, refetch, address } = useBalance();
  const { createToken, txSignature, mintAddress, isLoading, isReady, error, reset } = useCreateToken();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    reset();
    await createToken(tokenName, tokenSymbol);
    await refetch();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">Create Token Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Create a Token-2022 mint by calling the sample Anchor program with a Para-backed Anchor provider.
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
        {txSignature && <StatusAlert type="success" message="Token created successfully!" />}

        {mintAddress && (
          <Card title="Created Mint Address">
            <DataField label="Mint Account" value={mintAddress} mono />
            <a
              href={`https://solscan.io/token/${mintAddress}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary mt-4 inline-block px-4 py-2 text-sm">
              View on Solscan
            </a>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="tokenName" className="block text-sm font-medium text-foreground">
              Token Name
            </label>
            <input
              id="tokenName"
              type="text"
              value={tokenName}
              onChange={(event) => setTokenName(event.target.value)}
              placeholder="My Token"
              required
              disabled={isLoading}
              className="field-control"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="tokenSymbol" className="block text-sm font-medium text-foreground">
              Token Symbol
            </label>
            <input
              id="tokenSymbol"
              type="text"
              value={tokenSymbol}
              onChange={(event) => setTokenSymbol(event.target.value)}
              placeholder="MTK"
              required
              disabled={isLoading}
              className="field-control"
            />
          </div>

          <ActionButton
            type="submit"
            onClick={() => {}}
            isLoading={isLoading}
            disabled={!tokenName || !tokenSymbol || !isReady || !wallet.isConnected}
            loadingText="Creating Token...">
            Create Token
          </ActionButton>

          {txSignature && <TxResult signature={txSignature} />}
        </form>
      </div>
    </div>
  );
}
