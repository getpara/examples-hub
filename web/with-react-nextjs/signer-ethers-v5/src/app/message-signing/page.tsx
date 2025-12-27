"use client";

import { useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { ActionButton } from "@/components/ui/ActionButton";
import { DataField } from "@/components/ui/DataField";
import { useMessageSigning } from "@/hooks/useMessageSigning";

export default function MessageSigningPage() {
  const [message, setMessage] = useState("");

  const account = useAccount();
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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Message Signing</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sign a message with your connected wallet. This demonstrates a basic message signing interaction with the Para
          SDK using ethers.js integration.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {error && <StatusAlert type="error" message={error.message} />}
        {signature && !error && <StatusAlert type="success" message="Message signed successfully!" />}
        {recoveredAddress && <StatusAlert type="success" message="Signature verified successfully!" />}

        <div className="space-y-4">
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
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <ActionButton
            onClick={handleSign}
            isLoading={isLoading}
            disabled={!message || !isReady || !account?.isConnected}
            loadingText="Signing Message...">
            Sign Message
          </ActionButton>

          {signature && (
            <Card title="Signature">
              <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-4 border border-gray-200">
                {signature}
              </p>
              <button
                type="button"
                onClick={handleVerify}
                className="mt-4 px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
                Verify
              </button>
              {recoveredAddress && (
                <div className="mt-4">
                  <DataField label="Recovered Address:" value={recoveredAddress} mono />
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
