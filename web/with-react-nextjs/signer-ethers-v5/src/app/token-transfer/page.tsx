"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useWallet } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import { useParaSigner } from "@/hooks/useParaSigner";

// ERC20 minimal ABI for transfer function
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

const PARA_TEST_TOKEN_CONTRACT_ADDRESS = "0x83cC70475A0d71EF1F2F61FeDE625c8C7E90C3f2";

export default function TokenTransferPage() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [contractAddress, setContractAddress] = useState(PARA_TEST_TOKEN_CONTRACT_ADDRESS);
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>("CTT");
  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const { data: account } = useAccount();
  const { data: wallet } = useWallet();
  const { signer, provider } = useParaSigner();

  const fetchBalances = async () => {
    if (!wallet?.address || !provider) return;

    setIsBalanceLoading(true);
    try {
      // Fetch ETH balance
      const ethBalanceWei = await provider.getBalance(wallet.address);
      setEthBalance(ethers.utils.formatEther(ethBalanceWei));

      // Fetch token balance
      const tokenContract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
      const decimals = await tokenContract.decimals();
      const balance = await tokenContract.balanceOf(wallet.address);
      const symbol = await tokenContract.symbol();

      setTokenSymbol(symbol);
      setTokenBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error("Error fetching balances:", error);
      setEthBalance(null);
      setTokenBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (wallet?.address && contractAddress) {
      fetchBalances();
    }
  }, [wallet?.address, contractAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setTxHash("");

    if (!signer) return;

    try {
      if (!account?.isConnected) {
        throw new Error("Please connect your wallet to send tokens.");
      }

      if (!wallet?.id) {
        throw new Error("No wallet ID found. Please reconnect your wallet.");
      }

      // Validate address format
      if (!to.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid recipient address format.");
      }

      // Validate amount
      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        throw new Error("Please enter a valid amount greater than 0.");
      }

      // Create contract instance with signer
      const tokenContract = new ethers.Contract(contractAddress, ERC20_ABI, signer);

      setStatus({
        show: true,
        type: "info",
        message: "Please confirm the transaction in your wallet...",
      });

      // Send transfer transaction
      const tx = await tokenContract.transfer(to, ethers.utils.parseEther(amount));
      console.log("Transaction submitted:", tx);

      setTxHash(tx.hash);
      setStatus({
        show: true,
        type: "info",
        message: "Transaction submitted. Waiting for confirmation...",
      });

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      setStatus({
        show: true,
        type: "success",
        message: "Tokens transferred successfully!",
      });

      // Refresh balances after confirmed transaction
      await fetchBalances();

      setTo("");
      setAmount("");
    } catch (error) {
      console.error("Error transferring tokens:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to transfer tokens. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Token Transfer</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transfer {tokenSymbol} tokens using the Para SDK with ethers.js integration. The example shows querying for
          ERC20 token data directly from contract and submitting a transfer transaction.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 space-y-4">
          <Card title="Current Balances" description="Network: Holesky">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">ETH Balance (for gas fees):</p>
                  <p className="text-lg font-medium text-gray-900">
                    {!wallet?.address
                      ? "Please connect your wallet"
                      : isBalanceLoading
                      ? "Loading..."
                      : ethBalance
                      ? `${parseFloat(ethBalance).toFixed(4)} ETH`
                      : "Unable to fetch balance"}
                  </p>
                </div>
                <button
                  onClick={fetchBalances}
                  disabled={isBalanceLoading || !wallet?.address}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                  title="Refresh balances">
                  <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
                </button>
              </div>
              <div>
                <p className="text-sm text-gray-600">{tokenSymbol} Balance:</p>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {!wallet?.address
                      ? "Please connect your wallet"
                      : isBalanceLoading
                      ? "Loading..."
                      : tokenBalance
                      ? `${parseFloat(tokenBalance).toFixed(4)} ${tokenSymbol}`
                      : "Unable to fetch balance"}
                  </p>
                  {tokenBalance === "0.0" && (
                    <div className="bg-blue-50 border border-blue-200 p-3 text-sm">
                      <p className="text-blue-700 mb-2">
                        You don&apos;t have any {tokenSymbol} tokens yet. You&apos;ll need some tokens before you can make
                        transfers.
                      </p>
                      <a
                        href="/contract-interaction"
                        className="text-blue-900 hover:text-blue-950 font-medium underline">
                        Click here to mint some {tokenSymbol} tokens →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
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

        <form
          onSubmit={handleSubmit}
          className="space-y-4">
          <div className="space-y-3">
            <label
              htmlFor="contractAddress"
              className="block text-sm font-medium text-gray-700">
              Token Contract Address
            </label>
            <input
              id="contractAddress"
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="to"
              className="block text-sm font-medium text-gray-700">
              Recipient Address
            </label>
            <input
              id="to"
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x..."
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700">
              Amount ({tokenSymbol})
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.01"
              required
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!to || !amount || isLoading}>
            {isLoading ? "Sending Tokens..." : "Send Tokens"}
          </button>

          {txHash && (
            <Card title="Transaction Hash">
              <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-4 border border-gray-200">
                {txHash}
              </p>
              <a
                href={`https://holesky.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
                View on Etherscan
              </a>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}
