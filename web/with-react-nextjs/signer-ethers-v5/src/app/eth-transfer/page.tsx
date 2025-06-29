"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useWallet } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import { useParaSigner } from "@/hooks/useParaSigner";

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

  const { data: account } = useAccount();
  const { data: wallet } = useWallet();
  const { signer, provider } = useParaSigner();

  const fetchBalance = async () => {
    if (!wallet?.address || !provider) return;

    setIsBalanceLoading(true);
    try {
      const balanceWei = await provider.getBalance(wallet.address);
      setBalance(ethers.utils.formatEther(balanceWei));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (wallet?.address) {
      fetchBalance();
    }
  }, [wallet?.address]);

  const constructTransaction = async (
    toAddress: string,
    ethAmount: string
  ): Promise<ethers.providers.TransactionRequest> => {
    if (!wallet?.address || !provider) throw new Error("No sender address or provider available");

    const nonce = await provider.getTransactionCount(wallet.address);
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
      data: "0x",
    };

    return tx;
  };

  const validateTransaction = async (toAddress: string, ethAmount: string): Promise<boolean> => {
    if (!wallet?.address || !provider) throw new Error("No sender address or provider available");

    try {
      const balanceWei = await provider.getBalance(wallet.address);
      const feeData = await provider.getFeeData();
      const gasLimit = ethers.BigNumber.from(21000);
      const maxGasFee = gasLimit.mul(feeData.maxFeePerGas ?? ethers.BigNumber.from(0));
      const amountWei = ethers.utils.parseEther(ethAmount);
      const totalCost = amountWei.add(maxGasFee);

      if (totalCost.gt(balanceWei)) {
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
      if (!account?.isConnected) {
        setStatus({
          show: true,
          type: "error",
          message: "Please connect your wallet to send a transaction.",
        });
        return;
      }

      if (!wallet?.id) {
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

      const txResponse = await signer.sendTransaction(tx);
      console.log("Transaction submitted:", txResponse);

      setTxHash(txResponse.hash);
      setStatus({
        show: true,
        type: "info",
        message: "Transaction submitted. Waiting for confirmation...",
      });

      const receipt = await txResponse.wait();
      console.log("Transaction confirmed:", receipt);

      setStatus({
        show: true,
        type: "success",
        message: "Transaction confirmed and executed successfully!",
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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">ETH Transfer</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Send ETH with your connected wallet. This demonstrates a basic ETH transfer using the Para SDK with ethers.js
          integration.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card title="Current Balance" description={`Network: Holesky`}>
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-gray-900">
              {!wallet?.address
                ? "Please connect your wallet"
                : isBalanceLoading
                ? "Loading..."
                : balance
                ? `${parseFloat(balance).toFixed(4)} ETH`
                : "Unable to fetch balance"}
            </p>
            <button
              onClick={fetchBalance}
              disabled={isBalanceLoading || !wallet?.address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
            </button>
          </div>
        </Card>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="to" className="block text-sm font-medium text-gray-700">
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
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
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
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!to || !amount || isLoading}>
            {isLoading ? "Sending Transaction..." : "Send Transaction"}
          </button>

          {txHash && (
            <Card title="Transaction Hash">
              <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-4 border border-gray-200">
                {txHash}
              </p>
              <a
                href={`https://holesky.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
                View on Etherscan
              </a>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}