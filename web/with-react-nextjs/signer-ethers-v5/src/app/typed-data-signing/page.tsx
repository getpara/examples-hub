"use client";

import { useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { ActionButton } from "@/components/ui/ActionButton";
import { useTypedDataSigning } from "@/hooks/useTypedDataSigning";

const ATTESTATION_PURPOSES = [
  "Governance Participation",
  "Token Holder Verification",
  "Community Membership",
  "Trading Authorization",
] as const;

export default function TypedDataSigningPage() {
  const [purpose, setPurpose] = useState<(typeof ATTESTATION_PURPOSES)[number]>(ATTESTATION_PURPOSES[0]);

  const account = useAccount();
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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Typed Data Signing</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create and sign structured attestations about your CTT token holdings. These signatures can be verified
          off-chain by any system that supports{" "}
          <code className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-md">EIP-712</code> typed data
          verification.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card title="Token Balance" description="Network: Holesky">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-gray-900">
              {!account?.isConnected
                ? "Please connect your wallet"
                : isBalanceLoading
                  ? "Loading..."
                  : tokenBalance
                    ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                    : "Unable to fetch balance"}
            </p>
            <button
              onClick={fetchTokenData}
              disabled={isBalanceLoading || !account?.isConnected}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>&#8635;</span>
            </button>
          </div>
        </Card>

        {error && <StatusAlert type="error" message={error.message} />}
        {signature && <StatusAlert type="success" message="Attestation signed successfully!" />}

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Attestation Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as typeof purpose)}
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500">
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
            disabled={!isReady || !account?.isConnected}
            loadingText="Signing...">
            Sign Attestation
          </ActionButton>

          {attestation && signature && (
            <div className="space-y-4">
              <Card title="Signed Attestation Data">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Holder:</p>
                    <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{attestation.holder}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Balance:</p>
                    <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">
                      {attestation.balance} CTT
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Purpose:</p>
                    <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{attestation.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Timestamp:</p>
                    <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">
                      {new Date(attestation.timestamp * 1000).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nonce:</p>
                    <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{attestation.nonce}</p>
                  </div>
                </div>
              </Card>

              <Card title="Signature">
                <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{signature}</p>
              </Card>

              <div className="bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
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
