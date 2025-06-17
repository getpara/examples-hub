import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { WalletType } from '@getpara/react-native-wallet';
import { formatUsdValue } from '@/utils/formattingUtils';
import { formatAddress } from '@/utils/formattingUtils';
import { CheckCircle, ArrowUpRight } from '@/components/icons';
import { Separator } from '~/components/ui/separator';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { SupportedWalletType } from '@/types';

export interface SuccessDisplayProps {
  txHash: string;
  amount: string;
  tokenTicker: string;
  tokenName: string;
  recipientAddress: string;
  recipientName?: string;
  amountUsd: number | null;
  networkType: SupportedWalletType;
  networkName: string;
  submittedAt: number;
  confirmedAt: number;
  confirmationDuration: number;
  blockNumber?: number;
  gasUsed?: string;
  gasLimit?: string;
  gasPrice?: string;
  slot?: number;
  signature?: string;
  computeUnitsUsed?: number;
  onViewExplorer: () => void;
  onReturn: () => void;
}

export function SuccessDisplay({
  txHash,
  amount,
  tokenTicker,
  tokenName: _tokenName,
  recipientAddress,
  recipientName,
  amountUsd,
  networkType,
  networkName,
  submittedAt,
  confirmedAt,
  confirmationDuration,
  blockNumber,
  gasUsed,
  gasLimit,
  gasPrice,
  slot,
  signature,
  computeUnitsUsed,
  onViewExplorer,
  onReturn,
}: SuccessDisplayProps) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSequence(
      withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back()) }),
      withTiming(1, { duration: 200 })
    );

    opacity.value = withTiming(1, { duration: 500 });
    // Note: scale and opacity are Reanimated shared values (refs) that don't change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes} min${minutes > 1 ? 's' : ''} ${remainingSeconds} sec${remainingSeconds !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}`;
    }
  };

  const renderEvmConfirmationDetails = () => (
    <View>
      {blockNumber !== undefined && (
        <View className="flex-row justify-between py-2">
          <Text className="text-sm text-muted-foreground">Block Number</Text>
          <Text className="text-sm font-medium text-foreground">
            {blockNumber}
          </Text>
        </View>
      )}

      {gasUsed && gasLimit && (
        <View className="flex-row justify-between py-2">
          <Text className="text-sm text-muted-foreground">Gas Used</Text>
          <Text className="text-sm font-medium text-foreground">
            {gasUsed} / {gasLimit} (
            {((parseInt(gasUsed) / parseInt(gasLimit)) * 100).toFixed(0)}%)
          </Text>
        </View>
      )}

      {gasPrice && (
        <View className="flex-row justify-between py-2">
          <Text className="text-sm text-muted-foreground">Gas Price</Text>
          <Text className="text-sm font-medium text-foreground">
            {gasPrice} Gwei
          </Text>
        </View>
      )}
    </View>
  );

  const renderSolanaConfirmationDetails = () => (
    <View>
      {slot !== undefined && (
        <View className="flex-row justify-between py-2">
          <Text className="text-sm text-muted-foreground">Slot</Text>
          <Text className="text-sm font-medium text-foreground">{slot}</Text>
        </View>
      )}

      {computeUnitsUsed !== undefined && (
        <View className="flex-row justify-between py-2">
          <Text className="text-sm text-muted-foreground">
            Compute Units Used
          </Text>
          <Text className="text-sm font-medium text-foreground">
            {computeUnitsUsed}
          </Text>
        </View>
      )}

      {signature && (
        <View className="flex-row justify-between py-2">
          <Text className="text-sm text-muted-foreground">Signature</Text>
          <Text
            className="text-sm font-medium text-foreground max-w-[200px]"
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {signature}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-6">
        <Animated.View style={animatedStyle}>
          <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4">
            <CheckCircle size={48} className="text-green-600" />
          </View>
        </Animated.View>

        <Text className="text-2xl font-bold text-foreground text-center">
          Transaction Successful!
        </Text>
        <Text className="text-base text-muted-foreground text-center mt-2 px-6">
          Your transaction has been confirmed on the {networkName} network
        </Text>
      </View>

      <Card className="border border-border mb-4">
        <CardContent className="p-4">
          <View className="mb-3">
            <Text className="text-sm text-muted-foreground mb-1">
              Amount Sent
            </Text>
            <View>
              <Text className="text-xl font-bold text-foreground">
                {amount} {tokenTicker}
              </Text>
              {amountUsd !== null && (
                <Text className="text-sm text-muted-foreground">
                  {formatUsdValue(amountUsd)}
                </Text>
              )}
            </View>
          </View>

          <Separator className="my-3" />

          <View>
            <Text className="text-sm text-muted-foreground mb-1">
              Recipient
            </Text>
            <View>
              {recipientName && (
                <Text className="text-sm font-medium mb-1">
                  {recipientName}
                </Text>
              )}
              <Text className="text-sm font-medium text-foreground">
                {formatAddress(recipientAddress, networkType)}
              </Text>
              <Text className="text-xs text-muted-foreground mt-1 break-all">
                {recipientAddress}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>

      <Card className="border border-border mb-4">
        <CardContent className="p-4">
          <Text className="text-base font-medium text-foreground mb-3">
            Confirmation Details
          </Text>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-muted-foreground">Status</Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <Text className="text-sm font-medium text-green-600">
                Confirmed
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-muted-foreground">
              Time Submitted
            </Text>
            <Text className="text-sm font-medium text-foreground">
              {formatDate(submittedAt)}
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-muted-foreground">
              Time Confirmed
            </Text>
            <Text className="text-sm font-medium text-foreground">
              {formatDate(confirmedAt)}
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-muted-foreground">
              Confirmation Time
            </Text>
            <Text className="text-sm font-medium text-foreground">
              {formatDuration(confirmationDuration)}
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-muted-foreground">Network</Text>
            <Text className="text-sm font-medium text-foreground">
              {networkName}
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-muted-foreground">
              Transaction Hash
            </Text>
            <Text
              className="text-sm font-medium text-foreground max-w-[200px]"
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {txHash}
            </Text>
          </View>

          <Separator className="my-3" />

          {/* Network-specific details */}
          {networkType === WalletType.EVM
            ? renderEvmConfirmationDetails()
            : renderSolanaConfirmationDetails()}
        </CardContent>
      </Card>

      <View className="flex-row gap-x-4 mb-10">
        <Button
          className="flex-1"
          onPress={onReturn}
          accessibilityLabel="Return to home"
        >
          <Text className="text-primary-foreground font-medium">Done</Text>
        </Button>

        <Button
          variant="outline"
          className="flex-1"
          onPress={onViewExplorer}
          accessibilityLabel="View transaction in blockchain explorer"
        >
          <ArrowUpRight size={18} className="text-foreground mr-2" />
          <Text className="text-foreground font-medium">View in Explorer</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
