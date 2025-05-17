import React from "react";
import { View, ActivityIndicator, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { useWallet } from "@/providers/wallet/useWallet";
import { toast } from "sonner-native";
import { RefreshCcw } from "@/components/icons/Refresh";

export function PortfolioBalance() {
  const { evmWallets, solanaWallets, prices, isRefreshing, refreshPrices } = useWallet();

  const { totalBalance, hasPriceData, hasMissingPrices, hasAnyWalletWithBalance } = React.useMemo(() => {
    let total = 0;
    let hasAnyPrice = false;
    let hasMissingPriceData = false;
    let hasAnyBalance = false;

    evmWallets.forEach((wallet) => {
      if (wallet.balance) {
        hasAnyBalance = true;
        const ethAmount = parseFloat(wallet.balance.amount) / Math.pow(10, wallet.balance.decimals);

        if (prices.ethereum?.usd) {
          total += ethAmount * prices.ethereum.usd;
          hasAnyPrice = true;
        } else {
          hasMissingPriceData = true;
        }
      }
    });

    solanaWallets.forEach((wallet) => {
      if (wallet.balance) {
        hasAnyBalance = true; // We have at least one wallet with a balance
        const solAmount = parseFloat(wallet.balance.amount) / Math.pow(10, wallet.balance.decimals);

        if (prices.solana?.usd) {
          total += solAmount * prices.solana.usd;
          hasAnyPrice = true;
        } else {
          hasMissingPriceData = true;
        }
      }
    });

    return {
      totalBalance: total,
      hasPriceData: hasAnyPrice,
      hasMissingPrices: hasMissingPriceData,
      hasAnyWalletWithBalance: hasAnyBalance,
    };
  }, [evmWallets, solanaWallets, prices]);

  const change = totalBalance * 0.01; // Placeholder: 1% change
  const percentage = 1.0; // Placeholder: 1%
  const isPositive = true; // Placeholder: always positive

  const formattedBalance = totalBalance.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedChange = change.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleRefreshPrices = () => {
    refreshPrices();
    toast.info("Refreshing prices", {
      description: "Attempting to update cryptocurrency prices.",
    });
  };

  const showLoading = isRefreshing && !hasAnyWalletWithBalance;

  return (
    <View className="items-center gap-3 w-full">
      <View className="w-full items-center">
        <Text className="text-sm font-medium text-muted-foreground mb-1">Total Balance</Text>

        {showLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <Text className="text-5xl font-bold text-foreground font-figtree">{formattedBalance}</Text>

            {hasMissingPrices && (
              <Pressable
                onPress={handleRefreshPrices}
                className="flex-row items-center mt-2 bg-yellow-100 rounded-full px-3 py-1">
                <Text className="text-xs text-yellow-800 mr-1">Some prices unavailable</Text>
                <RefreshCcw
                  size={12}
                  className="text-yellow-800"
                />
              </Pressable>
            )}
          </>
        )}
      </View>

      {hasPriceData && (
        <View className={`rounded-full px-4 py-1 ${isPositive ? "bg-green-100" : "bg-red-100"}`}>
          <Text className={`text-sm font-medium ${isPositive ? "text-green-700" : "text-red-700"}`}>
            {isPositive ? "+" : ""}
            {formattedChange} • {isPositive ? "+" : ""}
            {percentage}%
          </Text>
        </View>
      )}
    </View>
  );
}
