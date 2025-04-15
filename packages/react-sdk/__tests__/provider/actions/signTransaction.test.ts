import { describe, vi, afterEach, it, expect } from 'vitest';
import { MockPara, mockSignTransaction } from '../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../constants';
import { signTransaction } from '../../../src/provider/actions/signTransaction';

describe('signTransaction', () => {
  const paraClient = new MockPara(Environment.DEV, API_KEY);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('success', async () => {
    await signTransaction(paraClient, {
      walletId: '',
      rlpEncodedTxBase64: '',
      chainId: '',
    });

    expect(mockSignTransaction).toHaveBeenCalledTimes(1);
  });
  describe('fail', () => {
    it('no para', async () => {
      await expect(signTransaction(undefined)).rejects.toThrowError();
    });
    it('no args', async () => {
      await expect(signTransaction(paraClient, undefined)).rejects.toThrowError();
    });
  });
});
