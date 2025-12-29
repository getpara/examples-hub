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
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Message Signing Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sign an arbitrary message with your Cosmos account. This demonstrates how to use Para
          for message signing operations.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {error && <StatusAlert type="error" message={error.message} />}
        {signature && <StatusAlert type="success" message="Message signed successfully!" />}

        <div className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message to Sign
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none"
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
            <div className="mt-8 rounded-none border border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Signature Result:</h3>
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
