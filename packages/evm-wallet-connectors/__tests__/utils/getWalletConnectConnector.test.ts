import { describe, expect, it } from 'vitest';
import { getWalletConnectConnector } from '../../src/utils/getWalletConnectConnector';
import { WalletDetailsParams } from '../../src/types/Wallet';

describe('getWalletConnectConnector', () => {
  it('returns undefined if no projectId', () => {
    expect(getWalletConnectConnector({ projectId: '' })).toBeUndefined();
  });

  it('returns a function if projectId is provided', () => {
    const fn = getWalletConnectConnector({ projectId: 'abc' });
    expect(typeof fn).toBe('function');
  });

  it('returns undefined if projectId is missing', () => {
    // @ts-expect-error
    expect(getWalletConnectConnector({})).toBeUndefined();
  });

  it('returned function can be called with walletDetails', () => {
    const fn = getWalletConnectConnector({ projectId: 'abc' });
    expect(typeof fn).toBe('function');
    // Minimal walletDetails mock
    const walletDetails = { paraDetails: { id: 'walletConnect', isParaConnector: true } };
    const connectorFn = fn(walletDetails as WalletDetailsParams);
    expect(typeof connectorFn).toBe('function');
  });

  it('returned function can be called with walletConnectParameters', () => {
    const fn = getWalletConnectConnector({
      projectId: 'abc',
      walletConnectParameters: { metadata: { name: 'test', description: 'desc', url: 'url', icons: [] } },
    });
    expect(typeof fn).toBe('function');
    const walletDetails = { paraDetails: { id: 'walletConnect', isParaConnector: true } };
    const connectorFn = fn(walletDetails as WalletDetailsParams);
    expect(typeof connectorFn).toBe('function');
  });
});
