import React, { useState, useEffect } from "react";
import { View, TextInput, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { WalletType } from "@getpara/react-native-wallet";
import { formatUsdValue } from "@/utils/formattingUtils";
import { AlertCircle } from "@/components/icons";

export interface AmountFieldProps {
  value: string;
  onChange: (value: string) => void;
  tokenTicker: string;
  tokenDecimals: number;
  availableBalance: number;
  availableBalanceUsd: number | null;
  usdPrice: number | null;
  networkType: WalletType;
  maxAmount?: number;
  onValidChange: (isValid: boolean) => void;
  onUsdValueChange?: (usdValue: number | null) => void;
}

export function AmountField({
  value,
  onChange,
  tokenTicker,
  tokenDecimals,
  availableBalance,
  availableBalanceUsd,
  usdPrice,
  networkType,
  maxAmount,
  onValidChange,
  onUsdValueChange,
}: AmountFieldProps) {
  const [isUsdMode, setIsUsdMode] = useState(false);
  const [usdValue, setUsdValue] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  // Min amounts based on network
  const minAmount = networkType === WalletType.EVM ? 0.000001 : 0.00001;

  // Toggle between USD and crypto modes
  const toggleInputMode = () => {
    setIsUsdMode(!isUsdMode);
  };

  // Set maximum available amount
  const handleMaxAmount = () => {
    if (maxAmount !== undefined) {
      const maxString = maxAmount.toString();
      onChange(maxString);
    } else {
      onChange(availableBalance.toString());
    }
  };

  // Validate the input amount
  useEffect(() => {
    validateAmount(value);
  }, [value, isUsdMode, availableBalance]);

  // Convert between USD and crypto values when mode changes
  useEffect(() => {
    if (usdPrice && usdPrice > 0) {
      if (isUsdMode) {
        // Convert crypto to USD
        if (value) {
          const numVal = parseFloat(value);
          const calculatedUsd = (numVal * usdPrice).toFixed(2);
          setUsdValue(calculatedUsd);
          onUsdValueChange?.(parseFloat(calculatedUsd));
        }
      } else if (usdValue) {
        // Convert USD to crypto when switching back
        const numVal = parseFloat(usdValue);
        const calculatedCrypto = (numVal / usdPrice).toFixed(networkType === WalletType.EVM ? 6 : 4);
        onChange(calculatedCrypto);
      }
    }
  }, [isUsdMode, usdPrice]);

  // Update USD value when crypto value changes (in crypto mode)
  useEffect(() => {
    if (!isUsdMode && usdPrice && usdPrice > 0 && value) {
      const numVal = parseFloat(value);
      const calculatedUsd = (numVal * usdPrice).toFixed(2);
      setUsdValue(calculatedUsd);
      onUsdValueChange?.(parseFloat(calculatedUsd));
    }
  }, [value, usdPrice, isUsdMode]);

  // Update crypto value when USD value changes (in USD mode)
  const handleUsdChange = (newUsdValue: string) => {
    setUsdValue(newUsdValue);

    if (newUsdValue && usdPrice && usdPrice > 0) {
      const numVal = parseFloat(newUsdValue);
      const calculatedCrypto = (numVal / usdPrice).toFixed(networkType === WalletType.EVM ? 6 : 4);
      onChange(calculatedCrypto);
      onUsdValueChange?.(numVal);
    } else {
      onChange("");
      onUsdValueChange?.(null);
    }
  };

  const validateAmount = (amount: string) => {
    if (!amount) {
      setError("");
      onValidChange(false);
      return;
    }

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount)) {
      setError("Please enter a valid number");
      onValidChange(false);
      return;
    }

    if (numAmount <= 0) {
      setError("Amount must be greater than zero");
      onValidChange(false);
      return;
    }

    if (numAmount < minAmount) {
      setError(`Amount must be at least ${minAmount} ${tokenTicker}`);
      onValidChange(false);
      return;
    }

    if (numAmount > availableBalance) {
      setError(`Exceeds available balance of ${availableBalance} ${tokenTicker}`);
      onValidChange(false);
      return;
    }

    setError("");
    onValidChange(true);
  };

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
            onPress={toggleInputMode}
            accessibilityLabel={`Switch to ${isUsdMode ? "crypto" : "USD"} mode`}
            className="bg-muted rounded-full px-3 py-1.5 flex-row items-center">
            <Text className="text-sm font-medium">{isUsdMode ? "$" : tokenTicker}</Text>
          </Pressable>

          <Button
            variant="outline"
            size="sm"
            onPress={handleMaxAmount}
            className="h-8 px-3">
            <Text className="text-sm font-medium text-primary">MAX</Text>
          </Button>
        </View>

        <View className="flex-row items-center">
          <TextInput
            value={isUsdMode ? usdValue : value}
            onChangeText={isUsdMode ? handleUsdChange : onChange}
            keyboardType="decimal-pad"
            placeholder={isUsdMode ? "0.00" : "0.0"}
            className="flex-1 font-figtree text-4xl font-bold text-foreground h-16 p-0"
            placeholderTextColor="#9CA3AF"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>

        {usdPrice && usdPrice > 0 && (
          <Text className="text-right text-sm text-muted-foreground mt-1">
            {isUsdMode
              ? `≈ ${parseFloat(value || "0").toFixed(networkType === WalletType.EVM ? 6 : 4)} ${tokenTicker}`
              : `≈ ${formatUsdValue(parseFloat(usdValue || "0"))}`}
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
