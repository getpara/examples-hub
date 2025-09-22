"use client";

import { useState } from "react";
import { useGelato } from "@/context/GelatoProvider";
import { useWallet } from "@getpara/react-sdk";
import { sepolia } from "viem/chains";

export function SponsoredTransaction() {
  const { isReady, isInitializing, error, sendSponsoredTransaction, smartAccount } = useGelato();
  const { data: wallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const handleSendTransaction = async () => {
    if (!isReady) {
      return;
    }

    setIsLoading(true);
    setTxError(null);
    setTaskId(null);
    setTxHash(null);

    try {
      // This executes the hardcoded example transaction from Gelato's docs:
      // to: 0xa8851f5f279eD47a292f09CA2b6D40736a51788E
      // data: 0xd09de08a (increment function)
      // value: 0 ETH
      // This demonstrates a gasless transaction - no ETH needed for gas!
      const result = await sendSponsoredTransaction();

      // Set the task ID immediately
      setTaskId(result.taskId);

      // Set the transaction hash after it's mined
      setTxHash(result.txHash);
    } catch (error) {
      console.error("Transaction failed:", error);
      setTxError(error instanceof Error ? error.message : "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="bg-white rounded-none border border-gray-200 p-6">
        <h3 className="text-lg font-medium mb-4">Sponsored Transactions (EIP-7702)</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
        <p className="text-center text-gray-600">Initializing Gelato Smart Wallet...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-none border border-gray-200 p-6">
        <h3 className="text-lg font-medium mb-4">Sponsored Transactions (EIP-7702)</h3>
        <div className="bg-red-50 border border-red-200 rounded-none p-4">
          <p className="text-sm text-red-700">Failed to initialize Gelato Smart Wallet:</p>
          <p className="text-xs text-red-600 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-none border border-gray-200 p-6">
      <h3 className="text-lg font-medium mb-4">Sponsored Transactions (EIP-7702)</h3>

      {!isReady ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-none p-4">
          <p className="text-sm text-yellow-700">Connect your wallet to enable sponsored transactions</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-none p-4">
            <p className="text-sm text-green-700 font-medium">Gelato Smart Wallet Ready!</p>
            <p className="text-xs text-green-600 mt-1">
              EOA Account: {wallet?.address?.slice(0, 6)}...{wallet?.address?.slice(-4)}
            </p>
            <p className="text-xs text-green-600">
              Smart Account: {smartAccount?.address?.slice(0, 6)}...{smartAccount?.address?.slice(-4)}
            </p>
            <p className="text-xs text-green-600">
              Network: {sepolia.name} (Chain ID: {sepolia.id})
            </p>
          </div>

          <div>
            <button
              onClick={handleSendTransaction}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-none hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
              {isLoading ? "Processing..." : "Execute Gasless Transaction"}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Executes increment() on contract 0xa8851...736a51788E with no gas required
            </p>
          </div>

          <div className="text-xs text-gray-500 p-3 bg-gray-50 border border-gray-200 rounded-none">
            <p className="font-medium mb-1">How it works with EIP-7702:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Your EOA delegates execution to Gelato's smart contract</li>
              <li>Gelato sponsors the gas fees through their paymaster</li>
              <li>You don't need any ETH in your wallet!</li>
              <li>Transactions are bundled and executed on-chain</li>
            </ul>
          </div>

          {(taskId || txHash) && (
            <div className="bg-green-50 border border-green-200 rounded-none p-4">
              <p className="text-sm text-green-700 font-medium">
                {txHash ? "Transaction Confirmed!" : "Transaction Submitted!"}
              </p>
              {taskId && <p className="text-xs text-green-600 mt-1 break-all">Gelato Task ID: {taskId}</p>}
              {txHash && (
                <>
                  <p className="text-xs text-green-600 mt-1 break-all">Transaction Hash: {txHash}</p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-700 underline mt-2 inline-block">
                    View on Etherscan →
                  </a>
                </>
              )}
            </div>
          )}

          {txError && (
            <div className="bg-red-50 border border-red-200 rounded-none p-4">
              <p className="text-sm text-red-700 font-medium">Transaction Failed</p>
              <p className="text-xs text-red-600 mt-1">{txError}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
