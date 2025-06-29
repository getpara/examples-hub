"use client";

import { useState } from "react";
import { verifyMessage } from "viem";
import { useAccount } from "@getpara/react-sdk";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useAccountAddress } from "@/hooks/useAccountAddress";

export default function MessageSigningPage() {
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [recovered, setRecovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const { data: account } = useAccount();
  const { walletClient, viemAccount } = useParaSigner();
  const address = useAccountAddress();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRecovered(false);

    if (!walletClient || !viemAccount) return;

    try {
      if (!account?.isConnected) {
        setStatus({
          show: true,
          type: "error",
          message: "Please connect your wallet to sign a message.",
        });
        return;
      }

      const messageToSign = message.trim();

      const signature = await walletClient.signMessage({ 
        account: viemAccount, 
        message: messageToSign 
      });

      setSignature(`${signature}`);

      setStatus({
        show: true,
        type: "success",
        message: "Message signed successfully!",
      });
    } catch (error) {
      setStatus({
        show: true,
        type: "error",
        message: "Failed to sign message. Please try again.",
      });
      console.error("Error signing message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      if (!message || !signature || !viemAccount) return;

      const recovered = await verifyMessage({ 
        address: viemAccount.address, 
        message, 
        signature: signature as `0x${string}` 
      });
      
      setRecovered(recovered);
      setStatus({
        show: true,
        type: "success",
        message: "Signature verified successfully!",
      });
    } catch (error) {
      setStatus({
        show: true,
        type: "error",
        message: "Failed to verify signature. Please try again.",
      });
      console.error("Error verifying signature:", error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Sign Message Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sign a message with your connected wallet. This demonstrates a basic message signing interaction with the Para
          SDK using viem integration.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {status.show && (
          <div
            className={`mb-4 rounded-none border ${
              status.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : "bg-red-50 border-red-500 text-red-700"
            }`}>
            <p className="px-6 py-4">{status.message}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4">
          <div className="space-y-3">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700">
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

          <button
            type="submit"
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!message || isLoading}>
            {isLoading ? "Signing Message..." : "Sign Message"}
          </button>

          {signature && (
            <div className="mt-8 rounded-none border border-gray-200">
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Signature:</h3>
                <button
                  type="button"
                  onClick={handleVerify}
                  className="px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
                  Verify
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                  {signature}
                </p>
                {recovered && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Recovered:</p>
                    <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                      {recovered}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}