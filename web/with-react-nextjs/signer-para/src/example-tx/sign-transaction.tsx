"use client";

import { para } from "@/client/para";
import { usePara } from "@/components/ParaProvider";
import { useState } from "react";
import { encode as rlpEncode } from "@ethereumjs/rlp";

export default function SignTransactionDemo() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [signature, setSignature] = useState("");
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const { isConnected, walletId, address } = usePara();
  console.log(address);

  // Helper function to convert hex string to buffer removing leading zeros
  const hexToBuffer = (hexString: string): Buffer => {
    const cleanHex = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
    const nonZeroIndex = cleanHex.split("").findIndex((char) => char !== "0");
    const trimmedHex = nonZeroIndex === -1 ? "0" : cleanHex.slice(nonZeroIndex);
    const paddedHex = trimmedHex.length % 2 ? "0" + trimmedHex : trimmedHex;
    return Buffer.from(paddedHex, "hex");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });

    try {
      if (!isConnected) {
        setStatus({
          show: true,
          type: "error",
          message: "Please connect your wallet to send a transaction.",
        });
        return;
      }

      if (!walletId) {
        setStatus({
          show: true,
          type: "error",
          message: "No wallet ID found. Please reconnect your wallet.",
        });
        return;
      }

      // Validate address format
      if (!to.match(/^0x[a-fA-F0-9]{40}$/)) {
        setStatus({
          show: true,
          type: "error",
          message: "Invalid recipient address format.",
        });
        return;
      }

      // Validate amount
      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        setStatus({
          show: true,
          type: "error",
          message: "Please enter a valid amount greater than 0.",
        });
        return;
      }

      // Convert ETH to Wei (1 ETH = 10^18 Wei)
      const amountInWei = BigInt(Math.floor(amountFloat * 1e18)).toString(16);

      // Chain ID for Sepolia testnet
      const chainId = "11155111";

      // Construct transaction fields for EIP-155 legacy transaction
      const txFields = [
        Buffer.from([]), // nonce (will be filled by the node)
        Buffer.from([]), // gasPrice (will be filled by the node)
        Buffer.from("5208", "hex"), // gasLimit (21000 for basic transfer)
        Buffer.from(to.slice(2), "hex"), // to address (remove 0x prefix)
        hexToBuffer(amountInWei), // value in Wei (properly encoded)
        Buffer.from([]), // data (empty for basic transfer)
        hexToBuffer(chainId), // chain ID
        Buffer.from([]), // r
        Buffer.from([]), // s
      ];

      console.log("Amount in Wei:", amountInWei);
      console.log("Transaction fields:", txFields);

      const rlpEncoded = rlpEncode(txFields);
      console.log("RLP encoded transaction:", rlpEncoded);

      const rlpEncodedTxBase64 = Buffer.from(rlpEncoded).toString("base64");
      console.log("Base64 encoded transaction:", rlpEncodedTxBase64);

      console.log("Chain ID:", chainId);

      const result = await para.signTransaction({walletId, rlpEncodedTxBase64, chainId});

      console.log("Transaction result:", result);

      if ("pendingTransactionId" in result || "transactionReviewUrl" in result) {
        setStatus({
          show: true,
          type: "error",
          message: "Transaction was denied or requires review.",
        });
        return;
      }

      setSignature(`0x${result.signature}`);
      setStatus({
        show: true,
        type: "success",
        message: "Transaction sent successfully!",
      });

      setTo("");
      setAmount("");
    } catch (error) {
      console.error("Error sending transaction:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to send transaction. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Send Transaction Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sign a transaction with your connected wallet. This demonstrates a basic transaction signing interaction with
          the Para SDK using the{" "}
          <code className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
            para.signTransaction()
          </code>{" "}
          method. Use this for manual transaction signing without one of the signer libraries.
        </p>
        <p className="text-lg text-orange-600 max-w-2xl mx-auto font-bold">
          Note: You have to still send the transaction to the chain manually post signing.
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
              htmlFor="to"
              className="block text-sm font-medium text-gray-700">
              Recipient Address
            </label>
            <input
              id="to"
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x..."
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700">
              Amount (ETH)
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.01"
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-none bg-blue-900 px-6 py-3 text-sm font-medium text-white hover:bg-blue-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!to || !amount || isLoading}>
            {isLoading ? "Signing Transaction..." : "Sign Transaction"}
          </button>

          {signature && (
            <div className="mt-8 rounded-none border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 px-6 py-4 bg-gray-50 border-b border-gray-200">
                Signature:
              </h3>
              <div className="p-6">
                <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                  {signature}
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
