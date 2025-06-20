import { useState, useCallback, useMemo } from 'react';
import { WalletType } from '@getpara/react-native-wallet';
import {
  FeeTier,
  PriorityLevel,
  calculateTotalSolanaFee,
  calculateTotalSolanaFeeUsd,
  PRIORITY_FEE_OPTIONS,
} from '@/utils';

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
  const [selectedFeeTier, setSelectedFeeTier] = useState<FeeTier>('average');
  const [priorityFeeLevel, setPriorityFeeLevel] =
    useState<PriorityLevel>('none');

  const handleFeeTierChange = useCallback((tier: FeeTier) => {
    setSelectedFeeTier(tier);
  }, []);

  const handlePriorityLevelChange = useCallback((level: PriorityLevel) => {
    setPriorityFeeLevel(level);
  }, []);

  const totalSolanaFee = useMemo(() => {
    if (networkType !== WalletType.SOLANA) return null;
    return calculateTotalSolanaFee(solanaBaseFee, priorityFeeLevel);
  }, [networkType, solanaBaseFee, priorityFeeLevel]);

  const totalSolanaFeeUsd = useMemo(() => {
    if (networkType !== WalletType.SOLANA) return null;
    return calculateTotalSolanaFeeUsd(
      solanaBaseFeeUsd,
      priorityFeeLevel,
      tokenPriceUsd
    );
  }, [networkType, solanaBaseFeeUsd, priorityFeeLevel, tokenPriceUsd]);

  const selectedPriorityFee = useMemo(() => {
    const option = PRIORITY_FEE_OPTIONS.find(
      (o) => o.level === priorityFeeLevel
    );
    return option ? option.value : 0;
  }, [priorityFeeLevel]);

  return {
    selectedFeeTier,
    priorityFeeLevel,
    totalSolanaFee,
    totalSolanaFeeUsd,
    priorityOptions: PRIORITY_FEE_OPTIONS, // Reference constant directly
    selectedPriorityFee,
    handleFeeTierChange,
    handlePriorityLevelChange,
  };
}
