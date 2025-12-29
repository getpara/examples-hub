"use client";

import { useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { ActionButton } from "@/components/ui/ActionButton";
import { useBatchTransactions, type Operation } from "@/hooks/useBatchTransactions";

export default function BatchTransactionsPage() {
  const [operations, setOperations] = useState<Operation[]>([{ type: "mint", recipient: "", amount: "" }]);

  const account = useAccount();
  const { executeMulticall, fetchTokenData, tokenBalance, txHash, isLoading, isBalanceLoading, isReady, error, reset } =
    useBatchTransactions();

  const addOperation = () => {
    setOperations([...operations, { type: "mint", recipient: "", amount: "" }]);
  };

  const removeOperation = (index: number) => {
    setOperations(operations.filter((_, i) => i !== index));
  };

  const updateOperation = (index: number, field: keyof Operation, value: string) => {
    const newOperations = [...operations];
    if (field === "type") {
      newOperations[index] = { type: value as "mint" | "transfer", recipient: "", amount: "" };
    } else {
      newOperations[index] = { ...newOperations[index], [field]: value };
    }
    setOperations(newOperations);
  };

  const handleExecute = async () => {
    reset();
    await executeMulticall(operations);
    setOperations([{ type: "mint", recipient: "", amount: "" }]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Batch Transactions</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Execute multiple token operations in a single transaction using the{" "}
          <code className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-md">multicall</code> function
          of the ParaTestToken contract.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card title="Token Balance" description="Network: Holesky">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-gray-900">
              {!account?.isConnected
                ? "Please connect your wallet"
                : isBalanceLoading
                  ? "Loading..."
                  : tokenBalance
                    ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                    : "Unable to fetch balance"}
            </p>
            <button
              onClick={fetchTokenData}
              disabled={isBalanceLoading || !account?.isConnected}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>&#8635;</span>
            </button>
          </div>
        </Card>

        {error && <StatusAlert type="error" message={error.message} />}
        {txHash && <StatusAlert type="success" message="Batched operations executed successfully!" />}

        <div className="space-y-6">
          {operations.map((operation, index) => (
            <Card key={index} title={`Operation ${index + 1}`}>
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
                  <button onClick={() => removeOperation(index)} className="text-red-600 hover:text-red-800 text-sm">
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

          <ActionButton
            onClick={handleExecute}
            isLoading={isLoading}
            disabled={
              !isReady ||
              !account?.isConnected ||
              operations.some((op) => !op.amount || (op.type === "transfer" && !op.recipient))
            }
            loadingText="Executing Operations...">
            Execute Batch
          </ActionButton>

          {txHash && <TxResult hash={txHash} />}
        </div>
      </div>
    </div>
  );
}
