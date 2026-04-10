"use client";

import { useState, useEffect, useCallback } from "react";
import { useModal, useAccount } from "@getpara/react-sdk";
import { formatEther, getContract, parseEther } from "viem";
import { useParaViemClient, useParaViemWriteContract } from "@getpara/react-sdk/evm";
import { http } from "viem";
import { CHAIN } from "@/lib/viem";
import { useBalance } from "@/hooks/useBalance";
import { publicClient } from "@/lib/viem";
import { PARA_TEST_TOKEN_ADDRESS, ERC20_ABI } from "@/lib/contracts";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";

export default function TokenTransferPage() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [contractAddress, setContractAddress] = useState<string>(PARA_TEST_TOKEN_ADDRESS);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>("CTT");
  const [status, setStatus] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
    show: false,
    type: "success",
    message: "",
  });

  const { isConnected, embedded } = useAccount();
  const address = embedded?.wallets?.[0]?.address as `0x${string}` | undefined;
  const { viemClient } = useParaViemClient({ walletClientConfig: { chain: CHAIN, transport: http() } });
  const { writeContractAsync, isPending, data: txHash, error } = useParaViemWriteContract(viemClient);
  const { balance: ethBalance, isLoading: isEthLoading, refetch: refetchEthBalance } = useBalance();
  const { openModal } = useModal();

  const fetchTokenData = useCallback(async () => {
    if (!address || !contractAddress) return;

    setIsTokenLoading(true);
    try {
      const contract = getContract({
        address: contractAddress as `0x${string}`,
        abi: ERC20_ABI,
        client: publicClient,
      });

      const balance = await contract.read.balanceOf([address]);
      const symbol = await contract.read.symbol();

      setTokenSymbol(symbol as string);
      setTokenBalance(formatEther(balance as bigint));
    } catch (err) {
      console.error("Error fetching token data:", err);
      setTokenBalance(null);
    } finally {
      setIsTokenLoading(false);
    }
  }, [address, contractAddress]);

  useEffect(() => {
    if (address && contractAddress) {
      fetchTokenData();
    }
  }, [address, contractAddress, fetchTokenData]);

  const handleRefresh = () => {
    refetchEthBalance();
    fetchTokenData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ show: false, type: "success", message: "" });

    if (!/^0x[a-fA-F0-9]{40}$/.test(to)) {
      setStatus({ show: true, type: "error", message: "Invalid recipient address format." });
      return;
    }

    try {
      setStatus({ show: true, type: "info", message: "Please confirm the transaction in your wallet..." });

      await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [to as `0x${string}`, parseEther(amount)],
      });

      setStatus({ show: true, type: "success", message: "Tokens transferred successfully!" });
      setTo("");
      setAmount("");
      handleRefresh();
    } catch {
      setStatus({ show: true, type: "error", message: error?.message || "Failed to transfer tokens. Please try again." });
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

  const isBalanceLoading = isEthLoading || isTokenLoading;

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Token Transfer Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transfer{" "}
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">ParaTestToken (CTT)</code>{" "}
          using the{" "}
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">useWriteContract</code>{" "}
          hook.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Balances:</h3>
            <button
              onClick={handleRefresh}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balances">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>&#x1f504;</span>
            </button>
          </div>
          <div className="px-6 py-3 space-y-2">
            <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Network: Sepolia</p>
            <p className="text-sm font-medium text-gray-900">
              <span className="text-gray-600">ETH:</span>{" "}
              {isEthLoading
                ? "Loading..."
                : ethBalance !== null
                  ? `${parseFloat(formatEther(ethBalance)).toFixed(4)} ETH`
                  : "Unable to fetch balance"}
            </p>
            <p className="text-sm font-medium text-gray-900">
              <span className="text-gray-600">{tokenSymbol}:</span>{" "}
              {isTokenLoading
                ? "Loading..."
                : tokenBalance
                  ? `${parseFloat(tokenBalance).toFixed(4)} ${tokenSymbol}`
                  : "Unable to fetch balance"}
            </p>
          </div>
        </div>

        {status.show && <StatusAlert type={status.type} message={status.message} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Token Contract Address</label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              disabled={isPending}
              className="block w-full px-4 py-3 border border-gray-300 rounded-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Recipient Address</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x..."
              disabled={isPending}
              className="block w-full px-4 py-3 border border-gray-300 rounded-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Amount ({tokenSymbol})</label>
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
            disabled={!isConnected || isPending || !to || !amount || !contractAddress}
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? "Sending Transaction..." : "Send Tokens"}
          </button>
        </form>

        {txHash && <TxResult hash={txHash} />}
      </div>
    </div>
  );
}
