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
        throw new Error("Invalid JSON in query message.");
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
        throw new Error("Invalid JSON in execute message.");
      }
      throw err;
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">CosmWasm Contract Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Interact with CosmWasm smart contracts. Query contract state and execute contract methods
          directly from your wallet.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Query Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Query Contract</h2>

            <div className="space-y-4">
              <div className="space-y-3">
                <label htmlFor="contract-query" className="block text-sm font-medium text-gray-700">
                  Contract Address
                </label>
                <input
                  type="text"
                  id="contract-query"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none"
                  placeholder="cosmos1..."
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="query-msg" className="block text-sm font-medium text-gray-700">
                  Query Message (JSON)
                </label>
                <textarea
                  id="query-msg"
                  value={queryMsg}
                  onChange={(e) => setQueryMsg(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none font-mono text-sm"
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
                <div className="mt-4 rounded-none border border-gray-200">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Query Result:</h3>
                  </div>
                  <div className="p-6">
                    <pre className="text-sm font-mono bg-white p-4 border border-gray-200 overflow-auto">
                      {JSON.stringify(queryResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Execute Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Execute Contract</h2>

            {error && <StatusAlert type="error" message={error.message} />}
            {txHash && (
              <StatusAlert
                type="success"
                message={`Contract executed successfully! Gas used: ${gasUsed}`}
              />
            )}

            <div className="space-y-4">
              <div className="space-y-3">
                <label htmlFor="execute-msg" className="block text-sm font-medium text-gray-700">
                  Execute Message (JSON)
                </label>
                <textarea
                  id="execute-msg"
                  value={executeMsg}
                  onChange={(e) => setExecuteMsg(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none font-mono text-sm"
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
                <div className="mt-4 rounded-none border border-gray-200">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Transaction Details:</h3>
                  </div>
                  <div className="p-6">
                    <DataField label="Transaction Hash:" value={txHash} mono />
                  </div>
                </div>
              )}
            </div>

            {/* Example Messages */}
            <div className="mt-6 rounded-none border border-gray-200 bg-gray-50">
              <div className="px-6 py-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Example Messages</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">CW20 Transfer:</p>
                    <code className="block bg-white p-2 border border-gray-200 text-xs">
                      {'{"transfer": {"recipient": "cosmos1...", "amount": "1000000"}}'}
                    </code>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">CW20 Balance Query:</p>
                    <code className="block bg-white p-2 border border-gray-200 text-xs">
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
