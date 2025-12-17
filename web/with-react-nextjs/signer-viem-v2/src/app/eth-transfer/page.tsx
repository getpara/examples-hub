"use client";

import { useState } from "react";
import { useModal, useAccount } from "@getpara/react-sdk";
import { formatEther, parseEther } from "viem";
import { useSendTransaction } from "@/hooks/useSendTransaction";
import { useBalance } from "@/hooks/useBalance";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { TransactionResult } from "@/components/ui/TransactionResult";

export default function EthTransferPage() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
    show: false,
    type: "success",
    message: "",
  });

  const { isConnected, embedded } = useAccount();
  const address = embedded?.wallets?.[0]?.address as `0x${string}` | undefined;
  const { sendTransaction, isPending, txHash, error } = useSendTransaction();
  const { balance, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance();
  const { openModal } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ show: false, type: "success", message: "" });

    if (!/^0x[a-fA-F0-9]{40}$/.test(to)) {
      setStatus({ show: true, type: "error", message: "Invalid recipient address format." });
      return;
    }

    try {
      setStatus({ show: true, type: "info", message: "Please confirm the transaction in your wallet..." });

      await sendTransaction({
        to: to as `0x${string}`,
        value: parseEther(amount),
      });

      setStatus({ show: true, type: "success", message: "Transaction confirmed successfully!" });
      setTo("");
      setAmount("");
      refetchBalance();
    } catch {
      setStatus({ show: true, type: "error", message: error?.message || "Transaction failed. Please try again." });
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
        <h1 className="text-4xl font-bold tracking-tight mb-6">ETH Transfer Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transfer ETH using the{" "}
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">useSendTransaction</code>{" "}
          hook.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">ETH Balance:</h3>
            <button
              onClick={refetchBalance}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>&#x1f504;</span>
            </button>
          </div>
          <div className="px-6 py-3">
            <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Network: Sepolia</p>
            <p className="text-lg font-medium text-gray-900">
              {!address
                ? "Please connect your wallet"
                : isBalanceLoading
                  ? "Loading..."
                  : balance !== null
                    ? `${parseFloat(formatEther(balance)).toFixed(4)} ETH`
                    : "Unable to fetch balance"}
            </p>
          </div>
        </div>

        <StatusMessage type={status.type} message={status.message} show={status.show} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Recipient Address</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x..."
              disabled={isPending}
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
              disabled={isPending}
              className="block w-full px-4 py-3 border border-gray-300 rounded-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={!isConnected || isPending || !to || !amount}
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? "Sending Transaction..." : "Send ETH"}
          </button>
        </form>

        {txHash && <TransactionResult txHash={txHash} />}
      </div>
    </div>
  );
}
