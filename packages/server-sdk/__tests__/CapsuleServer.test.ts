import { expect, describe, it } from 'vitest';

import Capsule, { Environment, WalletType } from '../src';

describe('ServerCapsule', () => {
  describe('constructor', () => {
    it('creates a new instance of ServerCapsule with correct fields', () => {
      const apiKey = 'api-key-123';
      const capsule = new Capsule(Environment.DEV, apiKey, {});

      expect(capsule).toBeInstanceOf(Capsule);
      expect(capsule.ctx.env).toBe(Environment.DEV);
      expect(capsule.ctx.apiKey).toBe(apiKey);
      expect(capsule.wallets).toEqual({});

      // casting as any to access protected fields
      expect((capsule as any).supportedWalletTypes).toEqual({ [WalletType.EVM]: true });
    });
  });
});
