import { expect, describe, it } from 'vitest';
import { formatEVMTransaction, formatEVMMessage } from '../evmFormatter';

describe('EVM Formatter', () => {
  describe('formatEVMTransaction', () => {
    it('should format a simple ETH transfer', async () => {
      const result = await formatEVMTransaction(
        {
          to: '0x0000000000000000000000000000000000000001',
          value: '0x01',
          gasLimit: '0x5208',
          maxFeePerGas: '0x77359400',
          maxPriorityFeePerGas: '0x77359400',
          nonce: 0,
          type: 2,
        },
        '0x0000000000000000000000000000000000000000',
        '1',
      );

      // Should return a valid base64 string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);

      // Should be valid base64
      expect(() => Buffer.from(result, 'base64')).not.toThrow();

      // Base64 regex check
      expect(result).toMatch(/^[A-Za-z0-9+/]*=*$/);
    });

    it('should format a legacy transaction', async () => {
      const result = await formatEVMTransaction(
        {
          to: '0x0000000000000000000000000000000000000001',
          value: '0x01',
          gasLimit: '0x5208',
          gasPrice: '0x77359400',
          nonce: 0,
          type: 0, // Legacy transaction
        },
        '0x0000000000000000000000000000000000000000',
        '1',
      );

      // Should return a valid base64 string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(() => Buffer.from(result, 'base64')).not.toThrow();
      expect(result).toMatch(/^[A-Za-z0-9+/]*=*$/);
    });

    it('should format a smart contract call with data', async () => {
      const result = await formatEVMTransaction(
        {
          to: '0x43c05B2265DCC68E46996fF7CE58B1822193f953',
          value: '0x00',
          data: '0xa9059cbb0000000000000000000000000000000000000000000000000000000000000001',
          gasLimit: '0xC350',
          maxFeePerGas: '0x77359400',
          maxPriorityFeePerGas: '0x77359400',
          nonce: 5,
          type: 2,
        },
        '0x0000000000000000000000000000000000000000',
        '1',
      );

      // Should return a valid base64 string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(() => Buffer.from(result, 'base64')).not.toThrow();
      expect(result).toMatch(/^[A-Za-z0-9+/]*=*$/);
    });
  });

  describe('formatEVMMessage', () => {
    it('should format a simple message', () => {
      const result = formatEVMMessage('hello world');

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
