import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hahaWallet } from '../../../src/wallets/connectors/haha/haha.js';
import { hasInjectedProvider } from '../../../src/utils/getInjectedConnector.js';
import { getInjectedConnector } from '../../../src/utils/getInjectedConnector.js';
import { getWalletConnectConnector } from '../../../src/utils/getWalletConnectConnector.js';

// Mocks
vi.mock('../../../src/utils/getInjectedConnector', () => ({
  getInjectedConnector: vi.fn(() => 'mockInjectedConnector'),
  hasInjectedProvider: vi.fn(),
}));
vi.mock('../../../src/utils/getWalletConnectConnector', () => ({
  getWalletConnectConnector: vi.fn(() => 'mockWalletConnectConnector'),
}));
vi.mock('../../../src/wallets/connectors/haha/hahaIcon', () => ({
  icon: 'mockIconUrl',
}));

const defaultOptions = {
  projectId: 'test-project-id',
};

describe('hahaWallet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns wallet with injected connector when Haha is injected', () => {
    vi.mocked(hasInjectedProvider).mockReturnValue(true);

    const wallet = hahaWallet(defaultOptions);

    expect(wallet.id).toBe('haha');
    expect(wallet.name).toBe('HaHa');
    expect(wallet.iconUrl).toBe('mockIconUrl');
    expect(wallet.installed).toBe(true);
    expect(wallet.isExtension).toBe(true);
    expect(wallet.isMobile).toBe(true);
    expect(wallet.downloadUrl).toBe('https://www.haha.me/');
    expect(getInjectedConnector).toHaveBeenCalledWith({ namespace: 'haha' });
    expect(wallet.createConnector).toBe('mockInjectedConnector');
  });

  it('returns wallet with WalletConnect connector when Haha is not injected', () => {
    vi.mocked(hasInjectedProvider).mockReturnValue(false);

    const wallet = hahaWallet(defaultOptions);

    expect(wallet.installed).toBe(false);
    expect(getWalletConnectConnector).toHaveBeenCalledWith({
      projectId: 'test-project-id',
    });
    expect(wallet.createConnector).toBe('mockWalletConnectConnector');
  });

  it('getUri returns uri as-is', () => {
    vi.mocked(hasInjectedProvider).mockReturnValue(false);

    const wallet = hahaWallet(defaultOptions);
    const uri = 'wc:test-uri';
    expect(wallet.getUri?.(uri)).toBe(uri);
  });
});
