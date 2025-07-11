import { describe, vi, afterEach, it, expect } from 'vitest';
import { MockPara } from '../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import {
  API_KEY,
  TEST_EMAIL,
  TEST_EXTERNAL_WALLET_ADDRESS,
  TEST_FARCASTER_USERNAME,
  TEST_PHONE,
  TEST_TELEGRAM_USER_ID,
  TEST_USER_ID,
  TEST_WALLET,
} from '../../constants';
import { getEmbeddedAccount } from '../../../src/provider/actions/getEmbeddedAccount';
import { extractAuthInfo } from '@getpara/user-management-client';

describe('getEmbeddedAccount', () => {
  const paraClient = new MockPara(Environment.DEV, API_KEY);

  afterEach(() => {
    vi.clearAllMocks();
  });

  [
    { email: TEST_EMAIL },
    { phone: TEST_PHONE },
    { farcasterUsername: TEST_FARCASTER_USERNAME },
    { telegramUserId: TEST_TELEGRAM_USER_ID },
    { externalWalletAddress: TEST_EXTERNAL_WALLET_ADDRESS },
  ].forEach(auth => {
    const authInfo = extractAuthInfo(auth, { isRequired: true });

    it(`${authInfo.authType}: connected`, async () => {
      vi.spyOn(MockPara.prototype, 'authInfo', 'get').mockReturnValueOnce(authInfo);

      const resp = await getEmbeddedAccount(paraClient, true);

      expect(resp).toStrictEqual({
        isConnected: true,
        auth,
        authType: authInfo.authType,
        identifier: authInfo.identifier,
        isGuestMode: false,
        ...auth,
        wallets: [TEST_WALLET],
        userId: TEST_USER_ID,
      });
    });
  });
});
