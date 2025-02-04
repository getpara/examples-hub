import { describe, vi, afterEach, it, expect } from 'vitest';
import { MockPara, mockWaitForLoginAndSetup } from '../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../constants';
import { waitForLoginAndSetup } from '../../../src/provider/actions/waitForLoginAndSetup';

describe('waitForLoginAndSetup', () => {
  const paraClient = new MockPara(Environment.DEV, API_KEY);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('success', async () => {
    await waitForLoginAndSetup(paraClient, {});

    expect(mockWaitForLoginAndSetup).toHaveBeenCalledTimes(1);
  });
  describe('fail', () => {
    it('no para', async () => {
      expect(waitForLoginAndSetup(undefined)).rejects.toThrowError();
    });
    it('no args', async () => {
      expect(waitForLoginAndSetup(paraClient, undefined)).rejects.toThrowError();
    });
  });
});
