"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useWallet } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import { useParaSigner } from "@/hooks/useParaSigner";
import ParaTestToken from "@/contracts/artifacts/contracts/ParaTestToken.sol/ParaTestToken.json";

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

  const account = useAccount();
  const { data: wallet } = useWallet();
  const { signer, provider } = useParaSigner();

  const fetchBalance = async () => {
    if (!wallet?.address || !provider) return;

    setIsBalanceLoading(true);
    try {
      const balanceWei = await provider.getBalance(wallet.address);
      setBalance(ethers.utils.formatEther(balanceWei));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (wallet?.address) {
      fetchBalance();
    }
  }, [wallet?.address]);

  const deployContract = async () => {
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setDeploymentInfo(null);

    if (!signer) return;

    try {
      if (!account?.isConnected) {
        throw new Error("Please connect your wallet to deploy the contract.");
      }

      if (!wallet?.id) {
        throw new Error("No wallet ID found. Please reconnect your wallet.");
      }

      const factory = new ethers.ContractFactory(ParaTestToken.abi, ParaTestToken.bytecode, signer);

      setStatus({
        show: true,
        type: "info",
        message: "Deploying contract. Please confirm the transaction in your wallet...",
      });

      const contract = await factory.deploy();

      setStatus({
        show: true,
        type: "info",
        message: "Contract deployment transaction submitted. Waiting for confirmation...",
      });

      // Wait for deployment
      await contract.deployed();

      setDeploymentInfo({
        contractAddress: contract.address,
        transactionHash: contract.deployTransaction.hash,
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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Contract Deployment</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Deploy an ERC20 token contract using the Para SDK with ethers.js v5 integration. This demo uses the{" "}
          <code className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-md">ParaTestToken</code>{" "}
          contract implementation.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card title="Current Balance" description="Network: Holesky">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-gray-900">
              {!wallet?.address
                ? "Please connect your wallet"
                : isBalanceLoading
                ? "Loading..."
                : balance
                ? `${parseFloat(balance).toFixed(4)} ETH`
                : "Unable to fetch balance"}
            </p>
            <button
              onClick={fetchBalance}
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

        <button
          onClick={deployContract}
          className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!account?.isConnected || isLoading}>
          {isLoading ? "Deploying Contract..." : "Deploy Contract"}
        </button>

        {deploymentInfo && (
          <div className="mt-8 space-y-4">
            <Card title="Contract Address">
              <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-4 border border-gray-200">
                {deploymentInfo.contractAddress}
              </p>
              <a
                href={`https://holesky.etherscan.io/address/${deploymentInfo.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
                View on Etherscan
              </a>
            </Card>

            <Card title="Transaction Hash">
              <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-4 border border-gray-200">
                {deploymentInfo.transactionHash}
              </p>
              <a
                href={`https://holesky.etherscan.io/tx/${deploymentInfo.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
                View on Etherscan
              </a>
            </Card>

            <Card title="Contract Bytecode">
              <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-4 border border-gray-200">
                {deploymentInfo.deployedBytecode
                  ? `${deploymentInfo.deployedBytecode.slice(0, 128)}...${deploymentInfo.deployedBytecode.slice(
                      -128
                    )}`
                  : ""}
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
