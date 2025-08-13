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

    describe('constructor overloads', () => {
      it('should handle 1-parameter constructor (apiKey)', () => {
        const apiKey = 'dev_testApiKey';
        const para = new MockPara(apiKey);

        expect(para).toBeInstanceOf(MockPara);
        expect(para.ctx.apiKey).toBe(apiKey);
        expect(para.ctx.env).toBe(Environment.DEV); // Default environment
      });

      it('should handle 2-parameter constructor (apiKey, opts)', () => {
        const apiKey = 'dev_testApiKey';
        const opts = {};
        const para = new MockPara(apiKey, opts);

        expect(para).toBeInstanceOf(MockPara);
        expect(para.ctx.apiKey).toBe(apiKey);
        expect(para.ctx.env).toBe(Environment.DEV); // Default environment
      });

      it('should handle 2-parameter constructor (env, apiKey)', () => {
        const env = Environment.DEV;
        const apiKey = 'dev_testApiKey';
        const para = new MockPara(env, apiKey);

        expect(para).toBeInstanceOf(MockPara);
        expect(para.ctx.env).toBe(env);
        expect(para.ctx.apiKey).toBe(apiKey);
      });

      it('should handle 3-parameter constructor (env, apiKey, opts)', () => {
        const env = Environment.DEV;
        const apiKey = 'dev_testApiKey';
        const opts = {};
        const para = new MockPara(env, apiKey, opts);

        expect(para).toBeInstanceOf(MockPara);
        expect(para.ctx.env).toBe(env);
        expect(para.ctx.apiKey).toBe(apiKey);
      });

      it('should handle undefined environment in 2-parameter constructor', () => {
        const apiKey = 'dev_testApiKey';
        const para = new MockPara(undefined, apiKey);

        expect(para).toBeInstanceOf(MockPara);
        expect(para.ctx.apiKey).toBe(apiKey);
      });

      it('should handle undefined environment in 3-parameter constructor', () => {
        const apiKey = 'dev_testApiKey';
        const opts = {};
        const para = new MockPara(undefined, apiKey, opts);

        expect(para).toBeInstanceOf(MockPara);
        expect(para.ctx.apiKey).toBe(apiKey);
      });
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
