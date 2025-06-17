import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { WalletType } from '@getpara/react-native-wallet';
import { formatUsdValue } from '@/utils/formattingUtils';
import { Zap, Clock, Coins } from '@/components/icons';
import {
  FeeTier,
  PriorityLevel,
  PriorityFeeOption,
  PRIORITY_FEE_OPTIONS,
} from '@/utils/feeUtils';

export interface EvmFeeOption {
  tier: FeeTier;
  gasPrice: string;
  estimatedTime: string;
  feeInEth: string;
  feeInUsd: number | null;
}

export interface SolanaFeeOption {
  baseFee: number;
  priorityFee: number;
  estimatedTime: string;
  feeInSol: string;
  feeInUsd: number | null;
}

export interface FeeSelectorProps {
  networkType: WalletType;
  gasLimit?: string;
  evmFeeOptions?: EvmFeeOption[];
  solanaFeeOption?: SolanaFeeOption;
  tokenPriceUsd: number | null;
  selectedFeeTier: FeeTier;
  onFeeTierChange: (tier: FeeTier) => void;
  priorityFeeLevel?: PriorityLevel;
  onPriorityLevelChange?: (level: PriorityLevel, fee: number) => void;
  // Calculated values from useFeeCalculation hook
  selectedPriorityFee?: number;
  totalSolanaFee?: string | null;
  totalSolanaFeeUsd?: number | null;
  priorityFeeOptions?: PriorityFeeOption[];
}

export function FeeSelector({
  networkType,
  evmFeeOptions = [],
  solanaFeeOption,
  tokenPriceUsd: _tokenPriceUsd,
  selectedFeeTier,
  onFeeTierChange,
  priorityFeeLevel = 'none',
  onPriorityLevelChange,
  selectedPriorityFee: _selectedPriorityFee = 0,
  totalSolanaFee = null,
  totalSolanaFeeUsd = null,
  priorityFeeOptions = PRIORITY_FEE_OPTIONS,
}: FeeSelectorProps) {
  // Render EVM fee options
  const renderEvmFeeOptions = () => {
    return (
      <View className="space-y-3">
        {evmFeeOptions.map((option) => (
          <Pressable
            key={option.tier}
            onPress={() => onFeeTierChange(option.tier)}
            className={`rounded-lg border ${
              selectedFeeTier === option.tier
                ? 'border-primary bg-primary/5'
                : 'border-border'
            } p-4`}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedFeeTier === option.tier }}
            accessibilityLabel={`${option.tier} transaction fee`}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View
                  className={`w-10 h-10 rounded-full ${
                    option.tier === 'slow'
                      ? 'bg-yellow-100'
                      : option.tier === 'average'
                        ? 'bg-green-100'
                        : 'bg-purple-100'
                  } items-center justify-center mr-3`}
                >
                  {option.tier === 'slow' ? (
                    <Clock size={20} className="text-yellow-600" />
                  ) : option.tier === 'average' ? (
                    <Coins size={20} className="text-green-600" />
                  ) : (
                    <Zap size={20} className="text-purple-600" />
                  )}
                </View>
                <View>
                  <Text className="text-base font-medium capitalize">
                    {option.tier}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {option.estimatedTime}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-base font-medium">
                  {option.feeInEth} ETH
                </Text>
                {option.feeInUsd !== null && (
                  <Text className="text-xs text-muted-foreground">
                    {formatUsdValue(option.feeInUsd)}
                  </Text>
                )}
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    );
  };

  // Render Solana fee option
  const renderSolanaFeeOption = () => {
    if (!solanaFeeOption) return null;

    return (
      <Card className="border border-border">
        <CardContent className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-base font-medium">Network Fee</Text>
              <Text className="text-xs text-muted-foreground">
                Estimated confirmation time: {solanaFeeOption.estimatedTime}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-base font-medium">
                {solanaFeeOption.feeInSol} SOL
              </Text>
              {solanaFeeOption.feeInUsd !== null && (
                <Text className="text-xs text-muted-foreground">
                  {formatUsdValue(solanaFeeOption.feeInUsd)}
                </Text>
              )}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium mb-2">Priority Fee</Text>
            <Text className="text-xs text-muted-foreground mb-3">
              Higher priority fees may result in faster confirmations
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {priorityFeeOptions.map((option) => (
                <Pressable
                  key={option.level}
                  onPress={() =>
                    onPriorityLevelChange &&
                    onPriorityLevelChange(option.level, option.value)
                  }
                  className={`flex-1 min-w-[70px] rounded-lg border p-2 ${
                    priorityFeeLevel === option.level
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: priorityFeeLevel === option.level,
                  }}
                  accessibilityLabel={option.label}
                >
                  <Text className="text-center font-medium text-sm">
                    {option.label}
                  </Text>
                  {option.level !== 'none' && (
                    <Text className="text-center text-xs text-muted-foreground mt-1">
                      +{(option.value / 1_000_000_000).toFixed(6)} SOL
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <View className="flex-row justify-between pt-3 border-t border-border">
            <Text className="text-sm font-medium">Total Fee</Text>
            <View className="items-end">
              <Text className="text-sm font-medium">
                {totalSolanaFee || '0.000000000'} SOL
              </Text>
              {totalSolanaFeeUsd !== null && (
                <Text className="text-xs text-muted-foreground">
                  {formatUsdValue(totalSolanaFeeUsd)}
                </Text>
              )}
            </View>
          </View>
        </CardContent>
      </Card>
    );
  };

  // Default content if no fee options provided
  const renderDefaultContent = () => {
    return (
      <View className="p-4 border border-border rounded-lg items-center justify-center">
        <Text className="text-muted-foreground">
          Fee information unavailable
        </Text>
      </View>
    );
  };

  return (
    <View className="mb-6">
      <Text className="text-sm font-medium text-foreground mb-3">
        Transaction Fee
      </Text>

      {networkType === WalletType.EVM
        ? evmFeeOptions.length > 0
          ? renderEvmFeeOptions()
          : renderDefaultContent()
        : networkType === WalletType.SOLANA
          ? solanaFeeOption
            ? renderSolanaFeeOption()
            : renderDefaultContent()
          : renderDefaultContent()}
    </View>
  );
}
