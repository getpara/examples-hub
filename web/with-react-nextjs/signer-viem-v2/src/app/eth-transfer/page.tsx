"use client";

import { useModal, useAccount } from "@getpara/react-sdk";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useState, useEffect } from "react";
import { formatEther, parseEther, parseGwei } from "viem";
import { holesky } from "viem/chains";

export default function EthTransferPage() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const { isConnected, address, walletClient, publicClient, walletId } = useParaSigner();
  const { openModal } = useModal();

  const fetchBalance = async () => {
    if (!address || !publicClient) return;

    setIsBalanceLoading(true);
    try {
      const balanceWei = await publicClient.getBalance({ address });
      setBalance(formatEther(balanceWei));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchBalance();
    }
  }, [address]);

  const validateTransaction = async (ethAmount: string): Promise<boolean> => {
    if (!address || !publicClient) {
      throw new Error("No sender address, walletClient, or publicClient available");
    }

    try {
      const ethBalance = await publicClient.getBalance({ address });
      const amountWei = parseEther(ethAmount);

      const estimatedGas = await publicClient.estimateGas({
        account: address,
        to: to as `0x${string}`,
        value: amountWei,
      });

      const gasPrice = await publicClient.getGasPrice();
      const estimatedGasCost = estimatedGas * gasPrice;
      const totalCost = amountWei + estimatedGasCost;

      return ethBalance >= totalCost;
    } catch (error) {
      console.error("Transaction validation error:", error);
      throw error;
    }
  };

  const sendTransaction = async () => {
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setTxHash("");

    try {
      if (!isConnected || !address || !walletClient || !publicClient) {
        throw new Error("Please connect your wallet.");
      }

      if (!to || !amount) {
        throw new Error("Please provide both recipient address and amount.");
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(to)) {
        throw new Error("Invalid recipient address format.");
      }

      const hasBalance = await validateTransaction(amount);
      if (!hasBalance) {
        throw new Error("Insufficient ETH balance for this transaction.");
      }

      setStatus({
        show: true,
        type: "info",
        message: "Please confirm the transaction in your wallet...",
      });

      const hash = await walletClient.sendTransaction({
        account: address,
        to: to as `0x${string}`,
        value: parseEther(amount),
        chain: holesky,
        maxFeePerGas: parseGwei("100"),
        maxPriorityFeePerGas: parseGwei("3"),
      });

      console.log("Transaction submitted:", hash);

      setTxHash(hash);
      setStatus({
        show: true,
        type: "info",
        message: "Transaction submitted. Waiting for confirmation...",
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });

      console.log("Transaction confirmed:", receipt);

      setStatus({
        show: true,
        type: "success",
        message: "Transaction confirmed successfully!",
      });

      setTo("");
      setAmount("");
      await fetchBalance();
    } catch (error) {
      console.error("Transaction error:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Transaction failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
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
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-950 transition-colors">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">ETH Transfer Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transfer ETH from your connected wallet to any address on the Holesky testnet.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">ETH Balance:</h3>
            <button
              onClick={fetchBalance}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
            </button>
          </div>
          <div className="px-6 py-3">
            <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Network: Holesky</p>
            <p className="text-lg font-medium text-gray-900">
              {!address
                ? "Please connect your wallet"
                : isBalanceLoading
                ? "Loading..."
                : balance
                ? `${parseFloat(balance).toFixed(4)} ETH`
                : "Unable to fetch balance"}
            </p>
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendTransaction();
          }}
          className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Recipient Address</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x..."
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 rounded-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Amount (ETH)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.001"
              step="0.0001"
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 rounded-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={!isConnected || isLoading || !to || !amount}
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? "Sending Transaction..." : "Send ETH"}
          </button>
        </form>

        {txHash && (
          <div className="mt-8 rounded-none border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Transaction Hash:</h3>
              <a
                href={`https://holesky.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
                View on Etherscan
              </a>
            </div>
            <div className="p-6">
              <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                {txHash}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}