"use client";

import { useModal, useAccount } from "@getpara/react-sdk";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useState, useEffect } from "react";
import ParaTestToken from "@/contracts/artifacts/contracts/ParaTestToken.sol/ParaTestToken.json";
import { formatEther } from "viem";

export default function ContractDeploymentPage() {
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

  const { isConnected, address, walletClient, publicClient, walletId } = useParaSigner();
  const { openModal } = useModal();

  const fetchBalance = async () => {
    if (!address || !publicClient) return;

    setIsBalanceLoading(true);
    try {
      const balanceWei = await publicClient.getBalance({
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

      // Deploy the contract using viem
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

      // Refresh balance
      await fetchBalance();
    } catch (error) {
      console.error("Contract deployment error:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to deploy contract. Please try again.",
      });
    } finally {
      setIsLoading(false);
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
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-950 transition-colors">
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
          ERC20 contract on the Holesky testnet. This contract includes features like minting, burning, and permits.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">ETH Balance:</h3>
            <button
              onClick={fetchBalance}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
            </button>
          </div>
          <div className="px-6 py-3">
            <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Network: Holesky</p>
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
                : "bg-gray-50 border-gray-500 text-gray-700"
            }`}>
            <p className="px-6 py-4 break-words">{status.message}</p>
          </div>
        )}

        <button
          onClick={deployContract}
          disabled={!isConnected || isLoading}
          className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? "Deploying Contract..." : "Deploy ParaTestToken Contract"}
        </button>

        {deploymentInfo && (
          <div className="mt-8 space-y-6">
            <div className="rounded-none border border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Contract Address:</h3>
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
                  className="px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
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
                <h3 className="text-sm font-medium text-gray-900">Deployed Bytecode:</h3>
              </div>
              <div className="p-6">
                <div className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200 max-h-40 overflow-y-auto">
                  {deploymentInfo.deployedBytecode}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}