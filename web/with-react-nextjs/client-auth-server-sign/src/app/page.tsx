"use client";

import { usePara } from "@/components/ParaProvider";
import { Card } from "@/components/Card";
import { useState, useEffect } from "react";
import { parseEther, type TransactionRequest, toBigInt, formatEther } from "ethers";

export default function Home() {
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

  const { isConnected, walletId, address, provider, openModal, session } = usePara();

  const fetchBalance = async () => {
    if (!address || !provider) return;

    setIsBalanceLoading(true);
    try {
      const balanceWei = await provider.getBalance(address);
      setBalance(formatEther(balanceWei));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (address && isConnected) {
      fetchBalance();
    }
  }, [address, isConnected]);

  const constructTransaction = async (toAddress: string, ethAmount: string): Promise<TransactionRequest> => {
    if (!address || !provider) throw new Error("No sender address or provider available");

    const nonce = await provider.getTransactionCount(address);
    const feeData = await provider.getFeeData();
    const gasLimit = toBigInt(21000);
    const value = parseEther(ethAmount);

    const tx: TransactionRequest = {
      to: toAddress,
      value: value,
      nonce: nonce,
      gasLimit: gasLimit,
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      chainId: 11155111,
    };

    return tx;
  };

  const validateTransaction = async (toAddress: string, ethAmount: string): Promise<boolean> => {
    if (!address || !provider) throw new Error("No sender address or provider available");

    try {
      const balanceWei = await provider.getBalance(address);

      const feeData = await provider.getFeeData();
      const gasLimit = toBigInt(21000); // Standard ETH transfer gas limit

      const maxGasFee = gasLimit * (feeData.maxFeePerGas ?? toBigInt(0));

      const amountWei = parseEther(ethAmount);
      const totalCost = amountWei + maxGasFee;

      if (totalCost > balanceWei) {
        const requiredEth = formatEther(totalCost);
        const availableEth = formatEther(balanceWei);
        throw new Error(
          `Insufficient balance. Transaction requires approximately ${requiredEth} ETH (including max gas fees), but only ${availableEth} ETH is available.`
        );
      }

      return true;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setTxHash("");

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

      if (!to.match(/^0x[a-fA-F0-9]{40}$/)) {
        setStatus({
          show: true,
          type: "error",
          message: "Invalid recipient address format.",
        });
        return;
      }

      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        setStatus({
          show: true,
          type: "error",
          message: "Please enter a valid amount greater than 0.",
        });
        return;
      }

      await validateTransaction(to, amount);

      const tx = await constructTransaction(to, amount);
      console.log("Constructed transaction:", tx);

      if (!session) {
        throw new Error("Session not found. Please reconnect your wallet.");
      }

      setStatus({
        show: true,
        type: "info",
        message: "Submitting transaction to server for signing...",
      });

      const response = await fetch("/api/signing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session,
          transaction: JSON.stringify(tx, (key, value) => (typeof value === "bigint" ? value.toString() : value)),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sign and broadcast transaction");
      }

      const data = await response.json();
      console.log("Server response:", data);

      if (!data.transactionHash) {
        throw new Error("Transaction hash not found in server response");
      }
      setStatus({
        show: true,
        type: "info",
        message: "Transaction submitted. Waiting for confirmation...",
      });

      const receipt = await provider!.waitForTransaction(data.transactionHash, 1);

      setTxHash(data.transactionHash);
      setStatus({
        show: true,
        type: "success",
        message: "Transaction submitted and confirmed successfully!",
      });

      await fetchBalance();

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
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Para Signing Demo</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Send ETH with your connected wallet using server-side signing. This demonstrates using the Para SDK with
          ethers.js integration to construct transactions client-side and sign them server-side.
        </p>
      </div>

      {!isConnected ? (
        <div className="max-w-xl mx-auto">
          <Card
            title="ETH Transfer"
            description="Send ETH from your wallet to any address using server-side signing">
            <button
              onClick={openModal}
              className="w-full rounded-none bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-950 transition-colors">
              Connect Wallet
            </button>
          </Card>
        </div>
      ) : (
        <div className="max-w-xl mx-auto">
          <div className="mb-8 rounded-none border border-gray-200">
            <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Current Balance:</h3>
              <button
                onClick={fetchBalance}
                disabled={isBalanceLoading || !address}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                title="Refresh balance">
                <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
              </button>
            </div>
            <div className="px-6 py-3">
              <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Network: Sepolia</p>
              <p className="text-lg font-medium text-gray-900">
                {isBalanceLoading
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
                  : "bg-blue-50 border-blue-500 text-blue-700"
              }`}>
              <p className="px-6 py-4 break-words">{status.message}</p>
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
              {isLoading ? "Sending Transaction..." : "Send Transaction"}
            </button>

            {txHash && (
              <div className="mt-8 rounded-none border border-gray-200">
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Transaction Hash:</h3>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm bg-blue-900 text-white hover:bg-blue-950 transition-colors rounded-none">
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
          </form>
        </div>
      )}
    </div>
  );
}
