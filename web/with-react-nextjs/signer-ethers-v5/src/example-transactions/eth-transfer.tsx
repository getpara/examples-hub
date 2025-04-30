"use client";

import { usePara } from "@/components/ParaProvider";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function EthTransferDemo() {
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

  const { isConnected, walletId, address, signer, provider } = usePara();

  const fetchBalance = async () => {
    if (!address || !provider) return;

    setIsBalanceLoading(true);
    try {
      const balanceWei = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(balanceWei));
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

  const constructTransaction = async (
    toAddress: string,
    ethAmount: string
  ): Promise<ethers.providers.TransactionRequest> => {
    if (!address || !provider) throw new Error("No sender address or provider available");

    const nonce = await provider.getTransactionCount(address);
    const feeData = await provider.getFeeData();
    const gasLimit = ethers.BigNumber.from(21000);
    const value = ethers.utils.parseEther(ethAmount);

    const tx: ethers.providers.TransactionRequest = {
      to: toAddress,
      value: value,
      nonce: nonce,
      gasLimit: gasLimit,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      chainId: 17000,
      data: "0x", // Adding an empty data field
    };

    return tx;
  };
  const validateTransaction = async (toAddress: string, ethAmount: string): Promise<boolean> => {
    if (!address || !provider) throw new Error("No sender address or provider available");

    try {
      // Get current balance
      const balanceWei = await provider.getBalance(address);

      // Get gas estimate
      const feeData = await provider.getFeeData();
      const gasLimit = ethers.BigNumber.from(21000);

      // Calculate maximum possible gas fee
      const maxGasFee = gasLimit.mul(feeData.maxFeePerGas ?? ethers.BigNumber.from(0));

      // Calculate total cost (amount + maximum gas fee)
      const amountWei = ethers.utils.parseEther(ethAmount);
      const totalCost = amountWei.add(maxGasFee);

      // Check if balance is sufficient
      if (totalCost > balanceWei) {
        const requiredEth = ethers.utils.formatEther(totalCost);
        const availableEth = ethers.utils.formatEther(balanceWei);
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

    if (!signer) return;

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

      // Validate balance and fees
      await validateTransaction(to, amount);

      // Construct and send transaction
      const tx = await constructTransaction(to, amount);
      console.log("Constructed transaction:", tx);

      const txResponse = await signer.sendTransaction(tx);
      console.log("Transaction submitted:", txResponse);

      setTxHash(txResponse.hash);
      setStatus({
        show: true,
        type: "info",
        message: "Transaction submitted. Waiting for confirmation...",
      });

      // Wait for transaction to be mined
      const receipt = await txResponse.wait();
      console.log("Transaction confirmed:", receipt);

      setStatus({
        show: true,
        type: "success",
        message: "Transaction confirmed and executed successfully!",
      });

      // Refresh balance after confirmed transaction
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
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">ETH Transfer Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Send ETH with your connected wallet. This demonstrates a basic ETH transfer using the Para SDK with ethers.js
          integration via the{" "}
          <code className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md">ethersParaSigner</code>{" "}
          provider.
        </p>
      </div>

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
                  href={`https://holesky.etherscan.io/tx/${txHash}`}
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
    </div>
  );
}
