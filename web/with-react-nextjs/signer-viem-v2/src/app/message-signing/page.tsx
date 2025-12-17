"use client";

import { useState } from "react";
import { useModal, useAccount } from "@getpara/react-sdk";
import { verifyMessage } from "viem";
import { useSignMessage } from "@/hooks/useSignMessage";
import { StatusMessage } from "@/components/ui/StatusMessage";

export default function MessageSigningPage() {
  const [message, setMessage] = useState("");
  const [verified, setVerified] = useState(false);
  const [status, setStatus] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
    show: false,
    type: "success",
    message: "",
  });

  const { isConnected, embedded } = useAccount();
  const address = embedded?.wallets?.[0]?.address as `0x${string}` | undefined;
  const { signMessage, isPending, signature, error } = useSignMessage();
  const { openModal } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerified(false);
    setStatus({ show: false, type: "success", message: "" });

    try {
      await signMessage(message.trim());
      setStatus({ show: true, type: "success", message: "Message signed successfully!" });
    } catch {
      setStatus({ show: true, type: "error", message: error?.message || "Failed to sign message. Please try again." });
    }
  };

  const handleVerify = async () => {
    if (!message || !signature || !address) return;

    try {
      const isValid = await verifyMessage({
        address,
        message,
        signature,
      });
      setVerified(isValid);
      setStatus({
        show: true,
        type: isValid ? "success" : "error",
        message: isValid ? "Signature verified successfully!" : "Signature verification failed.",
      });
    } catch {
      setStatus({ show: true, type: "error", message: "Failed to verify signature." });
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Wallet Connection Required</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to view this demo.</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center rounded-none bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-950 transition-colors">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Sign Message Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sign a message with your connected wallet using the{" "}
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">useSignMessage</code> hook.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <StatusMessage type={status.type} message={status.message} show={status.show} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Enter a message to sign
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              required
              rows={4}
              className="block w-full px-4 py-3 border border-gray-300 rounded-none resize-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={!isConnected || isPending || !message}
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? "Signing..." : "Sign Message"}
          </button>
        </form>

        {signature && (
          <>
            <div className="mt-8 rounded-none border border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Signature:</h3>
              </div>
              <div className="p-6">
                <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                  {signature}
                </p>
              </div>
            </div>

            <button
              onClick={handleVerify}
              className="mt-4 w-full rounded-none border border-gray-900 px-6 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors">
              Verify Signature
            </button>

            {verified && (
              <div className="mt-4 px-6 py-4 bg-green-50 border border-green-500 text-green-700 rounded-none">
                <p className="text-sm">Signature verified successfully!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
