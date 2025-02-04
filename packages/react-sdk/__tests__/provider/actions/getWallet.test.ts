import { describe, vi, afterEach, it, expect } from 'vitest';
import { MockPara } from '../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY, TEST_WALLET } from '../../constants';
import { getWallet } from '../../../src/provider/actions/getWallet';

describe('getAccount', () => {
  const paraClient = new MockPara(Environment.DEV, API_KEY);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('success', async () => {
    const resp = await getWallet(paraClient);

    expect(resp).toStrictEqual(TEST_WALLET);
  });
  it('no Para', async () => {
    const resp = await getWallet();

    expect(resp).toBeNull();
  });
});
