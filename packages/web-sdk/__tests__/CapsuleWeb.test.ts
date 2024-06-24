import { expect, describe, it } from 'vitest';

import Capsule, { Environment, WalletType } from '../src';

describe('CoreCapsule', () => {
  describe('constructor', () => {
    it('creates a new instance of CoreCapsule with correct fields', () => {
      const apiKey = 'api-key-123';
      const capsule = new Capsule(Environment.DEV, apiKey);

      expect(capsule).toBeInstanceOf(Capsule);
      expect(capsule.ctx.env).toBe(Environment.DEV);
      expect(capsule.ctx.apiKey).toBe(apiKey);
      expect(capsule.getWallets()).toEqual({});
      expect(capsule.getED25519Wallets()).toEqual({});

      // casting as any to access protected fields
      expect((capsule as any).supportedWalletTypes).toEqual([WalletType.EVM]);
      console.log(capsule);
    });
  });
});
