import { describe, it, expect, vi, beforeEach } from 'vitest';
import { backpackWallet } from '../../../src/wallets/connectors/backpack/backpack.js';
import { hasInjectedProvider } from '../../../src/utils/getInjectedConnector.js';
import { getInjectedConnector } from '../../../src/utils/getInjectedConnector.js';
import { getWalletConnectConnector } from '../../../src/utils/getWalletConnectConnector.js';

// backpack.test.ts

// Mocks
vi.mock('../../../src/utils/getInjectedConnector', () => ({
  getInjectedConnector: vi.fn(() => 'mockInjectedConnector'),
  hasInjectedProvider: vi.fn(),
}));
vi.mock('../../../src/utils/getWalletConnectConnector', () => ({
  getWalletConnectConnector: vi.fn(() => 'mockWalletConnectConnector'),
}));
vi.mock('../../../src/wallets/connectors/backpack/backpackIcon', () => ({
  icon: 'mockIconUrl',
}));

const defaultOptions = {
  projectId: 'test-project-id',
};

describe('backpackWallet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns wallet with injected connector when Backpack is injected', () => {
    vi.mocked(hasInjectedProvider).mockReturnValue(true);

    const wallet = backpackWallet(defaultOptions);

    expect(wallet.id).toBe('backpack');
    expect(wallet.name).toBe('Backpack');
    expect(wallet.iconUrl).toBe('mockIconUrl');
    expect(wallet.installed).toBe(true);
    expect(wallet.isExtension).toBe(true);
    expect(wallet.isMobile).toBe(true);
    expect(wallet.downloadUrl).toBe('https://backpack.app/download');
    expect(getInjectedConnector).toHaveBeenCalledWith({ namespace: 'backpack.ethereum' });
    expect(wallet.createConnector).toBe('mockInjectedConnector');
  });

  it('returns wallet with WalletConnect connector when Backpack is not injected', () => {
    vi.mocked(hasInjectedProvider).mockReturnValue(false);

    const wallet = backpackWallet(defaultOptions);

    expect(wallet.installed).toBe(false);
    expect(getWalletConnectConnector).toHaveBeenCalledWith({
      projectId: 'test-project-id',
    });
    expect(wallet.createConnector).toBe('mockWalletConnectConnector');
  });

  it('getUri returns uri as-is', () => {
    vi.mocked(hasInjectedProvider).mockReturnValue(false);

    const wallet = backpackWallet(defaultOptions);
    const uri = 'wc:test-uri';
    expect(wallet.getUri?.(uri)).toBe(uri);
  });
});
