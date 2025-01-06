import { expect, describe, it } from 'vitest';

import {
  decimalToHex,
  hexStringToBase64,
  hexToDecimal,
  hexToSignature,
  hexToUint8Array,
} from '../../src/utils/formattingUtils.js';

const TEST_HEX_STRING = '74686520717569636b2062726f776e20666f78206a756d7073206f76657220746865206c617a7920646f67';
const TEST_B64_STRING = 'dGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZw==';
const TEST_UINT8_ARRAY = new Uint8Array(Buffer.from(TEST_HEX_STRING, 'hex'));
const TEST_DECIMAL = `${parseInt(TEST_HEX_STRING, 16)}`;
const TEST_HEX_SIG = {
  r: '0x686520717569636b2062726f776e20666f78206a756d7073206f766572207468',
  s: '0x65206c617a7920646f67',
  v: 0n,
};

describe('formattingUtils', () => {
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
});
