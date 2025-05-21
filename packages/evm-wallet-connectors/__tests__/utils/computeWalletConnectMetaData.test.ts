import { describe, expect, it } from 'vitest';
import { computeWalletConnectMetaData } from '../../src/utils/computeWalletConnectMetaData';

describe('computeWalletConnectMetaData', () => {
  it('returns correct metadata with all fields', () => {
    const meta = computeWalletConnectMetaData({
      appName: 'TestApp',
      appDescription: 'desc',
      appUrl: 'https://test.com',
      appIcon: 'icon.png',
    });
    expect(meta?.name).toBe('TestApp');
    expect(meta?.description).toBe('desc');
    expect(meta?.url).toBe('https://test.com');
    expect(meta?.icons).toContain('icon.png');
  });

  it('falls back to appName and window.location', () => {
    const meta = computeWalletConnectMetaData({ appName: 'TestApp' });
    expect(meta?.description).toBe('TestApp');
    expect(Array.isArray(meta?.icons)).toBe(true);
  });

  it('returns empty icons array if no appIcon', () => {
    const meta = computeWalletConnectMetaData({ appName: 'TestApp', appDescription: 'desc', appUrl: 'url' });
    expect(meta?.icons).toEqual([]);
  });

  it('returns appName as description if appDescription is missing', () => {
    const meta = computeWalletConnectMetaData({ appName: 'TestApp', appUrl: 'url', appIcon: 'icon.png' });
    expect(meta?.description).toBe('TestApp');
  });
});
