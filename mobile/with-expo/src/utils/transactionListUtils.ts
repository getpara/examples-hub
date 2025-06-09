import { WalletType } from "@getpara/react-native-wallet";
import { TransactionData, TransactionType } from "@/components/transaction/TransactionListItem";

export type SortOption = "newest" | "oldest" | "highest" | "lowest";
export type FilterNetwork = "all" | WalletType.EVM | WalletType.SOLANA;
export type FilterType = "all" | TransactionType;

// Filtering functions
export function filterByNetwork(
  transactions: TransactionData[],
  networkType: FilterNetwork
): TransactionData[] {
  if (networkType === "all") {
    return transactions;
  }
  return transactions.filter((tx) => tx.networkType === networkType);
}

export function filterByType(
  transactions: TransactionData[],
  type: FilterType
): TransactionData[] {
  if (type === "all") {
    return transactions;
  }
  return transactions.filter((tx) => tx.type === type);
}

export function searchTransactions(
  transactions: TransactionData[],
  searchQuery: string
): TransactionData[] {
  if (!searchQuery) {
    return transactions;
  }

  const query = searchQuery.toLowerCase();
  return transactions.filter(
    (tx) =>
      tx.counterpartyAddress.toLowerCase().includes(query) ||
      tx.tokenName.toLowerCase().includes(query) ||
      tx.hash.toLowerCase().includes(query) ||
      tx.tokenTicker.toLowerCase().includes(query) ||
      tx.counterpartyName?.toLowerCase().includes(query)
  );
}

// Sorting functions
export function sortTransactions(
  transactions: TransactionData[],
  sortOption: SortOption
): TransactionData[] {
  const sorted = [...transactions];

  sorted.sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return b.timestamp - a.timestamp;
      case "oldest":
        return a.timestamp - b.timestamp;
      case "highest": {
        const aAmount = parseFloat(a.amount);
        const bAmount = parseFloat(b.amount);
        return bAmount - aAmount;
      }
      case "lowest": {
        const aAmount = parseFloat(a.amount);
        const bAmount = parseFloat(b.amount);
        return aAmount - bAmount;
      }
      default:
        return 0;
    }
  });

  return sorted;
}

// Combined filter and sort function
export function filterAndSortTransactions(
  transactions: TransactionData[],
  filters: {
    network: FilterNetwork;
    type: FilterType;
    searchQuery: string;
    sortOption: SortOption;
  }
): TransactionData[] {
  let result = filterByNetwork(transactions, filters.network);
  result = filterByType(result, filters.type);
  result = searchTransactions(result, filters.searchQuery);
  result = sortTransactions(result, filters.sortOption);

  return result;
}

// Sort options configuration
export const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" as SortOption },
  { label: "Oldest first", value: "oldest" as SortOption },
  { label: "Highest amount", value: "highest" as SortOption },
  { label: "Lowest amount", value: "lowest" as SortOption },
];