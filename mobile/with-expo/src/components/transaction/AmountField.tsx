import React, { useState } from "react";
import { View, TextInput, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { formatUsdValue } from "@/utils/formattingUtils";
import { AlertCircle } from "@/components/icons";

export interface AmountFieldProps {
  value: string;
  usdValue: string;
  isUsdMode: boolean;
  onChange: (value: string) => void;
  onToggleMode: () => void;
  onMaxAmount: () => void;
  tokenTicker: string;
  availableBalance: number;
  availableBalanceUsd: number | null;
  conversionDisplay: string;
  error: string;
  isValid: boolean;
}

export function AmountField({
  value,
  usdValue,
  isUsdMode,
  onChange,
  onToggleMode,
  onMaxAmount,
  tokenTicker,
  availableBalance,
  availableBalanceUsd,
  conversionDisplay,
  error,
  isValid,
}: AmountFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm font-medium text-foreground">Amount</Text>

        <View className="flex-row items-center space-x-1">
          <Text className="text-sm text-muted-foreground">Available:</Text>
          <Text className="text-sm font-medium text-foreground">
            {availableBalance} {tokenTicker}
          </Text>
          {availableBalanceUsd !== null && (
            <Text className="text-xs text-muted-foreground">({formatUsdValue(availableBalanceUsd)})</Text>
          )}
        </View>
      </View>

      <View
        className={`rounded-lg border ${
          error ? "border-destructive" : isFocused ? "border-primary" : "border-border"
        } bg-background p-4`}>
        <View className="flex-row justify-between items-center mb-2">
          <Pressable
            onPress={onToggleMode}
            accessibilityLabel={`Switch to ${isUsdMode ? "crypto" : "USD"} mode`}
            className="bg-muted rounded-full px-3 py-1.5 flex-row items-center">
            <Text className="text-sm font-medium">{isUsdMode ? "$" : tokenTicker}</Text>
          </Pressable>

          <Button
            variant="outline"
            size="sm"
            onPress={onMaxAmount}
            className="h-8 px-3">
            <Text className="text-sm font-medium text-primary">MAX</Text>
          </Button>
        </View>

        <View className="flex-row items-center">
          <TextInput
            value={isUsdMode ? usdValue : value}
            onChangeText={onChange}
            keyboardType="decimal-pad"
            placeholder={isUsdMode ? "0.00" : "0.0"}
            className="flex-1 font-figtree text-4xl font-bold text-foreground h-16 p-0"
            placeholderTextColor="#9CA3AF"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>

        {conversionDisplay && (
          <Text className="text-right text-sm text-muted-foreground mt-1">
            {conversionDisplay}
          </Text>
        )}
      </View>

      {error && (
        <View className="mt-2 flex-row items-start">
          <AlertCircle
            size={16}
            className="text-destructive mr-2 mt-0.5"
          />
          <Text className="text-sm text-destructive flex-1">{error}</Text>
        </View>
      )}
    </View>
  );
}
