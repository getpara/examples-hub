import { describe, expect, it, vi } from 'vitest';
import { getWalletConnectUri } from '../../src/utils/getWalletConnectUri';

describe('getWalletConnectUri', () => {
  it('returns qrUrl for coinbaseWallet', async () => {
    const connector: any = {
      type: 'coinbaseWallet',
      getProvider: vi.fn().mockResolvedValue({ qrUrl: 'coinbase-qr' }),
    };
    const uri = await getWalletConnectUri(connector);
    expect(uri).toBe('coinbase-qr');
  });

  it('resolves uri from display_uri event', async () => {
    const fakeProvider = {
      once: (event: string, cb: (uri: string) => void) => {
        if (event === 'display_uri') cb('wc-uri');
      },
    };
    const connector: any = {
      type: 'walletConnect',
      getProvider: vi.fn().mockResolvedValue(fakeProvider),
    };
    const uri = await getWalletConnectUri(connector);
    expect(uri).toBe('wc-uri');
  });

  it('applies uriConverter if provided', async () => {
    const fakeProvider = {
      once: (event: string, cb: (uri: string) => void) => {
        if (event === 'display_uri') cb('wc-uri');
      },
    };
    const connector: any = {
      type: 'walletConnect',
      getProvider: vi.fn().mockResolvedValue(fakeProvider),
    };
    const uri = await getWalletConnectUri(connector, uri => `converted:${uri}`);
    expect(uri).toBe('converted:wc-uri');
  });
});
