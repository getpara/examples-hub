import React from 'react';
import { View, ActivityIndicator, Pressable } from 'react-native';
import { Text } from '~/components/ui/text';
import { RefreshCcw } from '@/components/icons';

interface PortfolioBalanceProps {
  totalBalance: string;
  isLoading: boolean;
  hasPriceData: boolean;
  hasMissingPrices: boolean;
  change: string;
  percentage: number;
  isPositive: boolean;
  onRefreshPrices: () => void;
}

export function PortfolioBalance({
  totalBalance,
  isLoading,
  hasPriceData,
  hasMissingPrices,
  change,
  percentage,
  isPositive,
  onRefreshPrices,
}: PortfolioBalanceProps) {
  return (
    <View className="items-center gap-3 w-full">
      <View className="w-full items-center">
        <Text className="text-sm font-medium text-muted-foreground mb-1">
          Total Balance
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <Text className="text-5xl font-bold text-foreground font-figtree">
              {totalBalance}
            </Text>

            {hasMissingPrices && (
              <Pressable
                onPress={onRefreshPrices}
                className="flex-row items-center mt-2 bg-muted rounded-full px-3 py-1"
              >
                <Text className="text-xs text-muted-foreground mr-1">
                  Some prices unavailable
                </Text>
                <RefreshCcw size={12} className="text-muted-foreground" />
              </Pressable>
            )}
          </>
        )}
      </View>

      {hasPriceData && (
        <View
          className={`rounded-full px-4 py-1 ${isPositive ? 'bg-muted' : 'bg-muted'}`}
        >
          <Text
            className={`text-sm font-medium ${isPositive ? 'text-foreground' : 'text-foreground'}`}
          >
            {isPositive ? '+' : ''}
            {change} • {isPositive ? '+' : ''}
            {percentage}%
          </Text>
        </View>
      )}
    </View>
  );
}
