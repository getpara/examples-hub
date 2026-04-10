"use client";

import { useState, useEffect, useCallback } from "react";
import { useModal, useAccount } from "@getpara/react-sdk";
import { encodeFunctionData, formatEther, getContract, parseEther } from "viem";
import { useParaViemClient, useParaViemWriteContract } from "@getpara/react-sdk/evm";
import { http } from "viem";
import { CHAIN } from "@/lib/viem";
import { publicClient } from "@/lib/viem";
import { PARA_TEST_TOKEN_ADDRESS, PARA_TEST_TOKEN_ABI } from "@/lib/contracts";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";

type Operation = {
  type: "mint" | "transfer";
  recipient: string;
  amount: string;
};

export default function BatchTransactionsPage() {
  const [operations, setOperations] = useState<Operation[]>([{ type: "mint", recipient: "", amount: "" }]);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [status, setStatus] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
    show: false,
    type: "success",
    message: "",
  });

  const { isConnected, embedded } = useAccount();
  const address = embedded?.wallets?.[0]?.address as `0x${string}` | undefined;
  const { viemClient } = useParaViemClient({ walletClientConfig: { chain: CHAIN, transport: http() } });
  const { writeContractAsync, isPending, data: txHash, error } = useParaViemWriteContract(viemClient);
  const { openModal } = useModal();

  const fetchTokenData = useCallback(async () => {
    if (!address) return;

    setIsBalanceLoading(true);
    try {
      const contract = getContract({
        address: PARA_TEST_TOKEN_ADDRESS,
        abi: PARA_TEST_TOKEN_ABI,
        client: publicClient,
      });

      const balance = await contract.read.balanceOf([address]);
      setTokenBalance(formatEther(balance as bigint));
    } catch (err) {
      console.error("Error fetching token data:", err);
      setTokenBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchTokenData();
    }
  }, [address, fetchTokenData]);

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
    setStatus({ show: false, type: "success", message: "" });

    try {
      const calldata = operations.map((op) => {
        if (op.type === "mint") {
          return encodeFunctionData({
            abi: PARA_TEST_TOKEN_ABI,
            functionName: "mint",
            args: [parseEther(op.amount)],
          });
        } else {
          return encodeFunctionData({
            abi: PARA_TEST_TOKEN_ABI,
            functionName: "transfer",
            args: [op.recipient, parseEther(op.amount)],
          });
        }
      });

      setStatus({ show: true, type: "info", message: "Please confirm the batched transaction in your wallet..." });

      await writeContractAsync({
        address: PARA_TEST_TOKEN_ADDRESS,
        abi: PARA_TEST_TOKEN_ABI,
        functionName: "multicall",
        args: [calldata],
      });

      setStatus({ show: true, type: "success", message: "Batched operations executed successfully!" });
      setOperations([{ type: "mint", recipient: "", amount: "" }]);
      await fetchTokenData();
    } catch {
      setStatus({
        show: true,
        type: "error",
        message: error?.message || "Failed to execute operations. Please try again.",
      });
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
        <h1 className="text-4xl font-bold tracking-tight mb-6">Batched Transaction Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Execute multiple token operations in a single transaction using the{" "}
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">useWriteContract</code>{" "}
          hook with multicall.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Token Balance:</h3>
            <button
              onClick={fetchTokenData}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>&#x1f504;</span>
            </button>
          </div>
          <div className="px-6 py-3">
            <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Network: Sepolia</p>
            <p className="text-lg font-medium text-gray-900">
              {isBalanceLoading
                ? "Loading..."
                : tokenBalance
                  ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                  : "Unable to fetch balance"}
            </p>
          </div>
        </div>

        {status.show && <StatusAlert type={status.type} message={status.message} />}

        <div className="space-y-6">
          {operations.map((operation, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-none space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-900">Operation {index + 1}</h4>
                {operations.length > 1 && (
                  <button onClick={() => removeOperation(index)} className="text-red-600 hover:text-red-800 text-sm">
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Operation Type</label>
                <select
                  value={operation.type}
                  onChange={(e) => updateOperation(index, "type", e.target.value)}
                  disabled={isPending}
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
                    disabled={isPending}
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
                  disabled={isPending}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addOperation}
            disabled={isPending}
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 rounded-none transition-colors">
            + Add Operation
          </button>

          <button
            onClick={executeMulticall}
            disabled={
              !isConnected || isPending || operations.some((op) => !op.amount || (op.type === "transfer" && !op.recipient))
            }
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? "Executing Operations..." : "Execute Batch"}
          </button>

          {txHash && <TxResult hash={txHash} />}
        </div>
      </div>
    </div>
  );
}
