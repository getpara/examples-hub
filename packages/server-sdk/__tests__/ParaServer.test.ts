import { expect, describe, it } from 'vitest';

import Para, { Environment } from '../src/index.js';

describe('ParaServer', () => {
  describe('constructor', () => {
    it('creates a new instance of ParaServer with correct fields', () => {
      const apiKey = 'api-key-123';
      const para = new Para(Environment.DEV, apiKey, {});

      expect(para).toBeInstanceOf(Para);
      expect(para.ctx.env).toBe(Environment.DEV);
      expect(para.ctx.apiKey).toBe(apiKey);
      expect(para.wallets).toEqual({});
    });
  });

  describe('claimPregenWallets', () => {
    it('throws an error when called from server SDK', async () => {
      const para = new Para(Environment.DEV, 'api-key-123');

      await expect(
        para.claimPregenWallets({
          pregenIdentifier: 'test-user',
          pregenIdentifierType: 'EMAIL',
        }),
      ).rejects.toThrow('claimPregenWallets is not available in the server SDK');
    });
  });
});
