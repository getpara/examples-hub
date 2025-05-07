import { expect, describe, it, vi } from 'vitest';

import Para, { Environment } from '../src/index.js';

vi.mock('../src/utils/isPasskeySupported.js', () => ({
  isPasskeySupported: vi.fn().mockResolvedValue(true),
}));

describe('ParaCore', () => {
  describe('constructor', () => {
    it('creates a new instance of ParaCore with correct fields', async () => {
      const apiKey = 'api-key-123';
      const para = new Para(Environment.DEV, apiKey);

      expect(para).toBeInstanceOf(Para);
      expect(para.ctx.env).toBe(Environment.DEV);
      expect(para.ctx.apiKey).toBe(apiKey);
      expect(para.wallets).toEqual({});

      expect(await para.isPasskeySupported()).toBe(true);
    });
  });
});
