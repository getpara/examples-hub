import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockPara } from '../mocks/mockParaCore';
import { getWallet, getWorkerContent, prepareMock } from '../utils';
import { faker } from '@faker-js/faker';
import { PREGEN_IDENTIFIER_TYPES, PregenAuth, WalletScheme, WalletType } from '@getpara/user-management-client';
import {
  API_KEY,
  PARTNER,
  USER_CUSTOM_ID,
  USER_DISCORD_USERNAME,
  USER_EMAIL,
  USER_FARCASTER_USERNAME,
  USER_ID,
  USER_PHONE,
  USER_TELEGRAM_USER_ID,
  USER_X_USERNAME,
} from '../constants';
import { mockEd25519Keygen, mockEd25519PreKeygen, mockKeygen, mockPreKeygen } from '../mocks/mockPlatformUtils';
import { mockGetPregenWallets, mockGetWallets, mockUpdatePregenWallet } from '../mocks/mockUserManagementClient';
import { Environment } from '../../src';
import * as shareDistribution from '../../src/shares/shareDistribution.js';
import _ from 'lodash';

const emailAuth = { email: USER_EMAIL };
const phoneAuth = { phone: USER_PHONE };
const farcasterAuth = { farcasterUsername: USER_FARCASTER_USERNAME };
const telegramAuth = { telegramUserId: USER_TELEGRAM_USER_ID };
const customIdAuth = { customId: USER_CUSTOM_ID };
const xAuth = { xUsername: USER_X_USERNAME };
const discordAuth = { discordUsername: USER_DISCORD_USERNAME };

vi.mock('../../src/shares/shareDistribution', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    distributeNewShare: vi.fn().mockImplementation((actual as any).distributeNewShare),
  };
});

