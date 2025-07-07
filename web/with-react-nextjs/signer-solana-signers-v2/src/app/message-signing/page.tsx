"use client";

import { useState } from "react";
import { getBase58Encoder, getBase58Decoder, getUtf8Encoder } from "@solana/codecs-strings";
import nacl from "tweetnacl";
import { useAccount, useWallet } from "@getpara/react-sdk";
import { useParaSigner } from "@/hooks/useParaSigner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SignatureBytes } from "@solana/kit";

export default function MessageSigningPage() {
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    message: string;
  } | null>(null);

  const { signer } = useParaSigner();
  const { data: account } = useAccount();
  const { data: wallet } = useWallet();

  const isConnected = account?.isConnected;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer || !isConnected || !message.trim()) return;

    setIsLoading(true);
    setSignature(null);
    setVerificationResult(null);

    try {
      const messageToSign = message.trim();
      const messageBytes = new Uint8Array(getUtf8Encoder().encode(messageToSign));
      const signatureResult = await signer.signMessages([{ content: messageBytes, signatures: {} }]);
      const signatureBytes = signatureResult[0][signer.address];
      // Convert signature bytes to base58 string
      const bs58 = await import('bs58');
      const signatureBase58 = bs58.default.encode(signatureBytes);

      setSignature(signatureBase58);
    } catch (error) {
      console.error("Error signing message:", error);
      setVerificationResult({
        verified: false,
        message: "Failed to sign message. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!message || !signature || !signer) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const messageBytes = new Uint8Array(getUtf8Encoder().encode(message));
      // Use a different base58 decoder since signature is a string
      const base58 = await import('bs58');
      const signatureBytes = base58.default.decode(signature) as SignatureBytes;
      const publicKeyBuffer = signer.sender;
      
      const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBuffer);

      setVerificationResult({
        verified: isValid,
        message: isValid 
          ? "Signature verified successfully!" 
          : "Invalid signature for this message and public key."
      });
    } catch (error) {
      console.error("Error verifying signature:", error);
      setVerificationResult({
        verified: false,
        message: "Failed to verify signature. Please try again."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setMessage("");
    setSignature(null);
    setVerificationResult(null);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Sign Message Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sign a message with your connected wallet. This demonstrates a basic message signing interaction with the Para
          SDK using the <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">signMessages()</code>{" "}
          method of the ParaSolanaSigner. You can also verify the signature to ensure its authenticity.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Status Messages */}
        {verificationResult && (
          <div
            className={`mb-4 rounded-none border ${
              verificationResult.verified
                ? "bg-green-50 border-green-500 text-green-700"
                : "bg-red-50 border-red-500 text-red-700"
            }`}>
            <p className="px-6 py-4">{verificationResult.message}</p>
          </div>
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
              disabled={isLoading || isVerifying}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={!message || !isConnected || isLoading || isVerifying}>
              {isLoading && <LoadingSpinner className="h-4 w-4" />}
              {isLoading ? "Signing..." : "Sign Message"}
            </button>

            {signature && (
              <button
                type="button"
                onClick={handleReset}
                className="rounded-none bg-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors">
                Reset
              </button>
            )}
          </div>

          {signature && (
            <div className="mt-8 rounded-none border border-gray-200">
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Signature:</h3>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none disabled:opacity-50 flex items-center gap-2">
                  {isVerifying && <LoadingSpinner className="h-3 w-3" />}
                  {isVerifying ? "Verifying..." : "Verify"}
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                  {signature}
                </p>
              </div>
            </div>
          )}
        </form>

        {!isConnected && (
          <div className="mt-8 text-center text-gray-600">
            <p>Please connect your wallet to sign messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}