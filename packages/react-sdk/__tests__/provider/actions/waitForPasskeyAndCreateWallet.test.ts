import { describe, vi, afterEach, it, expect } from 'vitest';
import { MockPara, mockWaitForPasskeyAndCreateWallet } from '../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../constants';
import { waitForPasskeyAndCreateWallet } from '../../../src/provider/actions/waitForPasskeyAndCreateWallet';

describe('waitForPasskeyAndCreateWallet', () => {
  const paraClient = new MockPara(Environment.DEV, API_KEY);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('success', async () => {
    await waitForPasskeyAndCreateWallet(paraClient);

    expect(mockWaitForPasskeyAndCreateWallet).toHaveBeenCalledTimes(1);
  });
  describe('fail', () => {
    it('no para', async () => {
      await expect(waitForPasskeyAndCreateWallet(undefined)).rejects.toThrowError();
    });
  });
});
