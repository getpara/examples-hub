import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { WalletType } from '@getpara/react-native-wallet';
import { CheckCircle, XCircle, Clock, Loader } from '@/components/icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface StatusIndicatorProps {
  status: TransactionStatus;
  networkType: WalletType;
  elapsedTime?: number;
  estimatedTime?: number;
}

export function StatusIndicator({
  status,
  networkType,
  elapsedTime = 0,
  estimatedTime,
}: StatusIndicatorProps) {
  const rotation = useSharedValue(0);

  const getDefaultEstimatedTime = () => {
    if (estimatedTime) return estimatedTime;

    return networkType === WalletType.EVM ? 180 : 15;
  };

  const defaultEstTime = getDefaultEstimatedTime();

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  useEffect(() => {
    if (status === 'pending') {
      rotation.value = 0;
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
    }

    return () => {
      cancelAnimation(rotation);
    };
  }, [status, rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const renderStatusIcon = () => {
    switch (status) {
      case 'pending':
        return (
          <View className="items-center justify-center">
            <Animated.View style={animatedStyle}>
              <Loader size={64} className="text-primary" />
            </Animated.View>
          </View>
        );
      case 'confirmed':
        return (
          <View className="items-center justify-center">
            <CheckCircle size={80} className="text-green-500" />
          </View>
        );
      case 'failed':
        return (
          <View className="items-center justify-center">
            <XCircle size={80} className="text-destructive" />
          </View>
        );
      default:
        return null;
    }
  };

  const renderStatusContent = () => {
    switch (status) {
      case 'pending':
        return (
          <View className="items-center">
            <Text className="text-xl font-bold text-foreground mt-4 mb-2">
              Transaction Pending
            </Text>
            <Text className="text-base text-muted-foreground text-center mb-1">
              {networkType === WalletType.EVM
                ? 'Waiting for confirmation on Ethereum network'
                : 'Waiting for confirmation on Solana network'}
            </Text>
            <Text className="text-sm text-muted-foreground text-center">
              Elapsed time: {formatTime(elapsedTime)}
            </Text>
            <Text className="text-sm text-muted-foreground text-center">
              Estimated time: {formatTime(defaultEstTime)}
            </Text>
            <View className="flex-row items-center mt-4 bg-primary/10 rounded-full px-4 py-2">
              <Clock size={16} className="text-primary mr-2" />
              <Text className="text-sm text-primary">
                {networkType === WalletType.EVM
                  ? 'Ethereum transactions may take several minutes'
                  : 'Solana transactions typically confirm in seconds'}
              </Text>
            </View>
          </View>
        );
      case 'confirmed':
        return (
          <View className="items-center">
            <Text className="text-xl font-bold text-foreground mt-4 mb-2">
              Transaction Confirmed
            </Text>
            <Text className="text-base text-muted-foreground text-center">
              Your transaction has been successfully confirmed on the{' '}
              {networkType === WalletType.EVM ? 'Ethereum' : 'Solana'} network
            </Text>
            <View className="flex-row items-center mt-4 bg-green-100 rounded-full px-4 py-2">
              <CheckCircle size={16} className="text-green-600 mr-2" />
              <Text className="text-sm text-green-600">
                Completed in {formatTime(elapsedTime)}
              </Text>
            </View>
          </View>
        );
      case 'failed':
        return (
          <View className="items-center">
            <Text className="text-xl font-bold text-foreground mt-4 mb-2">
              Transaction Failed
            </Text>
            <Text className="text-base text-muted-foreground text-center">
              Your transaction on the{' '}
              {networkType === WalletType.EVM ? 'Ethereum' : 'Solana'} network
              could not be completed
            </Text>
            <View className="flex-row items-center mt-4 bg-destructive/10 rounded-full px-4 py-2">
              <XCircle size={16} className="text-destructive mr-2" />
              <Text className="text-sm text-destructive">
                Failed after {formatTime(elapsedTime)}
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="items-center justify-center py-6">
      {renderStatusIcon()}
      {renderStatusContent()}
    </View>
  );
}
