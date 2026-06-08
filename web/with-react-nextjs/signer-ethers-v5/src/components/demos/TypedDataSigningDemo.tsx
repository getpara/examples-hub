"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { DataField } from "@/components/ui/DataField";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { ActionButton } from "@/components/ui/ActionButton";
import { useEvmWalletConnection } from "@/hooks/useEvmWalletConnection";
import { useTypedDataSigning } from "@/hooks/useTypedDataSigning";

const ATTESTATION_PURPOSES = [
  "Governance Participation",
  "Token Holder Verification",
  "Community Membership",
  "Trading Authorization",
] as const;

export default function TypedDataSigningDemo() {
  const [purpose, setPurpose] = useState<(typeof ATTESTATION_PURPOSES)[number]>(ATTESTATION_PURPOSES[0]);

  const wallet = useEvmWalletConnection();
  const {
    signAttestation,
    fetchTokenData,
    tokenBalance,
    signature,
    attestation,
    isLoading,
    isBalanceLoading,
    isReady,
    error,
    reset,
  } = useTypedDataSigning();

  const handleSign = async () => {
    reset();
    await signAttestation(purpose);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">Typed Data Signing Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Create and sign structured attestations about your CTT token holdings. These signatures can be verified
          off-chain by any system that supports{" "}
          <code className="rounded-md bg-muted px-2 py-1 text-xs text-foreground">EIP-712</code> typed data
          verification.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <Card title="Token Balance" description="Network: Holesky">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-card-foreground">
              {!wallet.isConnected
                ? "Please connect your wallet"
                : isBalanceLoading
                  ? "Loading..."
                  : tokenBalance
                    ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                    : "Unable to fetch balance"}
            </p>
            <button
              type="button"
              onClick={fetchTokenData}
              disabled={isBalanceLoading || !wallet.isConnected}
              className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
              title="Refresh balance">
              {isBalanceLoading ? "Loading" : "Refresh"}
            </button>
          </div>
        </Card>

        {error && <StatusAlert type="error" message={error.message} />}
        {signature && <StatusAlert type="success" message="Attestation signed successfully!" />}

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">Attestation Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as typeof purpose)}
              disabled={isLoading}
              className="field-control">
              {ATTESTATION_PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <ActionButton
            onClick={handleSign}
            isLoading={isLoading}
            disabled={!isReady || !wallet.isConnected}
            loadingText="Signing...">
            Sign Attestation
          </ActionButton>

          {attestation && signature && (
            <div className="space-y-4">
              <Card title="Signed Attestation Data">
                <div className="space-y-4">
                  <DataField label="Holder" value={attestation.holder} mono />
                  <DataField label="Balance" value={`${attestation.balance} CTT`} mono />
                  <DataField label="Purpose" value={attestation.purpose} mono />
                  <DataField label="Timestamp" value={new Date(attestation.timestamp * 1000).toLocaleString()} mono />
                  <DataField label="Nonce" value={String(attestation.nonce)} mono />
                </div>
              </Card>

              <Card title="Signature">
                <DataField label="Signature" value={signature} mono />
              </Card>

              <div className="rounded-xl border border-border bg-muted/60 p-4 text-sm text-muted-foreground">
                <p className="mb-2">
                  This signed attestation can be verified off-chain by any system that supports EIP-712. The signature
                  proves:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>You are the holder of {attestation.balance} CTT tokens</li>
                  <li>You signed this attestation for {attestation.purpose}</li>
                  <li>The attestation was signed at {new Date(attestation.timestamp * 1000).toLocaleString()}</li>
                  <li>The signature is bound to the Holesky network and CTT contract</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
