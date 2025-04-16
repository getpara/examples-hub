"use client";

import { usePara } from "@/components/ParaProvider";
import { useState, useEffect } from "react";
import { PARA_TEST_TOKEN_CONTRACT_ADDRESS } from ".";
import ParaTestToken from "@/contracts/artifacts/contracts/ParaTestToken.sol/ParaTestToken.json";
import { formatEther, getContract, parseEther } from "viem";

export default function ContractInteractionDemo() {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [mintedAmount, setMintedAmount] = useState<string | null>(null);
  const [mintLimit, setMintLimit] = useState<string | null>(null);
  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const { isConnected, walletId, address, walletClient, publicClient } = usePara();

  const fetchContractData = async () => {
    if (!address) return;

    setIsBalanceLoading(true);
    try {
      const contract = getContract({
        address: PARA_TEST_TOKEN_CONTRACT_ADDRESS,
        abi: ParaTestToken.abi,
        publicClient: publicClient!,
      });

      const balance = await contract.read.balanceOf([address]);

      setTokenBalance(formatEther(balance as bigint));

      const minted = await contract.read.mintedAmount([address]);
      setMintedAmount(formatEther(minted as bigint));

      const limit = await contract.read.MINT_LIMIT();
      setMintLimit(formatEther(limit as bigint));
    } catch (error) {
      console.error("Error fetching contract data:", error);
      setTokenBalance(null);
      setMintedAmount(null);
      setMintLimit(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchContractData();
    }
  }, [address]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setTxHash("");

    try {
      if (!isConnected) {
        throw new Error("Please connect your wallet to mint tokens.");
      }

      if (!walletId) {
        throw new Error("No wallet ID found. Please reconnect your wallet.");
      }

      // Validate amount
      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        throw new Error("Please enter a valid amount greater than 0.");
      }

      // Check if mint would exceed limit
      if (mintedAmount && mintLimit) {
        const currentMinted = parseFloat(mintedAmount);
        const limit = parseFloat(mintLimit);
        const requestedAmount = amountFloat;

        if (currentMinted + requestedAmount > limit) {
          throw new Error(`Minting ${requestedAmount} tokens would exceed your limit of ${limit} tokens.`);
        }
      }

      const contract = getContract({
        address: PARA_TEST_TOKEN_CONTRACT_ADDRESS,
        abi: ParaTestToken.abi,
        publicClient: publicClient!,
        walletClient: walletClient!,
      });

      // Execute the mint function
      const hash = await contract.write.mint([parseEther(amount)], {
        account: address,
      });

      setTxHash(hash);

      setStatus({
        show: true,
        type: "info",
        message: "Transaction submitted. Waiting for confirmation...",
      });

      // Wait for transaction to be mined
      const receipt = await publicClient!.waitForTransactionReceipt({
        hash,
      });

      setStatus({
        show: true,
        type: "success",
        message: `Successfully minted ${amount} CTT tokens!`,
      });

      await fetchContractData();

      setAmount("");
    } catch (error) {
      console.error("Error minting tokens:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to mint tokens. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Contract Interaction Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          This demo shows how to interact with a deployed contract. Mint CTT tokens by interacting with the smart
          contract. Each address can mint up to 10 CTT tokens.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Contract Information:</h3>
            <button
              onClick={fetchContractData}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh data">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
            </button>
          </div>
          <div className="px-6 py-3 space-y-2">
            <div>
              <p className="text-sm text-gray-600">Current Balance:</p>
              <p className="text-lg font-medium text-gray-900">
                {!address
                  ? "Please connect your wallet"
                  : isBalanceLoading
                  ? "Loading..."
                  : tokenBalance
                  ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                  : "Unable to fetch balance"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount Minted:</p>
              <p className="text-lg font-medium text-gray-900">
                {!address
                  ? "Please connect your wallet"
                  : isBalanceLoading
                  ? "Loading..."
                  : mintedAmount && mintLimit
                  ? `${parseFloat(mintedAmount).toFixed(4)} / ${parseFloat(mintLimit).toFixed(4)} CTT`
                  : "Unable to fetch minted amount"}
              </p>
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
          onSubmit={handleMint}
          className="space-y-4">
          <div className="space-y-3">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700">
              Amount to Mint (CTT)
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
            disabled={!amount || isLoading || !isConnected}>
            {isLoading ? "Minting Tokens..." : "Mint Tokens"}
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

          {mintedAmount && mintLimit && parseFloat(mintedAmount) >= parseFloat(mintLimit) && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 text-yellow-800">
              <p>You have reached your minting limit. No more tokens can be minted to this address.</p>
            </div>
          )}
        </form>

        <div className="mt-8 text-center">
          <a
            href="/demo/token-transfer"
            className="text-blue-900 hover:text-blue-950 text-sm font-medium">
            → Go to Token Transfer Demo
          </a>
        </div>
      </div>
    </div>
  );
}
