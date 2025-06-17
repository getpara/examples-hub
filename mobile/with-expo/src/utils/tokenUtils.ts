import { WalletType } from '@getpara/react-native-wallet';
import { ImageSourcePropType } from 'react-native';
import { SUPPORTED_WALLET_TYPES, SupportedWalletType } from '@/types';

export interface TokenData {
  id: string;
  name: string;
  ticker: string;
  networkType: WalletType;
  balance: number;
  balanceUsd: number | null;
  usdPrice: number | null;
  change24h: number | null;
  logoUri?: string;
}

// Filtering functions
export function filterTokensByNetwork(
  tokens: TokenData[],
  networkType: 'all' | SupportedWalletType
): TokenData[] {
  if (networkType === 'all') {
    return tokens;
  }
  return tokens.filter((token) => token.networkType === networkType);
}

export function searchTokens(
  tokens: TokenData[],
  searchQuery: string
): TokenData[] {
  if (!searchQuery) {
    return tokens;
  }

  const query = searchQuery.toLowerCase();
  return tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(query) ||
      token.ticker.toLowerCase().includes(query)
  );
}

// Grouping functions
export function groupTokensByNetwork(
  tokens: TokenData[]
): Record<SupportedWalletType, TokenData[]> {
  const groups: Record<SupportedWalletType, TokenData[]> = {
    [WalletType.EVM]: [],
    [WalletType.SOLANA]: [],
  };

  tokens.forEach((token) => {
    if (
      SUPPORTED_WALLET_TYPES.includes(token.networkType as SupportedWalletType)
    ) {
      groups[token.networkType as SupportedWalletType].push(token);
    }
  });

  return groups;
}

// Network utility functions
export function getNetworkName(networkType: SupportedWalletType): string {
  switch (networkType) {
    case WalletType.EVM:
      return 'Ethereum';
    case WalletType.SOLANA:
      return 'Solana';
    default:
      return 'Unknown Network';
  }
}

export function getNetworkIcon(
  networkType: SupportedWalletType
): ImageSourcePropType | undefined {
  switch (networkType) {
    case WalletType.EVM:
      return require('~/assets/ethereum.png');
    case WalletType.SOLANA:
      return require('~/assets/solana.png');
    default:
      return undefined;
  }
}

export function getTokenLogo(ticker: string): ImageSourcePropType {
  switch (ticker.toUpperCase()) {
    case 'ETH':
      return require('~/assets/ethereum.png');
    case 'SOL':
      return require('~/assets/solana.png');
    default:
      return require('~/assets/ethereum.png');
  }
}

// Combined filter and group function
export function filterAndGroupTokens(
  tokens: TokenData[],
  networkType: 'all' | SupportedWalletType,
  searchQuery: string
): {
  filteredTokens: TokenData[];
  groupedTokens: Record<SupportedWalletType, TokenData[]>;
} {
  let filteredTokens = filterTokensByNetwork(tokens, networkType);
  filteredTokens = searchTokens(filteredTokens, searchQuery);
  const groupedTokens = groupTokensByNetwork(filteredTokens);

  return {
    filteredTokens,
    groupedTokens,
  };
}
