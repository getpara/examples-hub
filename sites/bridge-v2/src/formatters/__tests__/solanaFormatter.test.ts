import { expect, describe, it } from 'vitest';
import { formatSolanaTransaction, formatSolanaMessage } from '../solanaFormatter';

describe('Solana Formatter', () => {
  describe('formatSolanaTransaction', () => {
    it('should format a basic SOL transfer', async () => {
      const result = await formatSolanaTransaction(
        {
          to: '11111111111111111111111111111112', // System program address
          lamports: '1000000', // 0.001 SOL
          recentBlockhash: '11111111111111111111111111111112', // Valid Base58 blockhash
        },
        '11111111111111111111111111111111', // From address
      );

      // Should return a valid base64 string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);

      // Should be valid base64
      expect(() => Buffer.from(result, 'base64')).not.toThrow();

      // Base64 regex check
      expect(result).toMatch(/^[A-Za-z0-9+/]*=*$/);
    });
  });

  describe('formatSolanaMessage', () => {
    it('should format a simple message', () => {
      const result = formatSolanaMessage('hello solana');

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
