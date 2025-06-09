import { useState, useCallback, useEffect, useMemo } from "react";
import { WalletType } from "@getpara/react-native-wallet";
import { validateAmount, convertUsdToCrypto, convertCryptoToUsd } from "@/utils/amountUtils";

interface UseAmountInputProps {
  tokenTicker: string;
  availableBalance: number;
  usdPrice: number | null;
  networkType: WalletType;
  maxAmount?: number;
}

export function useAmountInput({
  tokenTicker,
  availableBalance,
  usdPrice,
  networkType,
  maxAmount,
}: UseAmountInputProps) {
  const [amount, setAmount] = useState("");
  const [usdValue, setUsdValue] = useState("");
  const [isUsdMode, setIsUsdMode] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const validationError = validateAmount(amount, availableBalance, tokenTicker, networkType);
    setError(validationError);
  }, [amount, availableBalance, tokenTicker, networkType]);

  useEffect(() => {
    if (!isUsdMode && amount && usdPrice && usdPrice > 0) {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount)) {
        setUsdValue(convertCryptoToUsd(numAmount, usdPrice));
      }
    }
  }, [amount, usdPrice, isUsdMode]);

  const toggleMode = useCallback(() => {
    setIsUsdMode((prev) => !prev);
  }, []);

  const handleUsdChange = useCallback(
    (newUsdValue: string) => {
      setUsdValue(newUsdValue);

      if (newUsdValue && usdPrice && usdPrice > 0) {
        const numValue = parseFloat(newUsdValue);
        if (!isNaN(numValue)) {
          setAmount(convertUsdToCrypto(numValue, usdPrice, networkType));
        }
      } else {
        setAmount("");
      }
    },
    [usdPrice, networkType]
  );

  const handleAmountChange = useCallback((newAmount: string) => {
    setAmount(newAmount);
  }, []);

  const setMaxAmount = useCallback(() => {
    const max = maxAmount !== undefined ? maxAmount : availableBalance;
    setAmount(max.toString());
  }, [maxAmount, availableBalance]);

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

  const isValid = useMemo(() => {
    return !error && amount !== "";
  }, [error, amount]);

  const numericUsdValue = useMemo(() => {
    return usdValue ? parseFloat(usdValue) : null;
  }, [usdValue]);

  return {
    amount,
    usdValue,
    isUsdMode,
    error,
    isValid,
    conversionDisplay,
    numericUsdValue,
    handleAmountChange: isUsdMode ? handleUsdChange : handleAmountChange,
    toggleMode,
    setMaxAmount,
  };
}
