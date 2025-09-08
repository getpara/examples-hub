import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  decimalToHex,
  getCosmosAddress,
  hexStringToBase64,
  hexToDecimal,
  hexToSignature,
  hexToUint8Array,
  truncateAddress,
  formatCurrency,
  formatAssetQuantity,
} from '../../src/utils/index.js';

const TEST_HEX_STRING = '74686520717569636b2062726f776e20666f78206a756d7073206f76657220746865206c617a7920646f67';
const TEST_B64_STRING = 'dGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZw==';
const TEST_HEX_SIG = {
  r: '0x686520717569636b2062726f776e20666f78206a756d7073206f766572207468',
  s: '0x65206c617a7920646f67',
  v: 0n,
};
const TEST_UINT8_ARRAY = new Uint8Array(Buffer.from(TEST_HEX_STRING, 'hex'));
const TEST_DECIMAL = `${parseInt(TEST_HEX_STRING, 16)}`;

const TEST_PUB_KEY_HEX_SHORT = '74686520717569636b2062726f776e20666f78206a756d7073206f7665722074633';
const TEST_PUB_KEY_HEX_LONG =
  '04b4632d08485ff1df2db55b9dafd23347d1c47a457072a1e87be26896549a87378ec38ff91d43e8c2092ebda601780485263da089465619e0358a5c1be7ac91f4';
const TEST_COSMOS_ADDRESS = '1w8pqlg2vy6dhalwlxdzx5duxmruav07av9357t';
const TEST_COSMOS_ADDRESS_PREFIX = 'sample1w8pqlg2vy6dhalwlxdzx5duxmruav07ap3ngu5';
const TEST_COSMOS_ADDRESS_LONG = '1j08ys4ct2hzzc2hcz6h2hgrvlmsjynaw570hj5';

