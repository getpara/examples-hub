import { OAuthMethod } from '@getpara/react-native-wallet';

export function generateProviderRows(
  providers: OAuthMethod[],
  maxProvidersPerRow: number
): OAuthMethod[][] {
  const rows: OAuthMethod[][] = [];
  for (let i = 0; i < providers.length; i += maxProvidersPerRow) {
    rows.push(providers.slice(i, i + maxProvidersPerRow));
  }
  return rows;
}
