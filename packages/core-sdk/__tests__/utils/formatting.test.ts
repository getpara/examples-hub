import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  decimalToHex,
  getCosmosAddress,
  hexStringToBase64,
  hexToDecimal,
  hexToSignature,
  hexToUint8Array,
  truncateAddress,
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
});