describe('formattingUtils', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  describe('hexStringToBase64', () => {
    it('success', () => {
      const resp = hexStringToBase64(TEST_HEX_STRING);

      expect(resp).toBe(TEST_B64_STRING);
    });
    it('success - 0x string', () => {
      const resp = hexStringToBase64(`0x${TEST_HEX_STRING}`);

      expect(resp).toBe(TEST_B64_STRING);
    });
  });
  describe('hexToSignature', () => {
    it('success', () => {
      const resp = hexToSignature(TEST_HEX_STRING);

      expect(resp).toStrictEqual(TEST_HEX_SIG);
    });
  });
  describe('hexToUint8Array', () => {
    it('success', () => {
      const resp = hexToUint8Array(TEST_HEX_STRING);

      expect(resp).toStrictEqual(TEST_UINT8_ARRAY);
    });
    it('success - 0x string', () => {
      const resp = hexToUint8Array(`0x${TEST_HEX_STRING}`);

      expect(resp).toStrictEqual(TEST_UINT8_ARRAY);
    });
  });
  describe('hexToDecimal', () => {
    it('success', () => {
      const resp = hexToDecimal(TEST_HEX_STRING);

      expect(resp).toStrictEqual(TEST_DECIMAL);
    });
    it('success - 0x string', () => {
      const resp = hexToDecimal(`0x${TEST_HEX_STRING}`);

      expect(resp).toStrictEqual(TEST_DECIMAL);
    });
  });
  describe('decimalToHex', () => {
    it('success', () => {
      const decimal = hexToDecimal(`0x${TEST_HEX_STRING}`);
      const resp = decimalToHex(decimal);

      expect(resp).toStrictEqual('0x1');
    });
  });
  describe('getCosmosAddress', () => {
    it('success - short', () => {
      const resp = getCosmosAddress(TEST_PUB_KEY_HEX_SHORT, '');

      expect(resp).toStrictEqual(TEST_COSMOS_ADDRESS);
    });
    it('success - long', () => {
      const resp = getCosmosAddress(TEST_PUB_KEY_HEX_LONG, '');

      expect(resp).toStrictEqual(TEST_COSMOS_ADDRESS_LONG);
    });
    it('success - short with prefix', () => {
      const resp = getCosmosAddress(TEST_PUB_KEY_HEX_SHORT, 'sample');

      expect(resp).toStrictEqual(TEST_COSMOS_ADDRESS_PREFIX);
    });
    it('success - short with 0x string', () => {
      const resp = getCosmosAddress(`0x${TEST_PUB_KEY_HEX_SHORT}`, '');

      expect(resp).toStrictEqual(TEST_COSMOS_ADDRESS);
    });
    it('fail - compressPubkey', () => {
      expect(() => getCosmosAddress('INVALID', '')).toThrowError('Invalid pubkey length');
    });
  });
  describe('truncateAddress', () => {
    it('success - evm', () => {
      const resp = truncateAddress(TEST_COSMOS_ADDRESS, 'EVM');

      expect(resp).toStrictEqual('1w8pql...357t');
    });
    it('success - cosmos', () => {
      const resp = truncateAddress(TEST_COSMOS_ADDRESS_PREFIX, 'COSMOS');

      expect(resp).toStrictEqual('sample1w8p...ngu5');
    });
    it('success - solana', () => {
      const resp = truncateAddress(TEST_COSMOS_ADDRESS, 'SOLANA');

      expect(resp).toStrictEqual('1w8p...357t');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      const assetValue = { value: 1234.56, currency: 'USD' as const };
      const result = formatCurrency(assetValue);
      expect(result).toBe('$1,234.56');
    });

    it('should format EUR currency correctly', () => {
      const assetValue = { value: 999.99, currency: 'EUR' as const } as any;
      const result = formatCurrency(assetValue);
      expect(result).toBe('€999.99');
    });

    it('should format small values (< 0.01) as 0', () => {
      const assetValue = { value: 0.005, currency: 'USD' as const };
      const result = formatCurrency(assetValue);
      expect(result).toBe('$0');
    });

    it('should format exactly 0.01 correctly', () => {
      const assetValue = { value: 0.01, currency: 'USD' as const };
      const result = formatCurrency(assetValue);
      expect(result).toBe('$0.01');
    });

    it('should format negative values correctly', () => {
      const assetValue = { value: -123.45, currency: 'USD' as const };
      const result = formatCurrency(assetValue);
      expect(result).toBe('-$123.45');
    });

    it('should format small negative values (< 0.01) as 0', () => {
      const assetValue = { value: -0.005, currency: 'USD' as const };
      const result = formatCurrency(assetValue);
      expect(result).toBe('$0');
    });

    it('should return fallback when value is undefined', () => {
      const result = formatCurrency(undefined, { fallback: 'N/A' });
      expect(result).toBe('N/A');
    });

    it('should return empty string when value is undefined and no fallback', () => {
      const result = formatCurrency(undefined);
      expect(result).toBe('');
    });

    it('should handle zero value correctly', () => {
      const assetValue = { value: 0, currency: 'USD' as const };
      const result = formatCurrency(assetValue);
      expect(result).toBe('$0');
    });

    it('should handle very large values correctly', () => {
      const assetValue = { value: 1234567.89, currency: 'USD' as const };
      const result = formatCurrency(assetValue);
      expect(result).toBe('$1,234,567.89');
    });
  });

  describe('formatAssetQuantity', () => {
    it('should format quantity with symbol correctly', () => {
      const result = formatAssetQuantity({
        quantity: 1234.567,
        symbol: 'ETH',
        decimals: 3,
      });
      expect(result).toBe('1,234.567 ETH');
    });

    it('should format quantity without symbol correctly', () => {
      const result = formatAssetQuantity({
        quantity: 1234.567,
        decimals: 3,
      });
      expect(result).toBe('1,234.567');
    });

    it('should format small quantities with 6 decimal places (default)', () => {
      const result = formatAssetQuantity({
        quantity: 0.0005,
        symbol: 'ETH',
      });
      expect(result).toBe('0.0005 ETH');
    });

    it('should format exactly 0.001 correctly', () => {
      const result = formatAssetQuantity({
        quantity: 0.001,
        symbol: 'ETH',
      });
      expect(result).toBe('0.001 ETH');
    });

    it('should use default decimals (6) for very small quantities', () => {
      const result = formatAssetQuantity({
        quantity: 0.000001,
        symbol: 'ETH',
      });
      expect(result).toBe('0.000001 ETH');
    });

    it('should use default decimals (3) for regular quantities', () => {
      const result = formatAssetQuantity({
        quantity: 123.456,
        symbol: 'ETH',
      });
      expect(result).toBe('123.456 ETH');
    });

    it('should respect custom decimals parameter', () => {
      const result = formatAssetQuantity({
        quantity: 123.456789,
        symbol: 'ETH',
        decimals: 2,
      });
      expect(result).toBe('123.46 ETH');
    });

    it('should handle zero quantity correctly', () => {
      const result = formatAssetQuantity({
        quantity: 0,
        symbol: 'ETH',
        decimals: 3,
        fallback: '0.000 ETH',
      });
      expect(result).toBe('0.000 ETH');
    });

    it('should handle negative quantities correctly', () => {
      const result = formatAssetQuantity({
        quantity: -123.456,
        symbol: 'ETH',
        decimals: 3,
      });
      expect(result).toBe('-123.456 ETH');
    });

    it('should handle small negative quantities (< 0.001) as 0', () => {
      const result = formatAssetQuantity({
        quantity: -0.0005,
        symbol: 'ETH',
      });
      expect(result).toBe('-0.0005 ETH');
    });

    it('should return fallback when quantity is undefined', () => {
      const result = formatAssetQuantity({
        quantity: undefined,
        symbol: 'ETH',
        fallback: 'N/A',
      });
      expect(result).toBe('N/A');
    });

    it('should return empty string when quantity is undefined and no fallback', () => {
      const result = formatAssetQuantity({
        quantity: undefined,
        symbol: 'ETH',
      });
      expect(result).toBe('');
    });

    it('should handle empty symbol correctly', () => {
      const result = formatAssetQuantity({
        quantity: 123.456,
        symbol: '',
        decimals: 3,
      });
      expect(result).toBe('123.456');
    });

    it('should handle very large quantities correctly', () => {
      const result = formatAssetQuantity({
        quantity: 1234567.89,
        symbol: 'ETH',
        decimals: 2,
      });
      expect(result).toBe('1,234,567.89 ETH');
    });

    it('should handle edge case where quantity is exactly at threshold', () => {
      const result = formatAssetQuantity({
        quantity: 0.000001,
        symbol: 'ETH',
        decimals: 6,
      });
      expect(result).toBe('0.000001 ETH');
    });
  });
});
