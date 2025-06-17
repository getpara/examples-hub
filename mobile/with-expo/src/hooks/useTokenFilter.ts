import { useState, useMemo } from 'react';
import { SupportedWalletType } from '@/types';
import { filterAndGroupTokens, TokenData } from '@/utils/tokenUtils';

export function useTokenFilter(tokens: TokenData[]) {
  const [activeTab, setActiveTab] = useState<'all' | SupportedWalletType>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and group tokens
  const { filteredTokens, groupedTokens } = useMemo(() => {
    return filterAndGroupTokens(tokens, activeTab, searchQuery);
  }, [tokens, activeTab, searchQuery]);

  // Check if there are results
  const hasResults = filteredTokens.length > 0;

  // Get empty state message
  const emptyMessage = useMemo(() => {
    if (searchQuery) {
      return 'No tokens match your search';
    }
    if (activeTab === 'all') {
      return 'No tokens available';
    }
    const networkName = activeTab === 'EVM' ? 'Ethereum' : 'Solana';
    return `No ${networkName} tokens available`;
  }, [searchQuery, activeTab]);

  // Reset filters
  const resetFilters = () => {
    setActiveTab('all');
    setSearchQuery('');
  };

  return {
    // State
    activeTab,
    searchQuery,
    filteredTokens,
    groupedTokens,
    hasResults,
    emptyMessage,

    // Actions
    setActiveTab,
    setSearchQuery,
    resetFilters,
  };
}
