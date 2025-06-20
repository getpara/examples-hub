import { useState, useMemo } from 'react';
import {
  filterAndSortTransactions,
  SortOption,
  FilterNetwork,
  FilterType,
  SORT_OPTIONS,
} from '@/utils/transactionListUtils';
import { TransactionData } from '@/components/transaction/TransactionListItem';

export function useTransactionFilters(transactions: TransactionData[]) {
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterNetwork, setFilterNetwork] = useState<FilterNetwork>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    return filterAndSortTransactions(transactions, {
      network: filterNetwork,
      type: filterType,
      searchQuery,
      sortOption,
    });
  }, [transactions, filterNetwork, filterType, searchQuery, sortOption]);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filterNetwork !== 'all' || filterType !== 'all' || searchQuery !== ''
    );
  }, [filterNetwork, filterType, searchQuery]);

  // Toggle filter options visibility
  const toggleFilterOptions = () => {
    setShowFilterOptions((prev) => !prev);
  };

  // Reset all filters
  const resetFilters = () => {
    setSortOption('newest');
    setFilterNetwork('all');
    setFilterType('all');
    setSearchQuery('');
  };

  // Get empty state message
  const getEmptyMessage = () => {
    if (hasActiveFilters) {
      return 'No transactions match your filters';
    }
    return 'No transactions yet';
  };

  // Get empty state description
  const getEmptyDescription = () => {
    if (hasActiveFilters) {
      return '';
    }
    return 'Your transaction history will appear here';
  };

  return {
    // State
    sortOption,
    filterNetwork,
    filterType,
    searchQuery,
    showFilterOptions,
    filteredAndSortedTransactions,
    hasActiveFilters,
    sortOptions: SORT_OPTIONS,

    // Actions
    setSortOption,
    setFilterNetwork,
    setFilterType,
    setSearchQuery,
    toggleFilterOptions,
    resetFilters,

    // Utilities
    getEmptyMessage,
    getEmptyDescription,
  };
}
