"use client";

import { useState } from "react";
import { useParaSigner } from "@/hooks/useParaSigner";

export default function MessageSigningPage() {
  const [message, setMessage] = useState("Hello from Para + CosmJS!");
  const [isLoading, setIsLoading] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const { signingClient, address, isLoading: isSignerLoading } = useParaSigner();

  const signMessage = async () => {
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setSignature(null);

    try {
      if (!address) {
        throw new Error("Please connect your wallet to sign a message.");
      }

      if (!signingClient) {
        throw new Error("Signing client not initialized. Please try reconnecting.");
      }

      // Create a transaction with just a memo to sign
      const msgs: never[] = [];
      const fee = {
        amount: [{ denom: "uatom", amount: "0" }],
        gas: "0",
      };

      // Sign and broadcast with simulation mode (won't actually send)
      const txRaw = await signingClient.sign(address, msgs, fee, message);

      // Extract the signature from the transaction
      const result = {
        signature: {
          signature: Buffer.from(txRaw.signatures[0]).toString('base64')
        }
      };

      setSignature(result.signature.signature);
      setStatus({
        show: true,
        type: "success",
        message: "Message signed successfully!",
      });
    } catch (error) {
      console.error("Error signing message:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to sign message. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isClientReady = !!signingClient && !!address;

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Message Signing Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sign an arbitrary message with your Cosmos account. This demonstrates how to use Para for message signing operations.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {status.show && (
          <div
            className={`mb-4 rounded-none border ${
              status.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : status.type === "error"
                ? "bg-red-50 border-red-500 text-red-700"
                : "bg-gray-50 border-gray-500 text-gray-700"
            }`}>
            <p className="px-6 py-4 break-words">{status.message}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-3">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700">
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

          <button
            onClick={signMessage}
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || isSignerLoading || !isClientReady || !message.trim()}>
            {isLoading
              ? "Signing Message..."
              : isSignerLoading
              ? "Initializing Signer..."
              : !isClientReady
              ? "Connect Wallet"
              : "Sign Message"}
          </button>

          {signature && (
            <div className="mt-8 rounded-none border border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Signature Result:</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Message:</p>
                    <p className="text-sm font-mono bg-white p-4 border border-gray-200 break-all">
                      {message}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Signature:</p>
                    <p className="text-sm font-mono bg-white p-4 border border-gray-200 break-all">
                      {signature}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Signer Address:</p>
                    <p className="text-sm font-mono bg-white p-4 border border-gray-200 break-all">
                      {address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
