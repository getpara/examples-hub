import { useState, useCallback, useMemo } from "react";
import { WalletType } from "@getpara/react-native-wallet";
import {
  FeeTier,
  PriorityLevel,
  calculateTotalSolanaFee,
  calculateTotalSolanaFeeUsd,
  getFeeTierStyles,
  PRIORITY_FEE_OPTIONS,
} from "@/utils/feeUtils";

interface UseFeeCalculationProps {
  networkType: WalletType;
  tokenPriceUsd: number | null;
  solanaBaseFee?: number;
  solanaBaseFeeUsd?: number | null;
}

export function useFeeCalculation({
  networkType,
  tokenPriceUsd,
  solanaBaseFee = 5000,
  solanaBaseFeeUsd = null,
}: UseFeeCalculationProps) {
  const [selectedFeeTier, setSelectedFeeTier] = useState<FeeTier>("average");
  const [priorityFeeLevel, setPriorityFeeLevel] = useState<PriorityLevel>("none");

  // Handle fee tier change
  const handleFeeTierChange = useCallback((tier: FeeTier) => {
    setSelectedFeeTier(tier);
  }, []);

  // Handle priority level change
  const handlePriorityLevelChange = useCallback((level: PriorityLevel) => {
    setPriorityFeeLevel(level);
  }, []);

  // Get fee tier styling
  const getFeeTierStyle = useCallback((tier: FeeTier) => {
    return getFeeTierStyles(tier);
  }, []);

  // Calculate total Solana fee
  const totalSolanaFee = useMemo(() => {
    if (networkType !== WalletType.SOLANA) return null;
    return calculateTotalSolanaFee(solanaBaseFee, priorityFeeLevel);
  }, [networkType, solanaBaseFee, priorityFeeLevel]);

  // Calculate total Solana fee in USD
  const totalSolanaFeeUsd = useMemo(() => {
    if (networkType !== WalletType.SOLANA) return null;
    return calculateTotalSolanaFeeUsd(solanaBaseFeeUsd, priorityFeeLevel, tokenPriceUsd);
  }, [networkType, solanaBaseFeeUsd, priorityFeeLevel, tokenPriceUsd]);

  // Get priority fee options
  const priorityOptions = useMemo(() => {
    return PRIORITY_FEE_OPTIONS;
  }, []);

  // Get selected priority fee value
  const selectedPriorityFee = useMemo(() => {
    const option = PRIORITY_FEE_OPTIONS.find((o) => o.level === priorityFeeLevel);
    return option ? option.value : 0;
  }, [priorityFeeLevel]);

  return {
    // State
    selectedFeeTier,
    priorityFeeLevel,
    totalSolanaFee,
    totalSolanaFeeUsd,
    priorityOptions,
    selectedPriorityFee,

    // Actions
    handleFeeTierChange,
    handlePriorityLevelChange,
    getFeeTierStyle,
  };
}