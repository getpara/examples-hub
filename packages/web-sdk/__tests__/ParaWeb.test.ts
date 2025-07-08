import { expect, describe, it, vi } from 'vitest';

import Para, { Environment } from '../src/index.js';

vi.mock('../src/utils/isPasskeySupported.js', () => ({
  isPasskeySupported: vi.fn().mockResolvedValue(true),
}));

describe('ParaCore', () => {
  describe('constructor', () => {
    describe('creates a new instance of ParaCore with correct fields', () => {
      it('without Farcaster', async () => {
        const apiKey = 'api-key-123';
        const para = new Para(Environment.DEV, apiKey);

        expect(para).toBeInstanceOf(Para);
        expect(para.ctx.env).toBe(Environment.DEV);
        expect(para.ctx.apiKey).toBe(apiKey);
        expect(para.wallets).toEqual({});

        expect(await para.isPasskeySupported()).toBe(true);
      });

      it('with Farcaster', async () => {
        vi.doMock('@farcaster/miniapp-sdk', () => ({
          sdk: {
            isInMiniApp: vi.fn().mockResolvedValue(true),
          },
        }));

        const apiKey = 'api-key-123';
        const para = new Para(Environment.DEV, apiKey);

        await (para as unknown as any).ready();

        expect(para).toBeInstanceOf(Para);
        expect(para.ctx.env).toBe(Environment.DEV);
        expect(para.ctx.apiKey).toBe(apiKey);
        expect(para.wallets).toEqual({});

        expect(para.isReady).toBe(true);
        expect(para.isFarcasterMiniApp).toBe(true);

        expect(await para.isPasskeySupported()).toBe(true);
      });

      it('with Farcaster (error)', async () => {
        vi.doMock('@farcaster/miniapp-sdk', () => ({ sdk: undefined }));

        const apiKey = 'api-key-123';
        const para = new Para(Environment.DEV, apiKey);

        await (para as unknown as any).ready();

        expect(para).toBeInstanceOf(Para);
        expect(para.ctx.env).toBe(Environment.DEV);
        expect(para.ctx.apiKey).toBe(apiKey);
        expect(para.wallets).toEqual({});

        expect(para.isReady).toBe(true);
        expect(para.isFarcasterMiniApp).toBe(false);

        expect(await para.isPasskeySupported()).toBe(true);
      });
    });
  });
});
