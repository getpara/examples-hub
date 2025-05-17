import React, { useEffect } from "react";
import { View, ScrollView } from "react-native";
import { useWallet } from "@/providers/wallet/useWallet";
import { PortfolioBalance } from "@/components/wallet/PortfolioBalance";
import { WalletActionButtons } from "@/components/wallet/WalletActionButtons";
import { Card, CardContent } from "@/components/ui/card";
import { TokenAssetList } from "@/components/tokens/TokenAssetList";
import { toast } from "sonner-native";

export default function HomeScreen() {
  const { evmWallets, solanaWallets, prices, refreshWallets, isRefreshing } = useWallet();
  const [hasLoaded, setHasLoaded] = React.useState(false);

  useEffect(() => {
    refreshWallets()
      .then(() => {
        setHasLoaded(true);
      })
      .catch((error) => {
        console.error("Error loading wallet data:", error);
        toast.error("Failed to load wallet data", {
          description: "Please check your internet connection and try again.",
        });
        setHasLoaded(true);
      });
  }, [refreshWallets]);

  const handleAssetPress = (id: string, address?: string) => {
    toast.info(`Interacting with ${id}`, {
      description: address ? `Address: ${address.slice(0, 8)}...` : "No address available",
    });
  };

  const assets = React.useMemo(() => {
    const result = [];

    for (const wallet of evmWallets) {
      if (wallet.balance) {
        const ethAmount = parseFloat(wallet.balance.amount) / Math.pow(10, wallet.balance.decimals);
        const ethPrice = prices.ethereum?.usd;
        const usdBalance = ethPrice ? ethAmount * ethPrice : null;

        result.push({
          id: `eth-${wallet.id}`,
          name: "Ethereum",
          ticker: "ETH",
          logo: require("~/assets/ethereum.png"),
          balance: usdBalance,
          tokenBalance: ethAmount,
          address: wallet.address,
          isLoading: wallet.isLoadingBalance,
          hasPriceData: !!ethPrice,
        });
      }
    }

    for (const wallet of solanaWallets) {
      if (wallet.balance) {
        const solAmount = parseFloat(wallet.balance.amount) / Math.pow(10, wallet.balance.decimals);
        const solPrice = prices.solana?.usd;
        const usdBalance = solPrice ? solAmount * solPrice : null;

        result.push({
          id: `sol-${wallet.id}`,
          name: "Solana",
          ticker: "SOL",
          logo: require("~/assets/solana.png"),
          balance: usdBalance,
          tokenBalance: solAmount,
          address: wallet.address,
          isLoading: wallet.isLoadingBalance,
          hasPriceData: !!solPrice,
        });
      }
    }

    return result;
  }, [evmWallets, solanaWallets, prices]);

  const areAssetsLoading =
    isRefreshing || evmWallets.some((w) => w.isLoadingBalance) || solanaWallets.some((w) => w.isLoadingBalance);

  return (
    <View className="flex-1 bg-background px-6 pt-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card className="w-full bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <CardContent className="p-6 gap-8">
            <PortfolioBalance />
            <WalletActionButtons />
          </CardContent>
        </Card>

        <TokenAssetList
          assets={assets}
          isLoading={areAssetsLoading}
          onAssetPress={handleAssetPress}
        />
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
