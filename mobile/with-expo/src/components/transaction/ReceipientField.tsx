import React, { useState, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { AlertCircle, CheckCircle } from "@/components/icons";
import { Clipboard as ClipboardIcon } from "lucide-react-native";
import { WalletType } from "@getpara/react-native-wallet";
import * as ExpoClipboard from "expo-clipboard";
import { isValidEvmAddress, isValidSolanaAddress } from "@/utils/transactionUtils";
import { formatAddress } from "@/utils/formattingUtils";
import { SupportedWalletType } from "@/types";

export interface RecipientFieldProps {
  value: string;
  onChange: (value: string) => void;
  networkType: SupportedWalletType;
  onValidChange: (isValid: boolean) => void;
  label?: string;
  placeholder?: string;
  hasError?: boolean;
  errorMessage?: string;
}

export function RecipientField({
  value,
  onChange,
  networkType,
  onValidChange,
  label = "Recipient address",
  placeholder = "Enter recipient address",
  hasError = false,
  errorMessage = "",
}: RecipientFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    validateAddress(value);
  }, [value, networkType]);

  const validateAddress = (address: string) => {
    if (!address.trim()) {
      setIsValid(false);
      onValidChange(false);
      return;
    }

    let validationResult = false;

    if (networkType === WalletType.EVM) {
      validationResult = isValidEvmAddress(address);
    } else if (networkType === WalletType.SOLANA) {
      validationResult = isValidSolanaAddress(address);
    }

    setIsValid(validationResult);
    onValidChange(validationResult);
  };

  const handlePaste = async () => {
    try {
      setIsPasting(true);
      const clipboardContent = await ExpoClipboard.getStringAsync();
      if (clipboardContent) {
        onChange(clipboardContent);
      }
    } catch (error) {
      console.error("Error pasting from clipboard:", error);
    } finally {
      setIsPasting(false);
    }
  };

  const networkPlaceholder = networkType === WalletType.EVM ? "0x..." : "Solana address...";

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-foreground mb-2">{label}</Text>

      <View
        className={`rounded-lg border ${
          hasError
            ? "border-destructive"
            : isValid && value
            ? "border-green-500"
            : isFocused
            ? "border-primary"
            : "border-border"
        } bg-background overflow-hidden`}>
        <View className="flex-row items-center">
          <Input
            value={value}
            onChangeText={onChange}
            placeholder={placeholder || networkPlaceholder}
            className="flex-1 border-0 h-14 text-base"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          <TouchableOpacity
            onPress={handlePaste}
            disabled={isPasting}
            className="px-4 h-full justify-center"
            accessibilityLabel="Paste address from clipboard">
            <ClipboardIcon
              size={20}
              className="text-muted-foreground"
            />
          </TouchableOpacity>
        </View>
      </View>

      {value && isValid && (
        <View className="mt-2 flex-row items-center">
          <CheckCircle
            size={16}
            className="text-green-500 mr-2"
          />
          <Text className="text-sm text-muted-foreground">
            Valid {networkType === WalletType.EVM ? "Ethereum" : "Solana"} address
          </Text>
        </View>
      )}

      {((hasError && errorMessage) || (value && !isValid)) && (
        <View className="mt-2 flex-row items-center">
          <AlertCircle
            size={16}
            className="text-destructive mr-2"
          />
          <Text className="text-sm text-destructive">
            {errorMessage || `Invalid ${networkType === WalletType.EVM ? "Ethereum" : "Solana"} address format`}
          </Text>
        </View>
      )}

      {((hasError && errorMessage) || (value && !isValid)) && (
        <View className="mt-2 flex-row items-center">
          <AlertCircle
            size={16}
            className="text-destructive mr-2"
          />
          <Text className="text-sm text-destructive">
            {errorMessage || `Invalid ${networkType === WalletType.EVM ? "Ethereum" : "Solana"} address format`}
          </Text>
        </View>
      )}

      {value && value.length > 10 && (
        <View className="mt-1">
          <Text className="text-xs text-muted-foreground">Sending to: {formatAddress(value, networkType)}</Text>
        </View>
      )}
    </View>
  );
}
