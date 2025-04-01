import { describe, vi, afterEach, it, expect } from 'vitest';
import { MockPara } from '../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY, TEST_EMAIL, TEST_USER_ID, TEST_WALLET } from '../../constants';
import { getAccount } from '../../../src/provider/actions/getAccount';

describe('getAccount', () => {
  const paraClient = new MockPara(Environment.DEV, API_KEY);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('connected', async () => {
    const resp = await getAccount(paraClient);

    expect(resp).toStrictEqual({
      isConnected: true,
      email: TEST_EMAIL,
      wallets: [TEST_WALLET],
      phone: undefined,
      userId: TEST_USER_ID,
    });
  });
});
