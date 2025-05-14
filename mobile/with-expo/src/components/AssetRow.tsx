import React from "react";
import { View, Image, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Text } from "~/components/ui/text";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { AlertCircle } from "@/components/icons/AlertCircle";
import { toast } from "sonner-native";
import { useWallet } from "@/providers/wallet/useWallet";

interface AssetRowProps {
  id: string;
  name: string;
  ticker: string;
  logo: any;
  balance: number | null;
  price: number | null;
  tokenBalance: number;
  address?: string;
  isLoading: boolean;
  hasPriceData: boolean;
  onPress: (id: string, address?: string) => void;
}

function AssetRow({
  id,
  name,
  ticker,
  logo,
  balance,
  price,
  tokenBalance,
  address,
  isLoading,
  hasPriceData,
  onPress,
}: AssetRowProps) {
  const formattedUsdBalance =
    balance !== null
      ? balance.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "--";

  const formattedTokenBalance = tokenBalance.toFixed(6);

  return (
    <Pressable
      onPress={() => onPress(id, address)}
      className="flex-row items-center py-4 border-b border-border"
      accessibilityRole="button"
      accessibilityLabel={`${name} balance: ${tokenBalance} ${ticker}`}>
      <Image
        source={logo}
        className="h-10 w-10 mr-4"
        resizeMode="contain"
      />
      <View className="flex-1">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-medium text-foreground">{name}</Text>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : !hasPriceData ? (
            <View className="flex-row items-center">
              <AlertCircle
                size={14}
                className="text-yellow-500 mr-1"
              />
              <Text className="text-base font-medium text-foreground">Price unavailable</Text>
            </View>
          ) : (
            <Text className="text-base font-medium text-foreground">{formattedUsdBalance}</Text>
          )}
        </View>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-sm text-muted-foreground">{ticker}</Text>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text className="text-sm text-muted-foreground">
              {formattedTokenBalance} {ticker}
            </Text>
          )}
        </View>
        {price && (
          <View className="flex-row justify-end mt-1">
            <Text className="text-xs text-muted-foreground">
              1 {ticker} = ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export function AssetSection() {
  const [activeTab, setActiveTab] = React.useState("assets");
  const { evmWallets, solanaWallets, prices, isRefreshing, refreshBalances, refreshPrices } = useWallet();

  const handleAssetPress = (id: string, address?: string) => {
    toast.info(`Interacting with ${id}`, {
      description: address ? `Address: ${address.slice(0, 8)}...` : "No address available",
    });
  };

  const handleRefresh = () => {
    refreshBalances();
    refreshPrices();
    toast.info("Refreshing balances and prices", {
      description: "Your wallet balances and prices are being updated.",
    });
  };

  // Prepare the assets for display
  const assets = React.useMemo(() => {
    const result = [];

    // Add ETH assets
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
          price: ethPrice || null,
          tokenBalance: ethAmount,
          address: wallet.address,
          isLoading: wallet.isLoadingBalance,
          hasPriceData: !!ethPrice,
        });
      }
    }

    // Add SOL assets
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
          price: solPrice || null,
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
    <View className="mt-6">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xl font-figtree font-medium text-foreground">Your Assets</Text>
      </View>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full">
        <TabsList className="flex-row w-full h-auto p-0 bg-transparent justify-start mb-2">
          <TabsTrigger
            value="assets"
            className="h-10 flex-1 rounded-none bg-transparent shadow-none px-0 mr-4">
            <View className={`pb-2 border-b-2 ${activeTab === "assets" ? "border-primary" : "border-transparent"}`}>
              <Text
                className={`text-base font-medium ${
                  activeTab === "assets" ? "text-foreground" : "text-muted-foreground"
                }`}>
                Assets
              </Text>
            </View>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="h-10 flex-1 rounded-none bg-transparent shadow-none px-0">
            <View className={`pb-2 border-b-2 ${activeTab === "history" ? "border-primary" : "border-transparent"}`}>
              <Text
                className={`text-base font-medium ${
                  activeTab === "history" ? "text-foreground" : "text-muted-foreground"
                }`}>
                History
              </Text>
            </View>
          </TabsTrigger>
        </TabsList>

        <View className="w-full h-px bg-border mb-4" />

        <TabsContent value="assets">
          {assets.length === 0 ? (
            <View className="h-40 items-center justify-center">
              <Text className="text-muted-foreground">
                {areAssetsLoading ? "Loading assets..." : "No assets found"}
              </Text>
              {areAssetsLoading && <ActivityIndicator className="mt-2" />}
            </View>
          ) : (
            <ScrollView className="max-h-64">
              {assets.map((asset) => (
                <AssetRow
                  key={asset.id}
                  id={asset.id}
                  name={asset.name}
                  ticker={asset.ticker}
                  logo={asset.logo}
                  balance={asset.balance}
                  price={asset.price}
                  tokenBalance={asset.tokenBalance}
                  address={asset.address}
                  isLoading={asset.isLoading}
                  hasPriceData={asset.hasPriceData}
                  onPress={handleAssetPress}
                />
              ))}
            </ScrollView>
          )}
        </TabsContent>

        <TabsContent value="history">
          <View className="h-40 items-center justify-center">
            <Text className="text-muted-foreground">No transaction history available</Text>
          </View>
        </TabsContent>
      </Tabs>
    </View>
  );
}
