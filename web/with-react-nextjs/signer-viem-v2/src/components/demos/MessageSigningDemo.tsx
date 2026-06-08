"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { ActionButton } from "@/components/ui/ActionButton";
import { DataField } from "@/components/ui/DataField";
import { useEvmWalletConnection } from "@/hooks/useEvmWalletConnection";
import { useMessageSigning } from "@/hooks/useMessageSigning";

export default function MessageSigningDemo() {
  const [message, setMessage] = useState("Hello from Para + Viem v2!");

  const wallet = useEvmWalletConnection();
  const { signMessage, verifySignature, signature, recoveredAddress, isLoading, isReady, error, reset } =
    useMessageSigning();

  const handleSign = async () => {
    reset();
    await signMessage(message);
  };

  const handleVerify = async () => {
    if (signature) {
      await verifySignature(message, signature);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">Message Signing Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Sign a message with your connected wallet. This demonstrates a basic message signing interaction with the Para
          SDK using a Viem wallet client.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        {error && <StatusAlert type="error" message={error.message} />}
        {signature && !error && <StatusAlert type="success" message="Message signed successfully!" />}
        {recoveredAddress && <StatusAlert type="success" message="Signature verified successfully!" />}

        <div className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="message" className="block text-sm font-medium text-foreground">
              Message to Sign
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a message to sign"
              required
              disabled={isLoading}
              className="field-control"
              rows={4}
            />
          </div>

          <ActionButton
            onClick={handleSign}
            isLoading={isLoading}
            disabled={!message.trim() || !isReady || !wallet.isConnected}
            loadingText="Signing Message...">
            {!wallet.isConnected ? "Connect Wallet" : "Sign Message"}
          </ActionButton>

          {signature && (
            <Card title="Signature">
              <DataField label="Message" value={message} mono />
              <div className="mt-4">
                <DataField label="Signature" value={signature} mono />
              </div>
              <button
                type="button"
                onClick={handleVerify}
                className="btn-secondary mt-4 px-4 py-2 text-sm">
                Verify
              </button>
              {recoveredAddress && (
                <div className="mt-4">
                  <DataField label="Recovered Address" value={recoveredAddress} mono />
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
