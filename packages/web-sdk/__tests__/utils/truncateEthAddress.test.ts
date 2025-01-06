import { expect, describe, it } from 'vitest';

import { truncateEthAddress } from '../../src/utils/truncateEthAddress.js';

const TEST_ETH_ADDRESS = '0x1D1479C185d32EB90533a0836B3CFa5F84A0E6B';

describe('truncateEthAddress', () => {
  describe('truncateEthAddress', () => {
    it('success', () => {
      const resp = truncateEthAddress(TEST_ETH_ADDRESS);

      expect(resp).toBe('0x1D14…0E6B');
    });
    it('success - no match', () => {
      const resp = truncateEthAddress('not an address');

      expect(resp).toBe('not an address');
    });
  });
});
