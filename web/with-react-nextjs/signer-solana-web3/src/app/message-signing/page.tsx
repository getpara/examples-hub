"use client";

import { useState } from "react";
import { useMessageSigning } from "@/hooks/useMessageSigning";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { ActionButton } from "@/components/ui/ActionButton";

export default function MessageSigningPage() {
  const [message, setMessage] = useState("");
  const { signMessage, verifySignature, signature, isLoading, error, isReady, isVerified } = useMessageSigning();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady || !message.trim()) return;
    await signMessage(message);
  };

  const handleVerify = async () => {
    if (!signature || !message) return;
    await verifySignature(message);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Sign Message Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sign a message with your connected wallet. This demonstrates a basic message signing interaction with the Para
          SDK using the{" "}
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">signBytes()</code>
          method of the ParaSolanaWeb3Signer. You can also verify the signature to ensure its authenticity.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {error && <StatusAlert type="error" message={error.message} />}

        {isVerified === true && <StatusAlert type="success" message="Signature verified successfully!" />}

        {isVerified === false && !error && (
          <StatusAlert type="error" message="Invalid signature for this message and public key." />
        )}

        {signature && !error && isVerified === null && (
          <StatusAlert type="success" message="Message signed successfully!" />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message to Sign
            </label>
            <input
              id="message"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a message to sign"
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-hidden transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <ActionButton type="submit" disabled={!message || !isReady} isLoading={isLoading} loadingText="Signing...">
            Sign Message
          </ActionButton>

          {signature && (
            <TxResult signature={signature} label="Signature:" actionLabel="Verify" onAction={handleVerify} />
          )}
        </form>
      </div>
    </div>
  );
}
