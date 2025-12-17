"use client";

import { useState } from "react";
import { useModal, useAccount } from "@getpara/react-sdk";
import { formatEther } from "viem";
import { useDeployContract } from "@/hooks/useDeployContract";
import { useBalance } from "@/hooks/useBalance";
import { PARA_TEST_TOKEN_ABI, PARA_TEST_TOKEN_BYTECODE } from "@/lib/contracts";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { TransactionResult } from "@/components/ui/TransactionResult";

export default function ContractDeploymentPage() {
  const [status, setStatus] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
    show: false,
    type: "success",
    message: "",
  });

  const { isConnected, embedded } = useAccount();
  const address = embedded?.wallets?.[0]?.address as `0x${string}` | undefined;
  const { deployContract, isPending, contractAddress, txHash, error } = useDeployContract();
  const { balance, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance();
  const { openModal } = useModal();

  const handleDeploy = async () => {
    setStatus({ show: false, type: "success", message: "" });

    try {
      setStatus({ show: true, type: "info", message: "Deploying contract. Please confirm the transaction..." });

      await deployContract({
        abi: PARA_TEST_TOKEN_ABI,
        bytecode: PARA_TEST_TOKEN_BYTECODE,
      });

      setStatus({ show: true, type: "success", message: "Contract deployed successfully!" });
      refetchBalance();
    } catch {
      setStatus({
        show: true,
        type: "error",
        message: error?.message || "Failed to deploy contract. Please try again.",
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
        <h1 className="text-4xl font-bold tracking-tight mb-6">Contract Deployment Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Deploy the{" "}
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">ParaTestToken</code>{" "}
          ERC20 contract using the{" "}
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">useDeployContract</code>{" "}
          hook.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">ETH Balance:</h3>
            <button
              onClick={refetchBalance}
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
                : balance !== null
                  ? `${parseFloat(formatEther(balance)).toFixed(4)} ETH`
                  : "Unable to fetch balance"}
            </p>
          </div>
        </div>

        <StatusMessage type={status.type} message={status.message} show={status.show} />

        <button
          onClick={handleDeploy}
          disabled={!isConnected || isPending}
          className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isPending ? "Deploying Contract..." : "Deploy ParaTestToken Contract"}
        </button>

        {contractAddress && (
          <div className="mt-8 space-y-6">
            <div className="rounded-none border border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Contract Address:</h3>
              </div>
              <div className="p-6">
                <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                  {contractAddress}
                </p>
              </div>
            </div>

            {txHash && <TransactionResult txHash={txHash} />}

            <div className="rounded-none border border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Deployed Bytecode:</h3>
              </div>
              <div className="p-6">
                <div className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200 max-h-40 overflow-y-auto">
                  {PARA_TEST_TOKEN_BYTECODE}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
