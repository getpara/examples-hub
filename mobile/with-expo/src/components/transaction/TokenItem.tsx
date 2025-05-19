import React from "react";
import { View, Image, Pressable, ActivityIndicator } from "react-native";
import { Text } from "~/components/ui/text";
import { formatUsdValue, formatCryptoValue } from "@/utils/formattingUtils";
import { SupportedWalletType } from "@/types";

export interface TokenItemProps {
  id: string;
  name: string;
  ticker: string;
  logo: any;
  networkType: SupportedWalletType;
  networkLogo: any;
  balance: number;
  usdValue: number | null;
  isLoading: boolean;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function TokenItem({
  id,
  name,
  ticker,
  logo,
  networkType,
  networkLogo,
  balance,
  usdValue,
  isLoading,
  isSelected = false,
  onSelect,
  disabled = false,
}: TokenItemProps) {
  const formattedBalance = formatCryptoValue(balance, ticker);
  const formattedUsdValue = usdValue !== null ? formatUsdValue(usdValue) : "--";

  return (
    <Pressable
      onPress={() => onSelect(id)}
      disabled={disabled || isLoading}
      className={`flex-row items-center p-4 rounded-lg border ${
        isSelected ? "border-primary bg-primary/5" : "border-border bg-card"
      } ${disabled ? "opacity-50" : ""}`}
      accessibilityRole="button"
      accessibilityLabel={`Select ${name} token with balance of ${formattedBalance}`}
      accessibilityState={{ selected: isSelected }}>
      <View className="relative">
        <Image
          source={logo}
          className="h-10 w-10 rounded-full"
          resizeMode="contain"
        />
        <Image
          source={networkLogo}
          className="h-5 w-5 absolute -bottom-1 -right-1 rounded-full border border-background"
          resizeMode="contain"
        />
      </View>

      <View className="flex-1 ml-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-medium text-foreground">{name}</Text>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text className="text-base font-medium text-foreground">{formattedUsdValue}</Text>
          )}
        </View>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-sm text-muted-foreground">{ticker}</Text>
          <Text className="text-sm text-muted-foreground">{formattedBalance}</Text>
        </View>
      </View>
    </Pressable>
  );
}
