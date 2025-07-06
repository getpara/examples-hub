"use client";

import { useState, useEffect } from "react";
import { encodeFunctionData, formatEther, getContract, parseEther } from "viem";
import { useAccount } from "@getpara/react-sdk";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useViemProvider } from "@/hooks/useViemProvider";
import { useAccountAddress } from "@/hooks/useAccountAddress";
import { PARA_TEST_TOKEN_CONTRACT_ADDRESS } from "@/config/contracts";
import ParaTestToken from "@/contracts/artifacts/contracts/ParaTestToken.sol/ParaTestToken.json";

type Operation = {
  type: "mint" | "transfer";
  recipient: string;
  amount: string;
};

export default function BatchTransactionsPage() {
  const [operations, setOperations] = useState<Operation[]>([{ type: "mint", recipient: "", amount: "" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const account = useAccount();
  const { walletClient } = useParaSigner();
  const publicClient = useViemProvider();
  const address = useAccountAddress();

  const fetchTokenData = async () => {
    if (!address || !publicClient) return;

    setIsBalanceLoading(true);
    try {
      const contract = getContract({
        address: PARA_TEST_TOKEN_CONTRACT_ADDRESS,
        abi: ParaTestToken.abi,
        publicClient: publicClient!,
      });

      const balance = await contract.read.balanceOf([address]);
      setTokenBalance(formatEther(balance as bigint));
    } catch (error) {
      console.error("Error fetching token data:", error);
      setTokenBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchTokenData();
    }
  }, [address]);

  const addOperation = () => {
    setOperations([...operations, { type: "mint", recipient: "", amount: "" }]);
  };

  const removeOperation = (index: number) => {
    setOperations(operations.filter((_, i) => i !== index));
  };

  const updateOperation = (index: number, field: keyof Operation, value: string) => {
    const newOperations = [...operations];
    if (field === "type") {
      newOperations[index] = {
        type: value as "mint" | "transfer",
        recipient: "",
        amount: "",
      };
    } else {
      newOperations[index] = {
        ...newOperations[index],
        [field]: value,
      };
    }
    setOperations(newOperations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setTxHash("");

    try {
      if (!account?.isConnected) {
        throw new Error("Please connect your wallet to execute batch transactions.");
      }

      // Validate all operations
      const validOperations = operations.filter((op) => {
        if (op.type === "mint") {
          return parseFloat(op.amount) > 0;
        } else {
          return op.recipient.match(/^0x[a-fA-F0-9]{40}$/) && parseFloat(op.amount) > 0;
        }
      });

      if (validOperations.length === 0) {
        throw new Error("No valid operations to execute.");
      }

      // Prepare multicall data
      const multicallData = validOperations.map((op) => {
        if (op.type === "mint") {
          return encodeFunctionData({
            abi: ParaTestToken.abi,
            functionName: "mint",
            args: [parseEther(op.amount)],
          });
        } else {
          return encodeFunctionData({
            abi: ParaTestToken.abi,
            functionName: "transfer",
            args: [op.recipient as `0x${string}`, parseEther(op.amount)],
          });
        }
      });

      const contract = getContract({
        address: PARA_TEST_TOKEN_CONTRACT_ADDRESS,
        abi: ParaTestToken.abi,
        publicClient: publicClient!,
        walletClient: walletClient!,
      });

      setStatus({
        show: true,
        type: "info",
        message: `Executing ${validOperations.length} operations. Please confirm the transaction in your wallet...`,
      });

      const hash = await contract.write.multicall([multicallData], {
        account: address,
      });

      setTxHash(hash);
      setStatus({
        show: true,
        type: "info",
        message: "Batch transaction submitted. Waiting for confirmation...",
      });

      const receipt = await publicClient!.waitForTransactionReceipt({ hash });

      console.log("Batch transaction confirmed:", receipt);

      setStatus({
        show: true,
        type: "success",
        message: `Successfully executed ${validOperations.length} operations in a single transaction!`,
      });

      // Refresh balance
      await fetchTokenData();

      // Reset form
      setOperations([{ type: "mint", recipient: "", amount: "" }]);
    } catch (error) {
      console.error("Error executing batch transaction:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to execute batch transaction. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Batch Transactions Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Execute multiple token operations in a single transaction using Multicall. Save gas and ensure atomic
          execution.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Your PTT Balance:</h3>
            <button
              onClick={fetchTokenData}
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
                : tokenBalance
                ? `${parseFloat(tokenBalance).toFixed(4)} PTT`
                : "N/A"}
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
          onSubmit={handleSubmit}
          className="space-y-4">
          <div className="space-y-4">
            {operations.map((op, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-none space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-900">Operation {index + 1}</h4>
                  {operations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOperation(index)}
                      className="text-red-600 hover:text-red-700 text-sm">
                      Remove
                    </button>
                  )}
                </div>

                <select
                  value={op.type}
                  onChange={(e) => updateOperation(index, "type", e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none">
                  <option value="mint">Mint Tokens</option>
                  <option value="transfer">Transfer Tokens</option>
                </select>

                {op.type === "transfer" && (
                  <input
                    type="text"
                    value={op.recipient}
                    onChange={(e) => updateOperation(index, "recipient", e.target.value)}
                    placeholder="Recipient address (0x...)"
                    className="block w-full px-4 py-2 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none"
                  />
                )}

                <input
                  type="number"
                  value={op.amount}
                  onChange={(e) => updateOperation(index, "amount", e.target.value)}
                  placeholder="Amount (PTT)"
                  step="0.01"
                  className="block w-full px-4 py-2 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addOperation}
            className="w-full rounded-none border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            + Add Operation
          </button>

          <button
            type="submit"
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || operations.length === 0}>
            {isLoading ? "Executing Batch..." : `Execute ${operations.length} Operation${operations.length > 1 ? "s" : ""}`}
          </button>

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
        </form>
      </div>
    </div>
  );
}