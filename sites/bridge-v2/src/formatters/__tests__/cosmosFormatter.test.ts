import { expect, describe, it } from 'vitest';
import { formatCosmosTransaction, formatCosmosMessage } from '../cosmosFormatter';

describe('Cosmos Formatter', () => {
  describe('formatCosmosTransaction', () => {
    it('should format a basic ATOM transfer with proto', async () => {
      const publicKey = new Uint8Array(33); // Placeholder public key

      const result = await formatCosmosTransaction(
        {
          to: 'cosmos1deadbeefdeadbeefdeadbeefdeadbeefdead',
          amount: '1000000', // 1 ATOM (uatom)
          denom: 'uatom',
          sequence: 0,
          accountNumber: 0,
          chainId: 'cosmoshub-4',
          format: 'proto', // Use modern proto format
        },
        'cosmos1sendersendersendersendersendersender',
        publicKey,
        'cosmoshub-4',
      );

      // Should return an object with signBytes and signDoc for now
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('signBytes');
      expect(result).toHaveProperty('signDoc');
      expect(result.signBytes).toBeInstanceOf(Uint8Array);
    });
  });

  describe('formatCosmosMessage', () => {
    it('should format a simple message', () => {
      const result = formatCosmosMessage('hello cosmos', 'cosmos1sendersendersendersendersendersender');

      // Should return a valid base64 string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);

      // Should be valid base64
      expect(() => Buffer.from(result, 'base64')).not.toThrow();

      // Base64 regex check
      expect(result).toMatch(/^[A-Za-z0-9+/]*=*$/);
    });
  });
});
