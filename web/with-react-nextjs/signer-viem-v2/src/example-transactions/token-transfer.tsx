"use client";

import { usePara } from "@/components/ParaProvider";
import { useState, useEffect } from "react";
import { PARA_TEST_TOKEN_CONTRACT_ADDRESS } from ".";
import { formatEther, getContract, parseEther } from "viem";

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

export default function TokenTransferDemo() {
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

  const { isConnected, walletId, address, walletClient, publicClient } = usePara();

  const fetchBalances = async () => {
    if (!address || !publicClient) return;

    setIsBalanceLoading(true);
    try {
      // Fetch ETH balance
      const ethBalanceWei = await publicClient.getBalance({
        address: address,
      });
      setEthBalance(formatEther(ethBalanceWei));

      // Fetch token balance
      const tokenContract = getContract({
        address: contractAddress as `0x${string}`,
        abi: ERC20_ABI,
        client: publicClient!,
      });

      const decimals = await tokenContract.read.decimals();
      const balance = await tokenContract.read.balanceOf([address]);
      const symbol = await tokenContract.read.symbol();

      setTokenSymbol(symbol as string);
      setTokenBalance(formatEther(balance as bigint));
    } catch (error) {
      console.error("Error fetching balances:", error);
      setEthBalance(null);
      setTokenBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (address && contractAddress) {
      fetchBalances();
    }
  }, [address, contractAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setTxHash("");

    try {
      if (!isConnected) {
        throw new Error("Please connect your wallet to send tokens.");
      }

      if (!walletId) {
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

      // Create contract instance with both clients
      const tokenContract = getContract({
        address: contractAddress as `0x${string}`,
        abi: ERC20_ABI,
        client: {
          public: publicClient!,
          wallet: walletClient!,
        },
      });

      setStatus({
        show: true,
        type: "info",
        message: "Please confirm the transaction in your wallet...",
      });

      const hash = await tokenContract.write.transfer([to, parseEther(amount)], {
        account: address,
      });

      console.log("Transaction submitted:", hash);

      setTxHash(hash);
      setStatus({
        show: true,
        type: "info",
        message: "Transaction submitted. Waiting for confirmation...",
      });

      const receipt = await publicClient!.waitForTransactionReceipt({
        hash,
      });

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
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Token Transfer Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transfer {tokenSymbol} tokens using the Para SDK with ethers.js integration. The example shows querying for
          ERC20 token data directly from contract and submitting a transfer transaction.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 space-y-4">
          <div className="rounded-none border border-gray-200">
            <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Current Balances:</h3>
              <button
                onClick={fetchBalances}
                disabled={isBalanceLoading || !address}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                title="Refresh balances">
                <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
              </button>
            </div>
            <div className="px-6 py-3 space-y-2">
              <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Network: Holesky</p>
              <div>
                <p className="text-sm text-gray-600">ETH Balance (for gas fees):</p>
                <p className="text-lg font-medium text-gray-900">
                  {!address
                    ? "Please connect your wallet"
                    : isBalanceLoading
                    ? "Loading..."
                    : ethBalance
                    ? `${parseFloat(ethBalance).toFixed(4)} ETH`
                    : "Unable to fetch balance"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{tokenSymbol} Balance:</p>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {!address
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
                        You don't have any {tokenSymbol} tokens yet. You'll need some tokens before you can make
                        transfers.
                      </p>
                      <a
                        href="/demo/contract-interaction"
                        className="text-blue-900 hover:text-blue-950 font-medium underline">
                        Click here to mint some {tokenSymbol} tokens →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
              className="block w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
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
              className="block w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
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
              className="block w-full px-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-none bg-blue-900 px-6 py-3 text-sm font-medium text-white hover:bg-blue-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!to || !amount || isLoading}>
            {isLoading ? "Sending Tokens..." : "Send Tokens"}
          </button>

          {txHash && (
            <div className="mt-8 rounded-none border border-gray-200">
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Transaction Hash:</h3>
                <a
                  href={`https://holesky.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm bg-blue-900 text-white hover:bg-blue-950 transition-colors rounded-none">
                  View on Etherscan
                </a>
              </div>
              <div className="p-6">
                <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                  {txHash}
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
