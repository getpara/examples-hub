"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useWallet } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import { useParaSigner } from "@/hooks/useParaSigner";
import ParaTestToken from "@/contracts/artifacts/contracts/ParaTestToken.sol/ParaTestToken.json";

type Operation = {
  type: "mint" | "transfer";
  recipient: string;
  amount: string;
};

const PARA_TEST_TOKEN_CONTRACT_ADDRESS = "0x83cC70475A0d71EF1F2F61FeDE625c8C7E90C3f2";

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

  const { data: account } = useAccount();
  const { data: wallet } = useWallet();
  const { signer, provider } = useParaSigner();

  const fetchTokenData = async () => {
    if (!wallet?.address || !provider) return;

    setIsBalanceLoading(true);
    try {
      const contract = new ethers.Contract(PARA_TEST_TOKEN_CONTRACT_ADDRESS, ParaTestToken.abi, provider);

      const balance = await contract.balanceOf(wallet.address);
      setTokenBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error("Error fetching token data:", error);
      setTokenBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (wallet?.address) {
      fetchTokenData();
    }
  }, [wallet?.address]);

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

  const executeMulticall = async () => {
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setTxHash("");

    if (!signer || !wallet?.address) return;

    try {
      if (!account?.isConnected) {
        throw new Error("Please connect your wallet.");
      }

      const contract = new ethers.Contract(PARA_TEST_TOKEN_CONTRACT_ADDRESS, ParaTestToken.abi, signer);

      const iface = new ethers.utils.Interface(ParaTestToken.abi);

      // Prepare calldata for each operation
      const calldata = operations.map((op) => {
        if (op.type === "mint") {
          return iface.encodeFunctionData("mint", [ethers.utils.parseEther(op.amount)]);
        } else {
          return iface.encodeFunctionData("transfer", [op.recipient, ethers.utils.parseEther(op.amount)]);
        }
      });

      setStatus({
        show: true,
        type: "info",
        message: "Please confirm the batched transaction in your wallet...",
      });

      const tx = await contract.multicall(calldata);
      console.log("Transaction submitted:", tx);

      setTxHash(tx.hash);
      setStatus({
        show: true,
        type: "info",
        message: "Transaction submitted. Waiting for confirmation...",
      });

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      setStatus({
        show: true,
        type: "success",
        message: "Batched operations executed successfully!",
      });

      // Reset form and refresh data
      setOperations([{ type: "mint", recipient: "", amount: "" }]);
      await fetchTokenData();
    } catch (error) {
      console.error("Error executing batched operations:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to execute operations. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Batch Transactions</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Execute multiple token operations in a single transaction using the{" "}
          <code className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-md">multicall</code> function of
          the ParaTestToken contract.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card title="Token Balance" description="Network: Holesky">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-gray-900">
              {!wallet?.address
                ? "Please connect your wallet"
                : isBalanceLoading
                ? "Loading..."
                : tokenBalance
                ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                : "Unable to fetch balance"}
            </p>
            <button
              onClick={fetchTokenData}
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

        <div className="space-y-6">
          {operations.map((operation, index) => (
            <Card
              key={index}
              title={`Operation ${index + 1}`}>
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Operation Type</label>
                  <select
                    value={operation.type}
                    onChange={(e) => updateOperation(index, "type", e.target.value)}
                    disabled={isLoading}
                    className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500">
                    <option value="mint">Mint</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>

                {operation.type === "transfer" && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Recipient Address</label>
                    <input
                      type="text"
                      value={operation.recipient}
                      onChange={(e) => updateOperation(index, "recipient", e.target.value)}
                      placeholder="0x..."
                      disabled={isLoading}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Amount (CTT)</label>
                  <input
                    type="number"
                    value={operation.amount}
                    onChange={(e) => updateOperation(index, "amount", e.target.value)}
                    placeholder="0.0"
                    step="0.01"
                    disabled={isLoading}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  />
                </div>

                {operations.length > 1 && (
                  <button
                    onClick={() => removeOperation(index)}
                    className="text-red-600 hover:text-red-800 text-sm">
                    Remove Operation
                  </button>
                )}
              </div>
            </Card>
          ))}

          <button
            onClick={addOperation}
            disabled={isLoading}
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 rounded-none transition-colors">
            + Add Operation
          </button>

          <button
            onClick={executeMulticall}
            disabled={
              !account?.isConnected ||
              isLoading ||
              operations.some((op) => !op.amount || (op.type === "transfer" && !op.recipient))
            }
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? "Executing Operations..." : "Execute Batch"}
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
        </div>
      </div>
    </div>
  );
}
