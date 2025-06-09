import { useState, useCallback, useEffect, useMemo } from "react";
import { WalletType } from "@getpara/react-native-wallet";
import {
  validateAmount,
  convertUsdToCrypto,
  convertCryptoToUsd,
  getDecimalPrecision,
} from "@/utils/amountUtils";

interface UseAmountInputProps {
  tokenTicker: string;
  tokenDecimals: number;
  availableBalance: number;
  usdPrice: number | null;
  networkType: WalletType;
  maxAmount?: number;
}

export function useAmountInput({
  tokenTicker,
  tokenDecimals,
  availableBalance,
  usdPrice,
  networkType,
  maxAmount,
}: UseAmountInputProps) {
  const [amount, setAmount] = useState("");
  const [usdValue, setUsdValue] = useState("");
  const [isUsdMode, setIsUsdMode] = useState(false);
  const [error, setError] = useState("");

  // Validate amount whenever it changes
  useEffect(() => {
    const validationError = validateAmount(amount, availableBalance, tokenTicker, networkType);
    setError(validationError);
  }, [amount, availableBalance, tokenTicker, networkType]);

  // Calculate USD value when crypto amount changes
  useEffect(() => {
    if (!isUsdMode && amount && usdPrice && usdPrice > 0) {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount)) {
        setUsdValue(convertCryptoToUsd(numAmount, usdPrice));
      }
    }
  }, [amount, usdPrice, isUsdMode]);

  // Toggle between USD and crypto modes
  const toggleMode = useCallback(() => {
    setIsUsdMode((prev) => !prev);
  }, []);

  // Handle USD input changes
  const handleUsdChange = useCallback((newUsdValue: string) => {
    setUsdValue(newUsdValue);

    if (newUsdValue && usdPrice && usdPrice > 0) {
      const numValue = parseFloat(newUsdValue);
      if (!isNaN(numValue)) {
        setAmount(convertUsdToCrypto(numValue, usdPrice, networkType));
      }
    } else {
      setAmount("");
    }
  }, [usdPrice, networkType]);

  // Handle crypto amount changes
  const handleAmountChange = useCallback((newAmount: string) => {
    setAmount(newAmount);
  }, []);

  // Set maximum amount
  const setMaxAmount = useCallback(() => {
    const max = maxAmount !== undefined ? maxAmount : availableBalance;
    setAmount(max.toString());
  }, [maxAmount, availableBalance]);

  // Get formatted conversion display
  const conversionDisplay = useMemo(() => {
    if (!usdPrice || usdPrice <= 0 || (!amount && !usdValue)) return "";

    const value = isUsdMode ? usdValue : amount;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "";

    if (isUsdMode) {
      const cryptoValue = convertUsdToCrypto(numValue, usdPrice, networkType);
      return `≈ ${cryptoValue} ${tokenTicker}`;
    } else {
      const usdAmount = convertCryptoToUsd(numValue, usdPrice);
      return `≈ $${usdAmount}`;
    }
  }, [amount, usdValue, isUsdMode, usdPrice, tokenTicker, networkType]);

  // Check if current amount is valid
  const isValid = useMemo(() => {
    return !error && amount !== "";
  }, [error, amount]);

  // Get numeric USD value
  const numericUsdValue = useMemo(() => {
    return usdValue ? parseFloat(usdValue) : null;
  }, [usdValue]);

  return {
    // State
    amount,
    usdValue,
    isUsdMode,
    error,
    isValid,
    conversionDisplay,
    numericUsdValue,

    // Actions
    handleAmountChange: isUsdMode ? handleUsdChange : handleAmountChange,
    toggleMode,
    setMaxAmount,
  };
}