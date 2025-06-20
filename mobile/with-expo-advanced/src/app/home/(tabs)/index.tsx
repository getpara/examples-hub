import React, { useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { WalletType } from '@getpara/react-native-wallet';

import { Card, CardContent } from '~/components/ui/card';
import { PortfolioBalance } from '@/components/wallet/PortfolioBalance';
import { WalletActionButtons } from '@/components/wallet/WalletActionButtons';
import { TokenAssetList } from '@/components/tokens/TokenAssetList';
import { TokenAssetListItemProps } from '@/components/tokens/TokenAssetListItem';

import { useWallets } from '@/hooks/useWallets';
import { useBalances } from '@/hooks/useBalances';
import { usePrices } from '@/hooks/usePrices';
import { useSigners } from '@/hooks/useSigners';
import { formatUsdValue, truncateAddress } from '@/utils';
import { formatUnits } from 'ethers';

export default function HomeScreen() {
  const router = useRouter();
  const {
    wallets,
    hasEvmWallets,
    hasSolanaWallets,
    isWalletsLoading,
    refetchWallets,
  } = useWallets();
  const { balances, isBalancesLoading, refetchBalances } = useBalances();
  const { prices, hasPrices, isPricesLoading, refetchPrices } = usePrices();
  const { isSignersLoading } = useSigners();

  const isLoading =
    isWalletsLoading ||
    isBalancesLoading ||
    isPricesLoading ||
    isSignersLoading;

  // Kept for potential future use with pull-to-refresh
  // const refreshAllData = useCallback(async () => {
  //   try {
  //     await Promise.all([refetchWallets(), refetchBalances(), refetchPrices()]);
  //     return true;
  //   } catch (error) {
  //     console.error('Error refreshing data:', error);
  //     toast.error('Failed to refresh data', {
  //       description: 'Please check your internet connection and try again.',
  //     });
  //     return false;
  //   }
  // }, [refetchWallets, refetchBalances, refetchPrices]);

  useEffect(() => {
    // Only refresh data once on mount, not when dependencies change
    const loadInitialData = async () => {
      try {
        await Promise.all([
          refetchWallets(),
          refetchBalances(),
          refetchPrices(),
        ]);
      } catch (error) {
        console.error('Error loading wallet data:', error);
        toast.error('Failed to load wallet data', {
          description: 'Please check your internet connection and try again.',
        });
      }
    };
    loadInitialData();
  }, []);

  const {
    formattedTotalBalance,
    hasMissingPrices,
    hasAnyWalletWithBalance,
    isPositiveChange,
    formattedChange,
    percentageChange,
  } = useMemo(() => {
    let total = 0;
    let hasMissingPriceData = false;
    let hasAnyBalance = false;

    Object.entries(balances[WalletType.EVM] || {}).forEach(([_id, balance]) => {
      if (balance) {
        hasAnyBalance = true;
        // Parse the raw balance value (in wei) to ETH
        const ethAmount = parseFloat(
          formatUnits(balance.amount, balance.decimals)
        );

        if (prices.ethereum?.usd) {
          total += ethAmount * prices.ethereum.usd;
        } else {
          hasMissingPriceData = true;
        }
      }
    });

    Object.entries(balances[WalletType.SOLANA] || {}).forEach(
      ([_id, balance]) => {
        if (balance) {
          hasAnyBalance = true;
          // Parse the raw balance value (in lamports) to SOL
          const solAmount = parseFloat(
            formatUnits(balance.amount, balance.decimals)
          );

          if (prices.solana?.usd) {
            total += solAmount * prices.solana.usd;
          } else {
            hasMissingPriceData = true;
          }
        }
      }
    );

    const change = total * 0.01;
    const percentageValue = 1.0;
    const isPositive = true;

    return {
      totalBalance: total,
      formattedTotalBalance: formatUsdValue(total),
      hasMissingPrices: hasMissingPriceData,
      hasAnyWalletWithBalance: hasAnyBalance,
      isPositiveChange: isPositive,
      formattedChange: formatUsdValue(change),
      percentageChange: percentageValue,
    };
  }, [balances, prices]);

  const processWalletAssets = useCallback(
    (
      walletType: typeof WalletType.EVM | typeof WalletType.SOLANA,
      tokenName: string,
      tokenTicker: string,
      tokenLogo: ImageSourcePropType,
      tokenPrice: number | undefined
    ): Omit<TokenAssetListItemProps, 'onPress'>[] => {
      const result: Omit<TokenAssetListItemProps, 'onPress'>[] = [];
      const walletsOfType = wallets[walletType] || [];

      walletsOfType.forEach((wallet) => {
        if (wallet.address) {
          const walletBalance = balances[walletType]?.[wallet.id];
          if (walletBalance) {
            // Parse raw balance to get numeric amount
            const tokenAmount = parseFloat(
              formatUnits(walletBalance.amount, walletBalance.decimals)
            );
            const usdBalance = tokenPrice ? tokenAmount * tokenPrice : null;

            result.push({
              id: `${tokenTicker.toLowerCase()}-${wallet.id}`,
              name: tokenName,
              ticker: tokenTicker,
              logo: tokenLogo,
              balance: usdBalance,
              tokenBalance: tokenAmount,
              address: wallet.address,
              isLoading: isBalancesLoading,
              hasPriceData: !!tokenPrice,
            });
          }
        }
      });

      return result;
    },
    [wallets, balances, isBalancesLoading]
  );

  const assets = useMemo(() => {
    const ethAssets = hasEvmWallets
      ? processWalletAssets(
          WalletType.EVM,
          'Ethereum',
          'ETH',
          require('~/assets/ethereum.png'),
          prices.ethereum?.usd
        )
      : [];

    const solAssets = hasSolanaWallets
      ? processWalletAssets(
          WalletType.SOLANA,
          'Solana',
          'SOL',
          require('~/assets/solana.png'),
          prices.solana?.usd
        )
      : [];

    return [...ethAssets, ...solAssets];
  }, [prices, hasEvmWallets, hasSolanaWallets, processWalletAssets]);

  const handleRefreshPrices = () => {
    refetchPrices();
    toast.info('Refreshing prices', {
      description: 'Attempting to update cryptocurrency prices.',
    });
  };

  const handleReceive = () => {
    toast.info('Receive not implemented yet', {
      description: 'This feature is not yet implemented.',
    });
  };

  const handleSend = () => {
    router.navigate('/home/transaction/token');
  };

  const handleSwap = () => {
    toast.info('Swap not implemented yet', {
      description: 'This feature is not yet implemented.',
    });
  };

  const handleAssetPress = (id: string, address?: string) => {
    toast.info(`Interacting with ${id}`, {
      description: address
        ? `Address: ${truncateAddress(address)}`
        : 'No address available',
    });
  };

  return (
    <View className="flex-1 bg-background px-6 pt-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card className="w-full bg-card border border-border rounded-lg overflow-hidden">
          <CardContent className="p-6 gap-8">
            <PortfolioBalance
              totalBalance={formattedTotalBalance}
              isLoading={isLoading && !hasAnyWalletWithBalance}
              hasPriceData={hasPrices}
              hasMissingPrices={hasMissingPrices}
              change={formattedChange}
              percentage={percentageChange}
              isPositive={isPositiveChange}
              onRefreshPrices={handleRefreshPrices}
            />
            <WalletActionButtons
              onSend={handleSend}
              onReceive={handleReceive}
              onSwap={handleSwap}
            />
          </CardContent>
        </Card>

        <TokenAssetList
          assets={assets}
          isLoading={isLoading}
          onAssetPress={handleAssetPress}
        />
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
