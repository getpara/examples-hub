import { Page } from '@playwright/test';

export type NetworkLevel = 'slow' | 'medium' | 'fast';

export const networkProfiles: Record<
  NetworkLevel,
  { latency: number; downloadThroughput: number; uploadThroughput: number }
> = {
  slow: { latency: 500, downloadThroughput: 50000, uploadThroughput: 10000 },
  medium: { latency: 100, downloadThroughput: 200000, uploadThroughput: 50000 },
  fast: { latency: 20, downloadThroughput: 1000000, uploadThroughput: 200000 },
} as const;

/**
 * Maps workflow network profiles to NetworkLevel
 * @param profile - The network profile string from environment variables (e.g., 'slow-3g', 'fast-3g', 'none')
 * @returns The corresponding NetworkLevel
 */
export function getNetworkLevel(profile: string): NetworkLevel {
  const mapping: Record<string, NetworkLevel> = {
    'none': 'fast',
    'slow-3g': 'slow',
    'fast-3g': 'medium',
    'slow-4g': 'medium',
    'cable': 'fast',
  };
  return mapping[profile] || 'fast';
}

export async function applyNetworkThrottling(page: Page, level: NetworkLevel): Promise<void> {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: networkProfiles[level].latency,
    downloadThroughput: networkProfiles[level].downloadThroughput,
    uploadThroughput: networkProfiles[level].uploadThroughput,
  });
}
