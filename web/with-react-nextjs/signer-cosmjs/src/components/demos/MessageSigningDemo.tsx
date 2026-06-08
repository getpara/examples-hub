"use client";

import { useState } from "react";
import { useMessageSigning } from "@/hooks/useMessageSigning";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { ActionButton } from "@/components/ui/ActionButton";
import { DataField } from "@/components/ui/DataField";

export default function MessageSigningPage() {
  const [message, setMessage] = useState("Hello from Para + CosmJS!");

  const { signMessage, signature, address, isLoading, isReady, error, reset } =
    useMessageSigning();

  const handleSign = async () => {
    reset();
    await signMessage(message);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">Message Signing Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Sign an arbitrary message with your Cosmos account. This demonstrates how to use Para
          for message signing operations.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        {error && <StatusAlert type="error" message={error.message} />}
        {signature && <StatusAlert type="success" message="Message signed successfully!" />}

        <div className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="message" className="block text-sm font-medium text-foreground">
              Message to Sign
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="field-control"
              rows={4}
              placeholder="Enter your message here..."
            />
          </div>

          <ActionButton
            onClick={handleSign}
            isLoading={isLoading}
            disabled={!isReady || !message.trim()}
            loadingText="Signing Message...">
            {!isReady ? "Connect Wallet" : "Sign Message"}
          </ActionButton>

          {signature && (
            <div className="mt-8 rounded-2xl border border-border bg-card">
              <div className="px-6 py-4 border-b border-border/60 bg-muted/60">
                <h3 className="text-sm font-medium text-card-foreground">Signature Result:</h3>
              </div>
              <div className="p-6 space-y-4">
                <DataField label="Message:" value={message} mono />
                <DataField label="Signature:" value={signature} mono />
                {address && <DataField label="Signer Address:" value={address} mono />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
