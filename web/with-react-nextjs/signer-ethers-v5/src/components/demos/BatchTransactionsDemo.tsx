"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { ActionButton } from "@/components/ui/ActionButton";
import { useEvmWalletConnection } from "@/hooks/useEvmWalletConnection";
import { useBatchTransactions, type Operation } from "@/hooks/useBatchTransactions";

export default function BatchTransactionsDemo() {
  const [operations, setOperations] = useState<Operation[]>([{ type: "mint", recipient: "", amount: "" }]);

  const wallet = useEvmWalletConnection();
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
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">Batch Transactions Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Execute multiple token operations in a single transaction using the{" "}
          <code className="rounded-md bg-muted px-2 py-1 text-xs text-foreground">multicall</code> function
          of the ParaTestToken contract.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <Card title="Token Balance" description="Network: Holesky">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-card-foreground">
              {!wallet.isConnected
                ? "Please connect your wallet"
                : isBalanceLoading
                  ? "Loading..."
                  : tokenBalance
                    ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                    : "Unable to fetch balance"}
            </p>
            <button
              type="button"
              onClick={fetchTokenData}
              disabled={isBalanceLoading || !wallet.isConnected}
              className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
              title="Refresh balance">
              {isBalanceLoading ? "Loading" : "Refresh"}
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
                  <label className="block text-sm font-medium text-foreground">Operation Type</label>
                  <select
                    value={operation.type}
                    onChange={(e) => updateOperation(index, "type", e.target.value)}
                    disabled={isLoading}
                    className="field-control">
                    <option value="mint">Mint</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>

                {operation.type === "transfer" && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">Recipient Address</label>
                    <input
                      type="text"
                      value={operation.recipient}
                      onChange={(e) => updateOperation(index, "recipient", e.target.value)}
                      placeholder="0x..."
                      disabled={isLoading}
                      className="field-control"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">Amount (CTT)</label>
                  <input
                    type="number"
                    value={operation.amount}
                    onChange={(e) => updateOperation(index, "amount", e.target.value)}
                    placeholder="0.0"
                    step="0.01"
                    disabled={isLoading}
                    className="field-control"
                  />
                </div>

                {operations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOperation(index)}
                    className="text-sm font-medium text-destructive underline-offset-4 hover:underline">
                    Remove Operation
                  </button>
                )}
              </div>
            </Card>
          ))}

          <button
            type="button"
            onClick={addOperation}
            disabled={isLoading}
            className="btn-secondary w-full border-dashed px-4 py-2 text-sm disabled:opacity-50">
            Add Operation
          </button>

          <ActionButton
            onClick={handleExecute}
            isLoading={isLoading}
            disabled={
              !isReady ||
              !wallet.isConnected ||
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
