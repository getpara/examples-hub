"use client";

import { useBalance } from "wagmi";
import { formatEther } from "viem";
import { formatBalance } from "@/utils/format";

interface BalanceCardProps {
  address?: `0x${string}`;
  onRefresh: () => void;
}

export function BalanceCard({ address, onRefresh }: BalanceCardProps) {
  const {
    data: balance,
    isLoading,
    refetch,
  } = useBalance({
    address,
    chainId: 11155111,
  });

  const handleRefresh = () => {
    refetch();
    onRefresh();
  };

  return (
    <div className="mb-8 rounded-none border border-gray-200">
      <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Current Balance:</h3>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-all disabled:opacity-50 cursor-pointer"
          title="Refresh balance">
          <span className={`inline-block text-sm ${isLoading ? "animate-spin" : ""}`}>🔄</span>
        </button>
      </div>
      <div className="px-6 py-3">
        <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Network: Sepolia</p>
        <p className="text-lg font-medium text-gray-900">
          {isLoading ? "Loading..." : balance ? `${formatBalance(formatEther(balance.value))} ETH` : "Unable to fetch balance"}
        </p>
      </div>
    </div>
  );
}