describe('wallets', () => {
  let para: MockPara;

  beforeAll(async () => {
    const workerFileContent = await getWorkerContent();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(workerFileContent),
      } as Response),
    );
  });

  beforeEach(() => {
    para = new MockPara(Environment.DEV, API_KEY);
  });

  describe('createWallet succeeds', () => {
    Object.values(WalletType).forEach(type => {
      it(type, async () => {
        await prepareMock(para);

        const [newId, newSigner] = [faker.string.uuid(), faker.string.alphanumeric(32)];
        const newWallet = getWallet({ id: newId, type });

        switch (type) {
          case WalletType.SOLANA:
            mockEd25519Keygen.mockResolvedValue({ walletId: newId, signer: newSigner });
            break;
          default:
            mockKeygen.mockResolvedValue({ walletId: newId, signer: newSigner });
            break;
        }

        mockGetWallets.mockResolvedValue({
          data: {
            wallets: [...Object.values(para.wallets), newWallet],
          },
        });

        await para.createWallet({
          type,
        });

        expect(para.currentWalletIds[type]).toBeDefined();
        expect(para.currentWalletIds[type]).toContain(newId);
        expect(para.wallets[newId]).toStrictEqual({ ...newWallet, signer: newSigner });
      });
    });
  });

  it('createWalletPerType succeeds', async () => {
    const { evmId, solanaId, partnerId } = await prepareMock(para);

    const [[dklsId, dklsSigner, dklsWallet], [ed25519Id, ed25519Signer, ed25519Wallet]] = [
      WalletScheme.DKLS,
      WalletScheme.ED25519,
    ].map(scheme => {
      const [newId, newSigner] = [faker.string.uuid(), faker.string.alphanumeric(32)];
      const newWallet = getWallet({
        id: newId,
        type:
          scheme === WalletScheme.DKLS
            ? PARTNER.supportedWalletTypes.some(({ type }) => type === WalletType.COSMOS)
              ? WalletType.COSMOS
              : WalletType.EVM
            : WalletType.SOLANA,
        partnerId,
      });

      return [newId, newSigner, newWallet];
    });

    mockEd25519Keygen.mockResolvedValue({ walletId: ed25519Id, signer: ed25519Signer });
    mockKeygen.mockResolvedValue({ walletId: dklsId, signer: dklsSigner });

    mockGetWallets.mockResolvedValue({
      data: {
        wallets: [...Object.values(para.wallets), dklsWallet, ed25519Wallet],
      },
    });

    await para.createWalletPerType({
      types: PARTNER.supportedWalletTypes.map(({ type }) => type),
    });

    expect(para.currentWalletIds[WalletType.EVM]).toStrictEqual([evmId]);
    expect(para.currentWalletIds[WalletType.COSMOS]).toStrictEqual([evmId, dklsId]);
    expect(para.currentWalletIds[WalletType.SOLANA]).toStrictEqual([solanaId, ed25519Id]);

    expect(para.wallets[dklsId]).toStrictEqual({ ...dklsWallet, signer: dklsSigner });
    expect(para.wallets[ed25519Id]).toStrictEqual({ ...ed25519Wallet, signer: ed25519Signer });
  });

  describe('createPregenWallet', async () => {
    Object.values(WalletType).forEach(type => {
      describe(type, () => {
        PREGEN_IDENTIFIER_TYPES.forEach(pregenIdentifierType => {
          it(`creates wallet for ${pregenIdentifierType}`, async () => {
            const pregenId = {
              EMAIL: emailAuth,
              PHONE: phoneAuth,
              FARCASTER: farcasterAuth,
              TELEGRAM: telegramAuth,
              CUSTOM_ID: customIdAuth,
              DISCORD: discordAuth,
              TWITTER: xAuth,
            }[pregenIdentifierType];

            const [newId, newSigner] = [faker.string.uuid(), faker.string.alphanumeric(32)];
            const newWallet = getWallet({ id: newId, type, auth: pregenId });

            switch (type) {
              case WalletType.SOLANA:
                mockEd25519PreKeygen.mockResolvedValue({ walletId: newId, signer: newSigner });
                break;
              default:
                mockPreKeygen.mockResolvedValue({ walletId: newId, signer: newSigner });
                break;
            }

            mockGetPregenWallets.mockResolvedValue({
              wallets: [newWallet],
            });

            await para.createPregenWallet({
              pregenId,
              type,
            });

            expect(para.wallets[newId]).toStrictEqual({ ...newWallet, signer: newSigner });
          });
        });
      });
    });
  });

  describe('createPregenWalletPerType', async () => {
    PREGEN_IDENTIFIER_TYPES.forEach(pregenIdentifierType => {
      it(`creates wallets for ${pregenIdentifierType}`, async () => {
        const pregenId = {
          EMAIL: emailAuth,
          PHONE: phoneAuth,
          FARCASTER: farcasterAuth,
          TELEGRAM: telegramAuth,
          CUSTOM_ID: customIdAuth,
          DISCORD: discordAuth,
          TWITTER: xAuth,
        }[pregenIdentifierType];

        const [[dklsId, dklsSigner, dklsWallet], [ed25519Id, ed25519Signer, ed25519Wallet]] = [
          WalletScheme.DKLS,
          WalletScheme.ED25519,
        ].map(scheme => {
          const [newId, newSigner] = [faker.string.uuid(), faker.string.alphanumeric(32)];
          const newWallet = getWallet({
            id: newId,
            auth: pregenId,
            type:
              scheme === WalletScheme.DKLS
                ? PARTNER.supportedWalletTypes.some(({ type }) => type === WalletType.COSMOS)
                  ? WalletType.COSMOS
                  : WalletType.EVM
                : WalletType.SOLANA,
          });

          return [newId, newSigner, newWallet];
        });

        mockEd25519PreKeygen.mockResolvedValue({ walletId: ed25519Id, signer: ed25519Signer });
        mockPreKeygen.mockResolvedValue({ walletId: dklsId, signer: dklsSigner });

        mockGetPregenWallets.mockResolvedValue({
          wallets: [dklsWallet, ed25519Wallet],
        });

        await para.createPregenWalletPerType({
          pregenId,
          types: PARTNER.supportedWalletTypes.map(({ type }) => type),
        });

        expect(para.wallets[dklsId]).toStrictEqual({ ...dklsWallet, signer: dklsSigner });
        expect(para.wallets[ed25519Id]).toStrictEqual({ ...ed25519Wallet, signer: ed25519Signer });
      });
    });
  });

  describe('updatePregenWalletIdentifier', () => {
    PREGEN_IDENTIFIER_TYPES.forEach(async pregenIdentifierType => {
      const [newPregenId, pregenIdentifier] = {
        EMAIL: [emailAuth, USER_EMAIL],
        PHONE: [phoneAuth, USER_PHONE],
        FARCASTER: [farcasterAuth, USER_FARCASTER_USERNAME],
        TELEGRAM: [telegramAuth, USER_TELEGRAM_USER_ID],
        CUSTOM_ID: [customIdAuth, USER_CUSTOM_ID],
        DISCORD: [discordAuth, USER_DISCORD_USERNAME],
        TWITTER: [xAuth, USER_X_USERNAME],
      }[pregenIdentifierType] as [PregenAuth, string];

      it(`updates for ${pregenIdentifierType}`, async () => {
        const { evmPregenId } = await prepareMock(para, { withoutAuth: true });

        await para.updatePregenWalletIdentifier({
          walletId: evmPregenId,
          newPregenId,
        });

        expect(mockUpdatePregenWallet).toHaveBeenCalledWith(evmPregenId, { pregenIdentifier, pregenIdentifierType });

        expect(para.wallets[evmPregenId].pregenIdentifier).toEqual(pregenIdentifier);
        expect(para.wallets[evmPregenId].pregenIdentifierType).toEqual(pregenIdentifierType);
      });
    });

    it('refreshShare succeeds', async () => {
      const { evmId } = await prepareMock(para);

      vi.mocked(shareDistribution.distributeNewShare).mockResolvedValueOnce('recoveryShare');

      const { signer, protocolId, recoverySecret } = await para.refreshShare({
        walletId: evmId,
        share: 'share',
        oldPartnerId: 'oldPartnerId',
        newPartnerId: 'newPartnerId',
        keyShareProtocolId: 'protocolId',
        redistributeBackupEncryptedShares: true,
        emailProps: { homepageUrl: 'homepageUrl' },
      });

      expect((para as unknown as any).platformUtils.refresh).toHaveBeenCalledWith(
        para.ctx,
        'session-cookie',
        USER_ID,
        evmId,
        'share',
        'oldPartnerId',
        'newPartnerId',
        'protocolId',
      );

      expect(shareDistribution.distributeNewShare).toHaveBeenCalledWith({
        ctx: para.ctx,
        userId: USER_ID,
        walletId: evmId,
        userShare: signer,
        emailProps: (para as unknown as any).getBackupKitEmailProps(),
        ignoreRedistributingBackupEncryptedShare: false,
        partnerId: 'newPartnerId',
        protocolId,
      });
      expect(signer).toEqual('test-refresh-signer');
      expect(protocolId).toEqual('protocolId');
      expect(recoverySecret).toEqual('recoveryShare');
    });
  });

  it('hasPregenWallet succeeds', async () => {
    const { evmPregenId, evmPregenUnclaimedId } = await prepareMock(para, { withoutAuth: true });

    mockGetPregenWallets.mockResolvedValue({ wallets: [para.wallets[evmPregenId], para.wallets[evmPregenUnclaimedId]] });

    expect(await para.hasPregenWallet({ pregenId: { email: USER_EMAIL } })).toBe(true);
    expect(
      await para.hasPregenWallet({ pregenId: { customId: para.wallets[evmPregenUnclaimedId].pregenIdentifier! } }),
    ).toBe(true);
    expect(await para.hasPregenWallet({ pregenId: { phone: USER_PHONE } })).toBe(false);
    expect(await para.hasPregenWallet({ pregenId: { farcasterUsername: USER_FARCASTER_USERNAME } })).toBe(false);
  });

  it('helpers', async () => {
    const { evmId, solanaId } = await prepareMock(para);

    expect(para.currentWalletIds).toEqual({
      [WalletType.EVM]: [evmId],
      [WalletType.SOLANA]: [solanaId],
      [WalletType.COSMOS]: [evmId],
    });

    expect(para.currentWalletIdsArray).toEqual([
      [evmId, 'EVM'],
      [evmId, 'COSMOS'],
      [solanaId, 'SOLANA'],
    ]);

    expect(para.availableWallets).toEqual([
      _.pick(para.wallets[evmId], ['id', 'type', 'name', 'address', 'isExternal']),
      {
        ..._.pick(para.wallets[evmId], ['id', 'name', 'isExternal']),
        type: WalletType.COSMOS,
        address: para.getDisplayAddress(evmId, { addressType: 'COSMOS' }),
      },
      _.pick(para.wallets[solanaId], ['id', 'type', 'name', 'address', 'isExternal']),
    ]);

    expect(para.getWallets()).toBe(para.wallets);

    expect(para.getAddress(evmId)).toBe(para.wallets[evmId].address);
  });
});
