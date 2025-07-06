"use client";

import { useState, useEffect } from "react";
import { useAccount } from "@getpara/react-sdk";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useCosmosQueryClient } from "@/hooks/useCosmosQueryClient";
import { useAccountAddress } from "@/hooks/useAccountAddress";
import { DEFAULT_CHAIN } from "@/config/chains";
import { coins } from "@cosmjs/stargate";

export default function AtomTransferPage() {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const account = useAccount();
  const { signingClient } = useParaSigner();
  const { queryClient } = useCosmosQueryClient();
  const address = useAccountAddress();

  const fetchBalance = async () => {
    if (!address || !queryClient) return;

    setIsBalanceLoading(true);
    try {
      const balanceResponse = await queryClient.getBalance(address, DEFAULT_CHAIN.coinMinimalDenom);
      const atomBalance = balanceResponse ? Number(balanceResponse.amount) / Math.pow(10, DEFAULT_CHAIN.coinDecimals) : 0;
      setBalance(atomBalance.toFixed(6));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [address, queryClient]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendTransaction = async () => {
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setTxHash(null);

    try {
      if (!account?.isConnected || !address) {
        throw new Error("Please connect your wallet to send a transaction.");
      }

      if (!signingClient) {
        throw new Error("Signing client not initialized. Please try reconnecting.");
      }

      if (!recipientAddress.startsWith("cosmos")) {
        throw new Error("Invalid recipient address. Must start with 'cosmos'.");
      }

      const amountInMinimalDenom = Math.floor(parseFloat(amount) * Math.pow(10, DEFAULT_CHAIN.coinDecimals));
      if (isNaN(amountInMinimalDenom) || amountInMinimalDenom <= 0) {
        throw new Error("Invalid amount. Please enter a valid positive number.");
      }

      setStatus({
        show: true,
        type: "info",
        message: "Please confirm the transaction in your wallet...",
      });

      const result = await signingClient.sendTokens(
        address,
        recipientAddress,
        coins(amountInMinimalDenom, DEFAULT_CHAIN.coinMinimalDenom),
        "auto",
        "Sent via Para + CosmJS"
      );

      setTxHash(result.transactionHash);
      setStatus({
        show: true,
        type: "success",
        message: `Transaction successful! Gas used: ${result.gasUsed}`,
      });

      // Refresh balance after transaction
      await fetchBalance();
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
        <h1 className="text-4xl font-bold tracking-tight mb-6">ATOM Transfer Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Send ATOM tokens from your wallet to another Cosmos address. This demonstrates basic token transfers on the Cosmos network.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Your Balance:</h3>
            <button
              onClick={fetchBalance}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
            </button>
          </div>
          <div className="px-6 py-3">
            <p className="text-lg font-medium text-gray-900">
              {!address
                ? "Connect wallet"
                : isBalanceLoading
                ? "Loading..."
                : balance
                ? `${balance} ${DEFAULT_CHAIN.coinDenom}`
                : "N/A"}
            </p>
            {address && (
              <p className="text-xs text-gray-500 mt-1">
                Address: {address}
              </p>
            )}
          </div>
        </div>

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
              htmlFor="recipient"
              className="block text-sm font-medium text-gray-700">
              Recipient Address
            </label>
            <input
              type="text"
              id="recipient"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none"
              placeholder="cosmos1..."
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700">
              Amount ({DEFAULT_CHAIN.coinDenom})
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none"
              placeholder="0.1"
              step="0.000001"
              min="0"
            />
          </div>

          <button
            onClick={sendTransaction}
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !account?.isConnected || !recipientAddress || !amount}>
            {isLoading ? "Sending Transaction..." : "Send ATOM"}
          </button>

          {txHash && (
            <div className="mt-8 rounded-none border border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Transaction Details:</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Transaction Hash:</p>
                    <p className="text-sm font-mono bg-white p-4 border border-gray-200 break-all">
                      {txHash}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Explorer Link:</p>
                    <a
                      href={`https://www.mintscan.io/cosmos/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-900 hover:text-gray-700 underline">
                      View on Mintscan →
                    </a>
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