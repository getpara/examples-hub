"use client";

import { useState, useEffect } from "react";
import { useAccount, useWallet } from "@getpara/react-sdk";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useTransaction } from "@/hooks/useTransaction";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatLamportsToSol, validateSolanaAddress, validateSolAmount } from "@/utils/validation";
import { ESTIMATED_CONFIRMATION_TIME_MS, LAMPORTS_PER_SOL } from "@/config/constants";

export default function SolTransferPage() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  
  const { signer, rpc } = useParaSigner();
  const { data: account } = useAccount();
  const { data: wallet } = useWallet();
  const { status, error, signature, estimatedFee, sendTransaction, reset } = useTransaction();
  
  const address = wallet?.address;
  const isConnected = account?.isConnected;

  // Real-time validation states
  const addressValidation = validateSolanaAddress(to);
  const amountValidation = validateSolAmount(amount);
  const isFormValid = to && amount && addressValidation.isValid && amountValidation.isValid;

  const fetchBalance = async () => {
    if (!address || !rpc || !signer) return;

    setIsBalanceLoading(true);
    try {
      const response = await rpc.getBalance(signer.address).send();
      setBalance(formatLamportsToSol(response.value));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (address && signer) {
      fetchBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, signer]);

  // Refresh balance after successful transaction
  useEffect(() => {
    if (status === "confirmed") {
      fetchBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !isConnected || !signer) return;
    
    await sendTransaction(to, amount);
  };

  const handleReset = () => {
    reset();
    setTo("");
    setAmount("");
  };

  const getStatusMessage = () => {
    switch (status) {
      case "validating":
        return "Validating transaction...";
      case "building":
        return "Building transaction...";
      case "signing":
        return "Signing transaction...";
      case "sending":
        return "Sending transaction...";
      case "confirming":
        return `Confirming transaction (est. ${ESTIMATED_CONFIRMATION_TIME_MS / 1000}s)...`;
      case "confirmed":
        return "Transaction confirmed successfully!";
      default:
        return null;
    }
  };

  const getErrorMessage = () => {
    if (!error) return null;
    
    switch (error.code) {
      case "NO_SIGNER":
        return "Please connect your wallet to send a transaction.";
      case "INVALID_ADDRESS":
      case "INVALID_AMOUNT":
        return error.message;
      case "INSUFFICIENT_BALANCE":
        return error.message;
      case "TIMEOUT":
        return "Transaction took too long to confirm. Please check the explorer.";
      case "NETWORK_ERROR":
        return "Network error. Please check your connection and try again.";
      default:
        return error.message || "Transaction failed. Please try again.";
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">SOL Transfer Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Send SOL with your connected wallet. This demonstrates a basic SOL transfer using the Para SDK with
          solana-signers-v2 integration via the{" "}
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">ParaSolanaSigner</code>{" "}
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
            <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-none">Network: Devnet</p>
            <p className="text-lg font-medium text-gray-900">
              {!address
                ? "Please connect your wallet"
                : isBalanceLoading
                ? "Loading..."
                : balance
                ? `${balance} SOL`
                : "Unable to fetch balance"}
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {(status !== "idle" && status !== "error") && (
          <div className="mb-4 rounded-none border bg-gray-50 border-gray-500 text-gray-700">
            <div className="px-6 py-4 flex items-center gap-3">
              <LoadingSpinner />
              <span>{getStatusMessage()}</span>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <div className="mb-4 rounded-none border bg-red-50 border-red-500 text-red-700">
            <p className="px-6 py-4 break-words">{getErrorMessage()}</p>
          </div>
        )}

        {/* Success Message */}
        {status === "confirmed" && signature && (
          <div className="mb-4 rounded-none border bg-green-50 border-green-500 text-green-700">
            <div className="px-6 py-4">
              <p className="mb-2">Transaction confirmed successfully!</p>
              <a
                href={`https://solscan.io/tx/${signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline hover:no-underline">
                View on Solscan →
              </a>
            </div>
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
              placeholder="Enter Solana address"
              required
              disabled={status !== "idle" && status !== "error"}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
            {to && !addressValidation.isValid && (
              <p className="text-sm text-red-600">{addressValidation.error}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (SOL)
              </label>
              {estimatedFee && (
                <span className="text-sm text-gray-500">
                  Est. fee: {formatLamportsToSol(estimatedFee, 6)} SOL
                </span>
              )}
            </div>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.000000001"
              required
              disabled={status !== "idle" && status !== "error"}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
            {amount && !amountValidation.isValid && (
              <p className="text-sm text-red-600">{amountValidation.error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isFormValid || !isConnected || status !== "idle"}>
              {status === "idle" || status === "error" ? "Send Transaction" : "Processing..."}
            </button>
            
            {status === "confirmed" && (
              <button
                type="button"
                onClick={handleReset}
                className="rounded-none bg-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors">
                New Transfer
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}