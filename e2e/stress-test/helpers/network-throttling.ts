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
