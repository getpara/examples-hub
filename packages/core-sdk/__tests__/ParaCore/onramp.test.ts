import { Environment, getPortalBaseURL, Network, OnRampAsset, OnRampProvider, OnRampPurchaseType } from '../../src';
import { API_KEY, COMMON_SEARCH_PARAMS, CURRENT_WALLET_IDS, PURCHASE_ID, USER_ID, WALLET } from '../constants';
import { MockPara } from '../mocks/mockParaCore';
import { describe, expect, it, beforeAll, vi } from 'vitest';
import { expectSearchParams, getWorkerContent } from '../utils';
import { mockCreateOnRampPurchase } from '../mocks/mockUserManagementClient';

describe('on-ramp transactions', () => {
  describe('ParaCore > onramps', () => {
    let para: MockPara;

    beforeAll(async () => {
      para = new MockPara(Environment.DEV, API_KEY);

      const workerFileContent = await getWorkerContent();

      global.fetch = vi.fn(() =>
        Promise.resolve({
          text: () => Promise.resolve(workerFileContent),
        } as Response),
      );
    });

    it('getOnRampTransactionUrl', async () => {
      await para.setUserId(USER_ID);
      await para.setCurrentWalletIds(CURRENT_WALLET_IDS);
      const transactionReviewRes: string = await (para as unknown as any).getOnRampTransactionUrl({
        purchaseId: PURCHASE_ID,
        walletId: WALLET.id,
      });

      const url = new URL(transactionReviewRes);
      expect(url.origin).toEqual(getPortalBaseURL(para.ctx));
      expect(url.pathname).toEqual(`/web/users/${USER_ID}/on-ramp-transaction/v2/${PURCHASE_ID}`);
      expectSearchParams(url, {
        ...COMMON_SEARCH_PARAMS,
        apiKey: API_KEY,
        origin: 'http://localhost:3000',
      });
    });

    it('initiateOnRampTransaction', async () => {
      await para.setUserId(USER_ID);
      await para.setWallets({ [WALLET.id]: WALLET } as unknown as any);
      const params = {
        type: OnRampPurchaseType.BUY,
        walletId: WALLET.id,
        walletType: WALLET.type,
        provider: OnRampProvider.STRIPE,
        fiat: 'USD',
        fiatQuantity: '100',
        defaultNetwork: Network.ETHEREUM,
        defaultAsset: OnRampAsset.ETHEREUM,
        networks: [Network.ETHEREUM, Network.BASE],
        assets: [OnRampAsset.ETHEREUM, OnRampAsset.USDC],
      };

      const { onRampPurchase, portalUrl } = await para.initiateOnRampTransaction({
        walletId: WALLET.id,
        params,
      });

      expect(mockCreateOnRampPurchase).toHaveBeenCalledWith({
        userId: USER_ID,
        params: {
          ...params,
          address: WALLET.address,
        },
        walletId: WALLET.id,
      });

      expect(new URL(portalUrl).origin).toEqual(getPortalBaseURL(para.ctx));
      expect(new URL(portalUrl).pathname).toEqual(`/web/users/${USER_ID}/on-ramp-transaction/v2/${onRampPurchase.id}`);

      expect(onRampPurchase).toEqual({ id: 'id', userId: USER_ID, address: WALLET.address, ...params });
    });
  });
});
