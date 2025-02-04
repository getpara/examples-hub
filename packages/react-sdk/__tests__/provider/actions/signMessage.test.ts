import { describe, vi, afterEach, it, expect } from 'vitest';
import { MockPara, mockSignMessage } from '../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../constants';
import { signMessage } from '../../../src/provider/actions/signMessage';

describe('signMessage', () => {
  const paraClient = new MockPara(Environment.DEV, API_KEY);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('success', async () => {
    await signMessage(paraClient, {
      walletId: '',
      messageBase64: '',
    });

    expect(mockSignMessage).toHaveBeenCalledTimes(1);
  });
  describe('fail', () => {
    it('no para', async () => {
      expect(signMessage(undefined)).rejects.toThrowError();
    });
    it('no args', async () => {
      expect(signMessage(paraClient, undefined)).rejects.toThrowError();
    });
  });
});
