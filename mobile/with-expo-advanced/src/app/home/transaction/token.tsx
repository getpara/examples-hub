import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { WalletType } from '@getpara/react-native-wallet';

import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { TokenList } from '@/components/transaction/TokenList';
import { useWallets } from '@/hooks/useWallets';
import { useBalances } from '@/hooks/useBalances';
import { usePrices } from '@/hooks/usePrices';
import { useTokenFilter } from '@/hooks/useTokenFilter';
import { formatTokenAmount } from '@/utils';
import { TokenData } from '@/utils/tokenUtils';

export default function TokenSelectionScreen() {
  const router = useRouter();
  const { hasEvmWallets, hasSolanaWallets } = useWallets();
  const { totalEthBalance, totalSolBalance, isBalancesLoading } = useBalances();
  const { prices, isPricesLoading } = usePrices();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Using TokenItemProps type since we're passing to TokenItem component
  const allTokens: TokenData[] = useMemo(() => {
    const list: TokenData[] = [];
    if (hasEvmWallets) {
      const amount = parseFloat(formatTokenAmount(totalEthBalance, 18));
      list.push({
        id: 'eth',
        name: 'Ethereum',
        ticker: 'ETH',
        networkType: WalletType.EVM,
        balance: amount,
        balanceUsd: prices.ethereum?.usd ? amount * prices.ethereum.usd : null,
        usdPrice: prices.ethereum?.usd || null,
        change24h: null,
        logoUri: undefined,
      });
    }
    if (hasSolanaWallets) {
      const amount = parseFloat(formatTokenAmount(totalSolBalance, 9));
      list.push({
        id: 'sol',
        name: 'Solana',
        ticker: 'SOL',
        networkType: WalletType.SOLANA,
        balance: amount,
        balanceUsd: prices.solana?.usd ? amount * prices.solana.usd : null,
        usdPrice: prices.solana?.usd || null,
        change24h: null,
        logoUri: undefined,
      });
    }
    return list;
  }, [
    hasEvmWallets,
    hasSolanaWallets,
    totalEthBalance,
    totalSolBalance,
    prices,
  ]);

  const {
    activeTab,
    searchQuery,
    filteredTokens,
    groupedTokens,
    hasResults,
    emptyMessage,
    setActiveTab,
    setSearchQuery,
  } = useTokenFilter(allTokens);

  const handleContinue = () => {
    if (!selectedId) return;
    const networkType =
      selectedId === 'eth' ? WalletType.EVM : WalletType.SOLANA;
    router.navigate({
      pathname: '/home/transaction/create',
      params: { networkType },
    });
  };

  return (
    <View className="flex-1 bg-background px-6 pt-6">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-foreground">Select Token</Text>
      </View>
      <TokenList
        isLoading={isBalancesLoading || isPricesLoading}
        onSelectToken={setSelectedId}
        selectedTokenId={selectedId || undefined}
        activeTab={activeTab}
        searchQuery={searchQuery}
        filteredTokens={filteredTokens}
        groupedTokens={groupedTokens}
        hasResults={hasResults}
        emptyMessage={emptyMessage}
        onTabChange={setActiveTab}
        onSearchChange={setSearchQuery}
      />
      <View className="mt-6">
        <Button onPress={handleContinue} disabled={!selectedId}>
          <Text className="text-primary-foreground font-medium">Continue</Text>
        </Button>
      </View>
    </View>
  );
}
