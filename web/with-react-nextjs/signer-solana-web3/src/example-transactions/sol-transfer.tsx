"use client";

import { usePara } from "@/components/ParaProvider";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useState, useEffect } from "react";

export default function EthTransferDemo() {
  const [to, setTo] = useState("devwuNsNYACyiEYxRNqMNseBpNnGfnd4ZwNHL7sphqv"); // default send back to faucet
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState("");
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const { isConnected, walletId, address, signer, connection } = usePara();

  const fetchBalance = async () => {
    if (!address || !connection) return;

    setIsBalanceLoading(true);
    try {
      const balanceLamports = await connection.getBalance(signer?.sender!);
      setBalance((balanceLamports / LAMPORTS_PER_SOL).toFixed(4));
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

  const constructTransaction = async (toAddress: string, solAmount: string): Promise<Transaction> => {
    if (!address || !connection) throw new Error("No sender address or connection available");

    try {
      const fromPubKey = signer?.sender;
      const toPubKey = new PublicKey(toAddress);
      const amountLamports = parseFloat(solAmount) * LAMPORTS_PER_SOL;

      const transaction = new Transaction();

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: fromPubKey!,
          toPubkey: toPubKey,
          lamports: BigInt(amountLamports),
        })
      );

      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = fromPubKey!;

      return transaction;
    } catch (error) {
      console.error("Error constructing transaction:", error);
      throw error;
    }
  };

  const validateTransaction = async (toAddress: string, solAmount: string): Promise<boolean> => {
    if (!address || !connection) throw new Error("No sender address or provider available");

    try {
      const balanceLamports = await connection.getBalance(signer?.sender!);

      const transaction = await constructTransaction(toAddress, solAmount);

      const estimatedGas = await transaction.getEstimatedFee(connection);

      const totalCost = parseFloat(solAmount) * LAMPORTS_PER_SOL + estimatedGas!;

      if (totalCost > balanceLamports) {
        const requiredSol = (totalCost / LAMPORTS_PER_SOL).toFixed(4);
        const availableSol = (balanceLamports / LAMPORTS_PER_SOL).toFixed(4);
        throw new Error(
          `Insufficient balance. Transaction requires approximately ${requiredSol} SOL, but you have only ${availableSol} SOL available.`
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
    setTxSignature("");

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
      if (!to || !PublicKey.isOnCurve(to)) {
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

      await validateTransaction(to, amount);

      const tx = await constructTransaction(to, amount);
      console.log("Constructed transaction:", tx);

      const txResponse = await signer.sendTransaction(tx);
      console.log("Transaction submitted:", txResponse);

      setTxSignature(txResponse);
      setStatus({
        show: true,
        type: "info",
        message: "Transaction submitted. Waiting for confirmation...",
      });

      let receipt = null;

      while (!receipt) {
        receipt = await connection?.getSignatureStatus(txResponse, { searchTransactionHistory: true });
        if (receipt?.value?.confirmationStatus === "confirmed" || receipt?.value?.confirmationStatus === "finalized") {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
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
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">SOL Transfer Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Send SOL with your connected wallet. This demonstrates a basic SOL transfer using the Para SDK with
          solana-web3.js integration via the{" "}
          <code className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md">ParaSolanaWeb3Signer</code>{" "}
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
            <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Network: Devnet</p>
            <p className="text-lg font-medium text-gray-900">
              {!address
                ? "Please connect your wallet"
                : isBalanceLoading
                ? "Loading..."
                : balance
                ? `${parseFloat(balance).toFixed(4)} SOL`
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
              placeholder="5jHY..."
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700">
              Amount (SOL)
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

          {txSignature && (
            <div className="mt-8 rounded-none border border-gray-200">
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Transaction Signature:</h3>
                <a
                  href={`https://solscan.io/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm bg-blue-900 text-white hover:bg-blue-950 transition-colors rounded-none">
                  View on Solscan
                </a>
              </div>
              <div className="p-6">
                <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                  {txSignature}
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
