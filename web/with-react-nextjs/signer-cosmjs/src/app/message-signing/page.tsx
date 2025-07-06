"use client";

import { useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useAccountAddress } from "@/hooks/useAccountAddress";
import { fromBase64 } from "@cosmjs/encoding";

export default function MessageSigningPage() {
  const [message, setMessage] = useState("Hello from Para + CosmJS!");
  const [isLoading, setIsLoading] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const account = useAccount();
  const { signingClient } = useParaSigner();
  const address = useAccountAddress();

  const signMessage = async () => {
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setSignature(null);

    try {
      if (!account?.isConnected || !address) {
        throw new Error("Please connect your wallet to sign a message.");
      }

      if (!signingClient) {
        throw new Error("Signing client not initialized. Please try reconnecting.");
      }

      setStatus({
        show: true,
        type: "info",
        message: "Please sign the message in your wallet...",
      });

      // For arbitrary message signing, we can use the signer directly
      const signer = (signingClient as any).signer;
      if (!signer || !signer.signDirect) {
        throw new Error("Signer does not support message signing");
      }

      // Create a simple sign doc for the message
      const signDoc = {
        bodyBytes: new TextEncoder().encode(JSON.stringify({
          messages: [],
          memo: message,
        })),
        authInfoBytes: new Uint8Array(0),
        chainId: "",
        accountNumber: BigInt(0),
      };

      const result = await signer.signDirect(address, signDoc);
      
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
            disabled={isLoading || !account?.isConnected || !message.trim()}>
            {isLoading ? "Signing Message..." : "Sign Message"}
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