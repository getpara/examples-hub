"use client";

import { useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useAccountAddress } from "@/hooks/useAccountAddress";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DEFAULT_CHAIN } from "@/config/chains";

// Example CW20 token contract interface
interface CW20ExecuteMsg {
  transfer?: {
    recipient: string;
    amount: string;
  };
  burn?: {
    amount: string;
  };
  increase_allowance?: {
    spender: string;
    amount: string;
  };
}

export default function CosmWasmInteractionPage() {
  const [contractAddress, setContractAddress] = useState("");
  const [queryMsg, setQueryMsg] = useState('{"balance": {"address": "YOUR_ADDRESS_HERE"}}');
  const [executeMsg, setExecuteMsg] = useState('{"transfer": {"recipient": "cosmos1...", "amount": "1000000"}}');
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const account = useAccount();
  const { signingClient } = useParaSigner();
  const address = useAccountAddress();

  const queryContract = async () => {
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setQueryResult(null);

    try {
      if (!contractAddress) {
        throw new Error("Please enter a contract address.");
      }

      let parsedQuery;
      try {
        parsedQuery = JSON.parse(queryMsg);
      } catch {
        throw new Error("Invalid JSON in query message.");
      }

      const client = await CosmWasmClient.connect(DEFAULT_CHAIN.rpc);
      const result = await client.queryContractSmart(contractAddress, parsedQuery);

      setQueryResult(JSON.stringify(result, null, 2));
      setStatus({
        show: true,
        type: "success",
        message: "Query executed successfully!",
      });
    } catch (error) {
      console.error("Error querying contract:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to query contract. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeContract = async () => {
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setTxHash(null);

    try {
      if (!account?.isConnected || !address) {
        throw new Error("Please connect your wallet to execute contract.");
      }

      if (!signingClient) {
        throw new Error("Signing client not initialized. Please try reconnecting.");
      }

      if (!contractAddress) {
        throw new Error("Please enter a contract address.");
      }

      let parsedMsg;
      try {
        parsedMsg = JSON.parse(executeMsg);
      } catch {
        throw new Error("Invalid JSON in execute message.");
      }

      setStatus({
        show: true,
        type: "info",
        message: "Please confirm the transaction in your wallet...",
      });

      const result = await (signingClient as any).execute(
        address,
        contractAddress,
        parsedMsg,
        "auto",
        "CosmWasm execution via Para + CosmJS"
      );

      setTxHash(result.transactionHash);
      setStatus({
        show: true,
        type: "success",
        message: `Contract executed successfully! Gas used: ${result.gasUsed}`,
      });
    } catch (error) {
      console.error("Error executing contract:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to execute contract. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">CosmWasm Contract Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Interact with CosmWasm smart contracts. Query contract state and execute contract methods directly from your wallet.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Query Contract</h2>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <label
                  htmlFor="contract-query"
                  className="block text-sm font-medium text-gray-700">
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
                <label
                  htmlFor="query-msg"
                  className="block text-sm font-medium text-gray-700">
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

              <button
                onClick={queryContract}
                className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !contractAddress}>
                {isLoading ? "Querying..." : "Query Contract"}
              </button>

              {queryResult && (
                <div className="mt-4 rounded-none border border-gray-200">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Query Result:</h3>
                  </div>
                  <div className="p-6">
                    <pre className="text-sm font-mono bg-white p-4 border border-gray-200 overflow-auto">
                      {queryResult}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Execute Contract</h2>
            
            {status.show && status.type !== "success" && (
              <div
                className={`mb-4 rounded-none border ${
                  status.type === "error"
                    ? "bg-red-50 border-red-500 text-red-700"
                    : "bg-gray-50 border-gray-500 text-gray-700"
                }`}>
                <p className="px-6 py-4 break-words">{status.message}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-3">
                <label
                  htmlFor="execute-msg"
                  className="block text-sm font-medium text-gray-700">
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

              <button
                onClick={executeContract}
                className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !account?.isConnected || !contractAddress}>
                {isLoading ? "Executing..." : "Execute Contract"}
              </button>

              {txHash && (
                <div className="mt-4 rounded-none border border-gray-200">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Transaction Details:</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Transaction Hash:</p>
                        <p className="text-sm font-mono bg-white p-4 border border-gray-200 break-all">
                          {txHash}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

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