"use client";

import { usePara } from "@/components/ParaProvider";
import { useState, useEffect } from "react";
import ParaTestToken from "@/contracts/artifacts/contracts/ParaTestToken.sol/ParaTestToken.json";
import { formatEther } from "viem";

export default function ContractDeploymentDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [deploymentInfo, setDeploymentInfo] = useState<{
    contractAddress: string;
    transactionHash: string;
    deployedBytecode: string;
  } | null>(null);
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const { isConnected, walletId, address, publicClient, walletClient } = usePara();

  const fetchBalance = async () => {
    if (!address) return;

    setIsBalanceLoading(true);
    try {
      const balanceWei = await publicClient!.getBalance({
        address: address,
      });
      setBalance(formatEther(balanceWei));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchBalance();
    }
  }, [address]);

  const deployContract = async () => {
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setDeploymentInfo(null);

    try {
      if (!isConnected) {
        throw new Error("Please connect your wallet to deploy the contract.");
      }

      if (!walletId) {
        throw new Error("No wallet ID found. Please reconnect your wallet.");
      }

      setStatus({
        show: true,
        type: "info",
        message: "Deploying contract. Please confirm the transaction in your wallet...",
      });

      const hash = await walletClient!.deployContract({
        abi: ParaTestToken.abi,
        bytecode: (ParaTestToken.bytecode.startsWith("0x")
          ? ParaTestToken.bytecode
          : `0x${ParaTestToken.bytecode}`) as `0x${string}`,
        account: address!,
        chain: publicClient!.chain,
      });

      setStatus({
        show: true,
        type: "info",
        message: "Contract deployment transaction submitted. Waiting for confirmation...",
      });

      // Wait for transaction receipt
      const receipt = await publicClient!.waitForTransactionReceipt({
        hash,
      });

      // Get the deployed contract address from the receipt
      const contractAddress = receipt.contractAddress;

      if (!contractAddress) {
        throw new Error("Failed to get contract address from receipt");
      }

      setDeploymentInfo({
        contractAddress: contractAddress,
        transactionHash: receipt.transactionHash,
        deployedBytecode: ParaTestToken.bytecode,
      });

      setStatus({
        show: true,
        type: "success",
        message: "Contract deployed successfully!",
      });

      // Refresh balance after deployment
      await fetchBalance();
    } catch (error) {
      console.error("Error deploying contract:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to deploy contract. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Contract Deployment Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Deploy an ERC20 token contract using the Para SDK with ethers.js v6 integration. This demo uses the{" "}
          <code className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md">ParaTestToken</code>{" "}
          contract implementation.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Current Balance:</h3>
            <button
              onClick={fetchBalance}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
            </button>
          </div>
          <div className="px-6 py-3">
            <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md mb-2">Network: Holesky</p>
            <p className="text-lg font-medium text-gray-900">
              {!address
                ? "Please connect your wallet"
                : isBalanceLoading
                ? "Loading..."
                : balance
                ? `${parseFloat(balance).toFixed(4)} ETH`
                : "Unable to fetch balance"}
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
                : "bg-blue-50 border-blue-500 text-blue-700"
            }`}>
            <p className="px-6 py-4 break-words">{status.message}</p>
          </div>
        )}

        <button
          onClick={deployContract}
          className="w-full rounded-none bg-blue-900 px-6 py-3 text-sm font-medium text-white hover:bg-blue-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isConnected || isLoading}>
          {isLoading ? "Deploying Contract..." : "Deploy Contract"}
        </button>

        {deploymentInfo && (
          <div className="mt-8 space-y-4">
            <div className="rounded-none border border-gray-200">
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Contract Address:</h3>
                <a
                  href={`https://holesky.etherscan.io/address/${deploymentInfo.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm bg-blue-900 text-white hover:bg-blue-950 transition-colors rounded-none">
                  View on Etherscan
                </a>
              </div>
              <div className="p-6">
                <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                  {deploymentInfo.contractAddress}
                </p>
              </div>
            </div>

            <div className="rounded-none border border-gray-200">
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Transaction Hash:</h3>
                <a
                  href={`https://holesky.etherscan.io/tx/${deploymentInfo.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm bg-blue-900 text-white hover:bg-blue-950 transition-colors rounded-none">
                  View on Etherscan
                </a>
              </div>
              <div className="p-6">
                <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                  {deploymentInfo.transactionHash}
                </p>
              </div>
            </div>

            <div className="rounded-none border border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Contract Bytecode:</h3>
              </div>
              <div className="p-6">
                <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                  {deploymentInfo.deployedBytecode
                    ? `${deploymentInfo.deployedBytecode.slice(0, 128)}...${deploymentInfo.deployedBytecode.slice(
                        -128
                      )}`
                    : ""}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
