import React from "react";
import { View, Image, Pressable, ActivityIndicator } from "react-native";
import { Text } from "~/components/ui/text";
import { AlertCircle } from "@/components/icons/AlertCircle";

export interface TokenAssetListItemProps {
  id: string;
  name: string;
  ticker: string;
  logo: any;
  balance: number | null;
  tokenBalance: number;
  address?: string;
  isLoading: boolean;
  hasPriceData: boolean;
  onPress: (id: string, address?: string) => void;
}

export function TokenAssetListItem({
  id,
  name,
  ticker,
  logo,
  balance,
  tokenBalance,
  address,
  isLoading,
  hasPriceData,
  onPress,
}: TokenAssetListItemProps) {
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
          <Text className="text-sm text-muted-foreground">
            {formattedTokenBalance} {ticker}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
