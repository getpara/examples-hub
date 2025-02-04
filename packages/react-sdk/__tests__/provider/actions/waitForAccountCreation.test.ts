import { describe, vi, afterEach, it, expect } from 'vitest';
import { MockPara, mockWaitForAccountCreation } from '../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../constants';
import { waitForAccountCreation } from '../../../src/provider/actions/waitForAccountCreation';

describe('waitForAccountCreation', () => {
  const paraClient = new MockPara(Environment.DEV, API_KEY);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('success', async () => {
    await waitForAccountCreation(paraClient);

    expect(mockWaitForAccountCreation).toHaveBeenCalledTimes(1);
  });
  describe('fail', () => {
    it('no para', async () => {
      expect(waitForAccountCreation(undefined)).rejects.toThrowError();
    });
  });
});
