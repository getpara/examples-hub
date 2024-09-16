import { expect, describe, it } from 'vitest';

import CoreCapsule, { Environment, WalletType } from '../src';
import { MockPlatformUtils } from './mocks/mockPlatformUtils';

class MockCapsule extends CoreCapsule {
  protected getPlatformUtils() {
    return new MockPlatformUtils();
  }
}

describe('CoreCapsule', () => {
  describe('constructor', () => {
    it('creates a new instance of CoreCapsule with correct fields', () => {
      const apiKey = 'api-key-123';
      const capsule = new MockCapsule(Environment.DEV, apiKey);

      expect(capsule).toBeInstanceOf(CoreCapsule);
      expect(capsule.ctx.env).toBe(Environment.DEV);
      expect(capsule.ctx.apiKey).toBe(apiKey);
      expect(capsule.wallets).toEqual({});

      // casting as any to access protected fields
      expect((capsule as any).supportedWalletTypes).toEqual({ [WalletType.EVM]: { optional: false } });
    });
  });
});
