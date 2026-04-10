"use client";

import { useState, useEffect, useCallback } from "react";
import { useModal, useAccount } from "@getpara/react-sdk";
import { formatEther, getContract, parseEther } from "viem";
import { useParaViemClient, useParaViemWriteContract } from "@getpara/react-sdk/evm";
import { http } from "viem";
import { CHAIN } from "@/lib/viem";
import { publicClient } from "@/lib/viem";
import { PARA_TEST_TOKEN_ADDRESS, PARA_TEST_TOKEN_ABI } from "@/lib/contracts";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";

export default function ContractInteractionPage() {
  const [amount, setAmount] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [mintedAmount, setMintedAmount] = useState<string | null>(null);
  const [mintLimit, setMintLimit] = useState<string | null>(null);
  const [status, setStatus] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
    show: false,
    type: "success",
    message: "",
  });

  const { isConnected, embedded } = useAccount();
  const address = embedded?.wallets?.[0]?.address as `0x${string}` | undefined;
  const { viemClient } = useParaViemClient({ walletClientConfig: { chain: CHAIN, transport: http() } });
  const { writeContractAsync, isPending, data: txHash, error } = useParaViemWriteContract(viemClient);
  const { openModal } = useModal();

  const fetchContractData = useCallback(async () => {
    if (!address) return;

    setIsDataLoading(true);
    try {
      const contract = getContract({
        address: PARA_TEST_TOKEN_ADDRESS,
        abi: PARA_TEST_TOKEN_ABI,
        client: publicClient,
      });

      const balance = await contract.read.balanceOf([address]);
      setTokenBalance(formatEther(balance as bigint));

      const minted = await contract.read.mintedAmount([address]);
      setMintedAmount(formatEther(minted as bigint));

      const limit = await contract.read.MINT_LIMIT();
      setMintLimit(formatEther(limit as bigint));
    } catch (err) {
      console.error("Error fetching contract data:", err);
      setTokenBalance(null);
      setMintedAmount(null);
      setMintLimit(null);
    } finally {
      setIsDataLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchContractData();
    }
  }, [address, fetchContractData]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ show: false, type: "success", message: "" });

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      setStatus({ show: true, type: "error", message: "Please enter a valid amount greater than 0." });
      return;
    }

    if (mintedAmount && mintLimit) {
      const currentMinted = parseFloat(mintedAmount);
      const limit = parseFloat(mintLimit);
      if (currentMinted + amountFloat > limit) {
        setStatus({
          show: true,
          type: "error",
          message: `Minting ${amountFloat} tokens would exceed your limit of ${limit} tokens.`,
        });
        return;
      }
    }

    try {
      setStatus({ show: true, type: "info", message: "Please confirm the transaction in your wallet..." });

      await writeContractAsync({
        address: PARA_TEST_TOKEN_ADDRESS,
        abi: PARA_TEST_TOKEN_ABI,
        functionName: "mint",
        args: [parseEther(amount)],
      });

      setStatus({ show: true, type: "success", message: `Successfully minted ${amount} CTT tokens!` });
      setAmount("");
      await fetchContractData();
    } catch {
      setStatus({ show: true, type: "error", message: error?.message || "Failed to mint tokens. Please try again." });
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
        <h1 className="text-4xl font-bold tracking-tight mb-6">Contract Interaction Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Mint CTT tokens using the{" "}
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">useWriteContract</code>{" "}
          hook. Each address can mint up to 10 CTT tokens.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Contract Address:</h3>
          </div>
          <div className="p-6">
            <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
              {PARA_TEST_TOKEN_ADDRESS}
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Token Stats:</h3>
            <button
              onClick={fetchContractData}
              disabled={isDataLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh data">
              <span className={`inline-block ${isDataLoading ? "animate-spin" : ""}`}>&#x1f504;</span>
            </button>
          </div>
          <div className="px-6 py-3 space-y-2">
            <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Network: Sepolia</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600">Balance</p>
                <p className="text-sm font-medium text-gray-900">
                  {isDataLoading ? "..." : tokenBalance ? `${parseFloat(tokenBalance).toFixed(2)} CTT` : "0 CTT"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Minted</p>
                <p className="text-sm font-medium text-gray-900">
                  {isDataLoading ? "..." : mintedAmount ? `${parseFloat(mintedAmount).toFixed(2)} CTT` : "0 CTT"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Limit</p>
                <p className="text-sm font-medium text-gray-900">
                  {isDataLoading ? "..." : mintLimit ? `${parseFloat(mintLimit).toFixed(2)} CTT` : "10 CTT"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {status.show && <StatusAlert type={status.type} message={status.message} />}

        <form onSubmit={handleMint} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Amount to Mint (CTT)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.01"
              disabled={isPending}
              className="block w-full px-4 py-3 border border-gray-300 rounded-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={!isConnected || isPending || !amount}
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? "Minting Tokens..." : "Mint Tokens"}
          </button>
        </form>

        {txHash && <TxResult hash={txHash} />}
      </div>
    </div>
  );
}
