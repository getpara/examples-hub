import { describe, expect, it } from 'vitest';
import { MockPara } from '../mocks/mockParaCore';
import ParaCore, { Environment } from '../../src';
import { API_KEY, PARTNER } from '../constants';

describe('ParaCore - constructor', () => {
  describe('constructor', () => {
    it('no api key', () => {
      expect(() => new MockPara(Environment.DEV, undefined as unknown as string)).toThrow('A Para API key is required.');
    });

    it('valid args', () => {
      const para = new MockPara(Environment.DEV, API_KEY);

      expect(para).toBeInstanceOf(ParaCore);
      expect(para.ctx.env).toBe(Environment.DEV);
      expect(para.ctx.apiKey).toBe(API_KEY);
      expect(para.wallets).toEqual({});
      expect(para.externalWallets).toEqual({});

      // casting as any to access protected fields
      expect((para as any).supportedWalletTypes).toEqual([]);
    });

    it('with useStorageOverrides', () => {
      const opts = {
        useStorageOverrides: true,
        localStorageGetItemOverride: () => Promise.resolve('test'),
        localStorageSetItemOverride: () => Promise.resolve(),
        sessionStorageGetItemOverride: () => Promise.resolve('test'),
        sessionStorageSetItemOverride: () => Promise.resolve(),
        clearStorageOverride: () => Promise.resolve(),
      };
      let para = new MockPara(Environment.DEV, API_KEY, opts);

      expect(para).toBeDefined();
      expect((para as unknown as any).localStorageGetItem).toEqual(opts.localStorageGetItemOverride);
      expect((para as unknown as any).localStorageSetItem).toEqual(opts.localStorageSetItemOverride);
      expect((para as unknown as any).sessionStorageGetItem).toEqual(opts.sessionStorageGetItemOverride);
      expect((para as unknown as any).sessionStorageSetItem).toEqual(opts.sessionStorageSetItemOverride);
      expect((para as unknown as any).clearStorage).toEqual(opts.clearStorageOverride);
    });
  });

  describe('partner helpers', () => {
    it('partnerLogo', async () => {
      const para = new MockPara(Environment.DEV, API_KEY);
      await para.touchSession();

      expect((para as unknown as any).partnerLogo).toBeDefined();
      expect((para as unknown as any).partnerLogo).toBe(PARTNER.logoUrl);
    });

    it('partnerName', async () => {
      const para = new MockPara(Environment.DEV, API_KEY);
      await para.touchSession();

      expect((para as unknown as any).partnerName).toBeDefined();
      expect((para as unknown as any).partnerName).toBe(PARTNER.displayName);
    });
  });
});
