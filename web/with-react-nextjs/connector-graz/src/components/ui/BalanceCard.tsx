"use client";

import { useBalance, useActiveChains } from "graz";
import { formatBalance } from "@/utils/format";

interface BalanceCardProps {
  address?: string;
  onRefresh: () => void;
}

export function BalanceCard({ address, onRefresh }: BalanceCardProps) {
  const activeChains = useActiveChains();
  const activeChain = activeChains?.[0];

  const currencies = activeChain?.currencies || [];
  const chainDenom = currencies?.[0]?.coinMinimalDenom || "uatom";
  const chainDecimals = currencies?.[0]?.coinDecimals || 6;

  const {
    data: balance,
    isLoading,
    refetch,
  } = useBalance({
    chainId: activeChain?.chainId || "cosmoshub-4",
    denom: chainDenom,
    bech32Address: address!,
  });

  const handleRefresh = () => {
    refetch();
    onRefresh();
  };

  const formatCosmosBalance = (amount: string, denom: string) => {
    const displayAmount = parseFloat(amount) / 10 ** chainDecimals;
    return `${formatBalance(displayAmount.toString())} ${currencies[0]?.coinDenom || denom}`;
  };

  const hasBalance = balance && parseFloat(balance.amount) > 0;

  return (
    <div className="mb-8 rounded-none border border-gray-200">
      <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Current Balance:</h3>
        <div className="flex items-center gap-2">
          <a
            href="https://testnet.ping.pub/cosmos/faucet"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-all cursor-pointer"
            title="Get test tokens from faucet">
            <span className="text-sm">💧</span>
          </a>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            data-testid="account-refresh-balance"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh balance">
            <span className={`inline-block text-sm ${isLoading ? "animate-spin" : ""}`}>🔄</span>
          </button>
        </div>
      </div>
      <div className="px-6 py-3">
        <p
          className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md"
          data-testid="account-network-display">
          Network: {activeChain?.chainName || "Unknown"}
        </p>
        {isLoading ? (
          <p
            className="text-lg font-medium text-gray-900"
            data-testid="account-balance-display">
            Loading...
          </p>
        ) : !balance || !hasBalance ? (
          <div className="mt-2">
            <p
              className="text-lg font-medium text-gray-900 mb-2"
              data-testid="account-balance-display">
              {balance ? formatCosmosBalance(balance.amount, balance.denom) : "Unable to fetch balance"}
            </p>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-none">
              <p className="text-sm text-blue-700 mb-2">No tokens? Get test tokens from the faucet!</p>
              <a
                href="https://testnet.ping.pub/cosmos/faucet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1 hover:bg-blue-700 transition-colors rounded-none">
                Get Tokens
                <span className="text-xs">↗</span>
              </a>
            </div>
          </div>
        ) : (
          <p
            className="text-lg font-medium text-gray-900"
            data-testid="account-balance-display">
            {formatCosmosBalance(balance.amount, balance.denom)}
          </p>
        )}
      </div>
    </div>
  );
}
