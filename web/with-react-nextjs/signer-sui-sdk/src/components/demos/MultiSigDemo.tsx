"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/ActionButton";
import { Card } from "@/components/ui/Card";
import { DataField } from "@/components/ui/DataField";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { useSuiMultiSig } from "@/hooks/useSuiMultiSig";
import { useSuiWalletConnection } from "@/hooks/useSuiWalletConnection";

export default function MultiSigDemo() {
  const [message, setMessage] = useState("Hello from a Para + co-signer multisig!");

  const wallet = useSuiWalletConnection();
  const {
    sign,
    reset,
    isReady,
    isLoading,
    error,
    combinedSignature,
    isVerified,
    multiSigAddress,
    coSignerAddress,
    threshold,
  } = useSuiMultiSig();

  const handleSign = async () => {
    reset();
    await sign(message);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">Native Multisig Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          A {threshold}-of-2 Sui multisig: your embedded Para wallet is one member and an ephemeral
          browser keypair is the other. Each signs the same message; the partials are combined into a
          single multisig signature and verified.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        {!wallet.isConnected && (
          <StatusAlert type="info" message="Connect your wallet to derive the multisig and sign." />
        )}
        {error && <StatusAlert type="error" message={error.message} />}
        {isVerified === true && (
          <StatusAlert type="success" message="Combined multisig signature verified successfully!" />
        )}
        {isVerified === false && !error && (
          <StatusAlert type="error" message="Combined signature failed verification." />
        )}

        <Card title="Multisig Members" description={`Threshold: ${threshold} of 2 (each weight 1)`}>
          <DataField label="Multisig Address" value={multiSigAddress ?? "Deriving..."} mono />
          <div className="mt-4">
            <DataField label="Para Wallet (member 1)" value={wallet.address || "Not connected"} mono />
          </div>
          <div className="mt-4">
            <DataField label="Co-signer (member 2, ephemeral)" value={coSignerAddress ?? "Generating..."} mono />
          </div>
        </Card>

        <div className="mt-4 space-y-4">
          <div className="space-y-3">
            <label htmlFor="ms-message" className="block text-sm font-medium text-foreground">
              Message to Sign
            </label>
            <textarea
              id="ms-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Enter a message for both members to sign"
              required
              disabled={isLoading}
              data-testid="multisig-message-input"
              className="field-control"
              rows={3}
            />
          </div>

          <ActionButton
            onClick={handleSign}
            isLoading={isLoading}
            disabled={!message.trim() || !isReady || !wallet.isConnected}
            loadingText="Signing with both members..."
            data-testid="multisig-sign-button">
            {!wallet.isConnected ? "Connect Wallet" : "Sign & Combine"}
          </ActionButton>

          {combinedSignature && (
            <Card title="Combined Multisig Signature">
              <DataField
                label="Signature"
                value={combinedSignature}
                mono
                data-testid="multisig-signature-display"
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
