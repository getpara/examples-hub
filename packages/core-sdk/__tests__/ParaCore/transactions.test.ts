import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockPara } from '../mocks/mockParaCore';
import { expectSearchParams, getWorkerContent, prepareMock } from '../utils';
import { Environment } from '../../src';
import { API_KEY, PARTNER, TIMEOUT_MS, TRANSACTION_ID, USER_EMAIL, USER_ID } from '../constants';
import { resetPlatformMocks } from '../mocks/mockPlatformUtils';
import { resetClientMocks } from '../mocks/mockUserManagementClient';

describe('ParaCore - transactions', () => {
  let para: MockPara;

  beforeAll(async () => {
    const workerFileContent = await getWorkerContent();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(workerFileContent),
      } as Response),
    );
  });

  beforeEach(async () => {
    resetClientMocks();
    resetPlatformMocks();
    para = new MockPara(Environment.DEV, API_KEY);
  });

  describe('signMessage', () => {
    ['DKLS', 'ED25519'].forEach(scheme => {
      describe(scheme, () => {
        ['embedded', 'pregen'].forEach(source => {
          it(source, async () => {
            const { solanaId, evmId, solanaPregenId, evmPregenId } = await prepareMock(para, {
              withoutAuth: source === 'pregen',
            });

            let walletId;
            switch (true) {
              case source === 'embedded' && scheme === 'DKLS':
                walletId = evmId;
                break;
              case source === 'embedded' && scheme === 'ED25519':
                walletId = solanaId;
                break;
              case source === 'pregen' && scheme === 'DKLS':
                walletId = evmPregenId;
                break;
              case source === 'pregen' && scheme === 'ED25519':
                walletId = solanaPregenId;
                break;
            }

            const res = await para.signMessage({
              walletId,
              messageBase64: 'message',
              cosmosSignDocBase64: 'cosmosSignDoc',
            });

            expect(res).toStrictEqual({ signature: 'signature' });

            switch (scheme) {
              case 'DKLS':
                expect((para as unknown as any).platformUtils.signMessage).toHaveBeenCalledWith(
                  para.ctx,
                  source === 'pregen' ? undefined : USER_ID,
                  walletId,
                  para.wallets[walletId].signer,
                  'message',
                  'session-cookie',
                  true,
                  'cosmosSignDoc',
                );
                break;
              case 'ED25519':
                expect((para as unknown as any).platformUtils.ed25519Sign).toHaveBeenCalledWith(
                  para.ctx,
                  source === 'pregen' ? undefined : USER_ID,
                  walletId,
                  para.wallets[walletId].signer,
                  'message',
                  'session-cookie',
                );
                break;
            }
          });
        });
      });
    });
  });

  describe('signTransaction', () => {
    ['embedded', 'pregen'].forEach(source => {
      it(source, async () => {
        const { evmId, evmPregenId } = await prepareMock(para, {
          withoutAuth: source === 'pregen',
        });

        let walletId;
        switch (true) {
          case source === 'embedded':
            walletId = evmId;
            break;
          case source === 'pregen':
            walletId = evmPregenId;
            break;
        }

        const res = await para.signTransaction({
          walletId,
          rlpEncodedTxBase64: 'rlpEncodedTxBase64',
          chainId: '1',
        });

        expect(res).toStrictEqual({ signature: 'signature' });

        expect((para as unknown as any).platformUtils.signTransaction).toHaveBeenCalledWith(
          para.ctx,
          source === 'pregen' ? undefined : USER_ID,
          walletId,
          para.wallets[walletId].signer,
          'rlpEncodedTxBase64',
          '1',
          'session-cookie',
          true,
        );
      });
    });
  });

  it('getTransactionReviewUrl', async () => {
    await prepareMock(para);

    const transactionReviewRes: string = await (para as unknown as any).getTransactionReviewUrl(TRANSACTION_ID, TIMEOUT_MS);

    const url = new URL(transactionReviewRes);
    expect(url.origin).toEqual(PARTNER.portalUrl);
    expect(url.pathname).toEqual(`/web/users/${USER_ID}/transaction-review/${TRANSACTION_ID}`);
    expectSearchParams(url, {
      apiKey: PARTNER.apiKey,
      email: USER_EMAIL,
      partnerId: PARTNER.id,
      portalAccentColor: PARTNER.accentColor,
      portalBackgroundColor: PARTNER.backgroundColor,
      portalFont: PARTNER.font,
      portalForegroundColor: PARTNER.foregroundColor,
      portalThemeMode: PARTNER.themeMode,
      timeoutMs: TIMEOUT_MS.toString(),
    });
  });
});
