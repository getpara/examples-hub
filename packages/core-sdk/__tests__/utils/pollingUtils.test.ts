import { describe, expect, it, vi, afterEach } from 'vitest';
import { waitUntilTrue } from '../../src/utils/pollingUtils.js';

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('formattingUtils', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  describe('waitUntilTrue', () => {
    it('success', async () => {
      let fnCalls = 0;
      const sampleFn = async () => {
        await timeout(1000);
        fnCalls++;

        if (fnCalls === 2) {
          return true;
        }
        return false;
      };
      const resp = await waitUntilTrue(sampleFn, 10_000, 1000);
      expect(resp).toBeTruthy();
    });
    it('times out', async () => {
      const sampleFn = async () => {
        await timeout(1000);

        return false;
      };
      const resp = await waitUntilTrue(sampleFn, 2_000, 1000);
      expect(resp).toBeFalsy();
    });
  }, 10_000);
});
