import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface BalanceDisplayProps {
  total: number;
  change: number;
  percentage: number;
  isPositive: boolean;
}

export function BalanceDisplay({ total, change, percentage, isPositive }: BalanceDisplayProps) {
  const formattedBalance = total.toLocaleString("en-US", {
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

  return (
    <View className="items-center mb-8">
      <Text className="text-5xl native:text-7xl font-bold text-foreground mb-4">{formattedBalance}</Text>

      <View className={`rounded-full px-4 py-1 ${isPositive ? "bg-green-100 " : "bg-red-100"}`}>
        <Text className={isPositive ? "text-green-700" : "text-red-700"}>
          {isPositive ? "+" : ""}
          {formattedChange} • {isPositive ? "+" : ""}
          {percentage}%
        </Text>
      </View>
    </View>
  );
}
