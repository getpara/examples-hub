"use client";

import { useState } from "react";
import { useCosmWasmContract } from "@/hooks/useCosmWasmContract";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { ActionButton } from "@/components/ui/ActionButton";
import { DataField } from "@/components/ui/DataField";

export default function CosmWasmInteractionPage() {
  const [contractAddress, setContractAddress] = useState("");
  const [queryMsg, setQueryMsg] = useState('{"balance": {"address": "YOUR_ADDRESS_HERE"}}');
  const [executeMsg, setExecuteMsg] = useState(
    '{"transfer": {"recipient": "cosmos1...", "amount": "1000000"}}'
  );

  const { queryContract, executeContract, queryResult, txHash, gasUsed, isLoading, isReady, error, reset } =
    useCosmWasmContract();

  const handleQuery = async () => {
    reset();
    try {
      const parsedQuery = JSON.parse(queryMsg);
      await queryContract(contractAddress, parsedQuery);
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error("Invalid JSON in query message.", { cause: err });
      }
      throw err;
    }
  };

  const handleExecute = async () => {
    reset();
    try {
      const parsedMsg = JSON.parse(executeMsg);
      await executeContract(contractAddress, parsedMsg);
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error("Invalid JSON in execute message.", { cause: err });
      }
      throw err;
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">CosmWasm Contract Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Interact with CosmWasm smart contracts. Query contract state and execute contract methods
          directly from your wallet.
        </p>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Query Section */}
          <div>
            <h2 className="text-lg font-semibold text-card-foreground mb-4">Query Contract</h2>

            <div className="space-y-4">
              <div className="space-y-3">
                <label htmlFor="contract-query" className="block text-sm font-medium text-foreground">
                  Contract Address
                </label>
                <input
                  type="text"
                  id="contract-query"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="field-control"
                  placeholder="cosmos1..."
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="query-msg" className="block text-sm font-medium text-foreground">
                  Query Message (JSON)
                </label>
                <textarea
                  id="query-msg"
                  value={queryMsg}
                  onChange={(e) => setQueryMsg(e.target.value)}
                  className="field-control font-mono text-sm"
                  rows={4}
                  placeholder='{"balance": {"address": "cosmos1..."}}'
                />
              </div>

              <ActionButton
                onClick={handleQuery}
                isLoading={isLoading}
                disabled={!contractAddress}
                loadingText="Querying...">
                Query Contract
              </ActionButton>

              {queryResult !== null && (
                <div className="mt-4 rounded-2xl border border-border bg-card">
                  <div className="px-6 py-4 border-b border-border/60 bg-muted/60">
                    <h3 className="text-sm font-medium text-card-foreground">Query Result:</h3>
                  </div>
                  <div className="p-6">
                    <pre className="overflow-auto rounded-xl bg-muted/60 px-4 py-3 font-mono text-xs leading-relaxed text-muted-foreground">
                      {JSON.stringify(queryResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Execute Section */}
          <div>
            <h2 className="text-lg font-semibold text-card-foreground mb-4">Execute Contract</h2>

            {error && <StatusAlert type="error" message={error.message} />}
            {txHash && (
              <StatusAlert
                type="success"
                message={`Contract executed successfully! Gas used: ${gasUsed}`}
              />
            )}

            <div className="space-y-4">
              <div className="space-y-3">
                <label htmlFor="execute-msg" className="block text-sm font-medium text-foreground">
                  Execute Message (JSON)
                </label>
                <textarea
                  id="execute-msg"
                  value={executeMsg}
                  onChange={(e) => setExecuteMsg(e.target.value)}
                  className="field-control font-mono text-sm"
                  rows={4}
                  placeholder='{"transfer": {"recipient": "cosmos1...", "amount": "1000000"}}'
                />
              </div>

              <ActionButton
                onClick={handleExecute}
                isLoading={isLoading}
                disabled={!isReady || !contractAddress}
                loadingText="Executing...">
                Execute Contract
              </ActionButton>

              {txHash && (
                <div className="mt-4 rounded-2xl border border-border bg-card">
                  <div className="px-6 py-4 border-b border-border/60 bg-muted/60">
                    <h3 className="text-sm font-medium text-card-foreground">Transaction Details:</h3>
                  </div>
                  <div className="p-6">
                    <DataField label="Transaction Hash:" value={txHash} mono />
                  </div>
                </div>
              )}
            </div>

            {/* Example Messages */}
            <div className="mt-6 rounded-2xl border border-border bg-muted/60">
              <div className="px-6 py-4">
                <h3 className="text-sm font-medium text-card-foreground mb-2">Example Messages</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">CW20 Transfer:</p>
                    <code className="block rounded-lg bg-card px-3 py-2 text-xs text-muted-foreground">
                      {'{"transfer": {"recipient": "cosmos1...", "amount": "1000000"}}'}
                    </code>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">CW20 Balance Query:</p>
                    <code className="block rounded-lg bg-card px-3 py-2 text-xs text-muted-foreground">
                      {'{"balance": {"address": "cosmos1..."}}'}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
