import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockPara } from '../mocks/mockParaCore';
import { getWallet, getWorkerContent, prepareMock } from '../utils';
import { faker } from '@faker-js/faker';
import { PREGEN_IDENTIFIER_TYPES, PregenAuth, WALLET_TYPES, TWalletType } from '@getpara/user-management-client';
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
import {
  mockGetPregenWallets,
  mockGetWallets,
  mockUpdatePregenWallet,
  mockClaimPregenWallets,
  mockGetWalletBalance,
} from '../mocks/mockUserManagementClient';
import { Environment, ParaEvent } from '../../src';
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
    WALLET_TYPES.forEach(type => {
      it(type, async () => {
        await prepareMock(para);

        const [newId, newSigner] = [faker.string.uuid(), faker.string.alphanumeric(32)];
        const newWallet = getWallet({ id: newId, type });

        switch (type) {
          case 'SOLANA':
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

    const [[dklsId, dklsSigner, dklsWallet], [ed25519Id, ed25519Signer, ed25519Wallet]] = ['DKLS', 'ED25519'].map(scheme => {
      const [newId, newSigner] = [faker.string.uuid(), faker.string.alphanumeric(32)];
      const newWallet = getWallet({
        id: newId,
        type:
          scheme === 'DKLS'
            ? PARTNER.supportedWalletTypes.some(({ type }) => type === 'COSMOS')
              ? 'COSMOS'
              : 'EVM'
            : 'SOLANA',
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
      types: PARTNER.supportedWalletTypes.map(({ type }) => type as TWalletType),
    });

    expect(para.currentWalletIds['EVM']).toStrictEqual([evmId]);
    expect(para.currentWalletIds['COSMOS']).toStrictEqual([evmId, dklsId]);
    expect(para.currentWalletIds['SOLANA']).toStrictEqual([solanaId, ed25519Id]);

    expect(para.wallets[dklsId]).toStrictEqual({ ...dklsWallet, signer: dklsSigner });
    expect(para.wallets[ed25519Id]).toStrictEqual({ ...ed25519Wallet, signer: ed25519Signer });
  });

  describe('createPregenWallet', async () => {
    WALLET_TYPES.forEach(type => {
      describe(type, () => {
        PREGEN_IDENTIFIER_TYPES.filter(type => type !== 'GUEST_ID').forEach(pregenIdentifierType => {
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
              case 'SOLANA':
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
    PREGEN_IDENTIFIER_TYPES.filter(type => type !== 'GUEST_ID').forEach(pregenIdentifierType => {
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

        const [[dklsId, dklsSigner, dklsWallet], [ed25519Id, ed25519Signer, ed25519Wallet]] = ['DKLS', 'ED25519'].map(
          scheme => {
            const [newId, newSigner] = [faker.string.uuid(), faker.string.alphanumeric(32)];
            const newWallet = getWallet({
              id: newId,
              auth: pregenId,
              type:
                scheme === 'DKLS'
                  ? PARTNER.supportedWalletTypes.some(({ type }) => type === 'COSMOS')
                    ? 'COSMOS'
                    : 'EVM'
                  : 'SOLANA',
            });

            return [newId, newSigner, newWallet];
          },
        );

        mockEd25519PreKeygen.mockResolvedValue({ walletId: ed25519Id, signer: ed25519Signer });
        mockPreKeygen.mockResolvedValue({ walletId: dklsId, signer: dklsSigner });

        mockGetPregenWallets.mockResolvedValue({
          wallets: [dklsWallet, ed25519Wallet],
        });

        await para.createPregenWalletPerType({
          pregenId,
          types: PARTNER.supportedWalletTypes.map(({ type }) => type as TWalletType),
        });

        expect(para.wallets[dklsId]).toStrictEqual({ ...dklsWallet, signer: dklsSigner });
        expect(para.wallets[ed25519Id]).toStrictEqual({ ...ed25519Wallet, signer: ed25519Signer });
      });
    });
  });

  describe('updatePregenWalletIdentifier', () => {
    PREGEN_IDENTIFIER_TYPES.filter(type => type !== 'GUEST_ID').forEach(async pregenIdentifierType => {
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

  describe('claimPregenWallets', () => {
    it('returns undefined when no pregen wallets exist', async () => {
      await prepareMock(para);

      mockGetPregenWallets.mockResolvedValue({ wallets: [] });

      const result = await para.claimPregenWallets();

      expect(result).toBeUndefined();
      expect(mockClaimPregenWallets).not.toHaveBeenCalled();
    });

    it('throws error when wallet data is missing', async () => {
      await prepareMock(para);

      const missingWalletId = faker.string.uuid();
      const missingWallet = getWallet({ id: missingWalletId, type: 'EVM', auth: { email: USER_EMAIL } });

      mockGetPregenWallets.mockResolvedValue({ wallets: [missingWallet] });

      await expect(para.claimPregenWallets()).rejects.toThrow(
        `Cannot claim pregen wallets because wallet data is missing. Please call setUserShare first to load the wallet data for the following wallet IDs: ${missingWalletId}`,
      );
    });

    it('successfully claims DKLS pregen wallets without pregenId', async () => {
      const { evmPregenId } = await prepareMock(para, { withoutAuth: true });
      const pregenWallet = para.wallets[evmPregenId];

      // Set auth to match the pregen wallet
      await para.setEmail(USER_EMAIL);
      // Ensure userId is set
      await para.setUserId(USER_ID);

      mockGetPregenWallets.mockResolvedValue({ wallets: [pregenWallet] });
      mockClaimPregenWallets.mockResolvedValue({ walletIds: [evmPregenId] });

      const mockRefreshShare = vi.spyOn(para, 'refreshShare');
      mockRefreshShare.mockResolvedValue({
        signer: 'new-signer',
        recoverySecret: 'recovery-secret',
        protocolId: 'protocol-id',
      });

      // Mock window.dispatchEvent
      const mockDispatchEvent = vi.fn();
      Object.defineProperty(globalThis.window, 'dispatchEvent', {
        value: mockDispatchEvent,
        configurable: true,
      });

      const result = await para.claimPregenWallets();

      expect(mockClaimPregenWallets).toHaveBeenCalledWith({
        userId: USER_ID,
        walletIds: [evmPregenId],
      });

      expect(mockRefreshShare).toHaveBeenCalledWith({
        walletId: evmPregenId,
        share: pregenWallet.signer,
        oldPartnerId: pregenWallet.partnerId,
        newPartnerId: pregenWallet.partnerId,
        redistributeBackupEncryptedShares: true,
      });

      expect(para.wallets[evmPregenId].userId).toBe(USER_ID);
      expect(para.wallets[evmPregenId].pregenIdentifier).toBeUndefined();
      expect(para.wallets[evmPregenId].pregenIdentifierType).toBeUndefined();
      expect(para.wallets[evmPregenId].signer).toBe('new-signer');

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ParaEvent.PREGEN_WALLET_CLAIMED,
          detail: expect.objectContaining({
            data: expect.objectContaining({
              wallet: expect.objectContaining({
                id: evmPregenId,
                userId: USER_ID,
              }),
              recoverySecret: 'recovery-secret',
            }),
          }),
        }),
      );

      expect(result).toBe('recovery-secret');

      mockRefreshShare.mockRestore();
    });

    it('successfully claims ED25519 pregen wallets with pregenId', async () => {
      const { solanaPregenId } = await prepareMock(para, { withoutAuth: true });
      const pregenWallet = para.wallets[solanaPregenId];

      // Set auth to match the pregen wallet
      await para.setEmail(USER_EMAIL);
      // Ensure userId is set
      await para.setUserId(USER_ID);

      mockGetPregenWallets.mockResolvedValue({ wallets: [pregenWallet] });
      mockClaimPregenWallets.mockResolvedValue({ walletIds: [solanaPregenId] });

      vi.mocked(shareDistribution.distributeNewShare).mockResolvedValueOnce('recovery-share-ed25519');

      // Mock window.dispatchEvent
      const mockDispatchEvent = vi.fn();
      Object.defineProperty(globalThis.window, 'dispatchEvent', {
        value: mockDispatchEvent,
        configurable: true,
      });

      const result = await para.claimPregenWallets({ pregenId: { email: USER_EMAIL } });

      expect(mockClaimPregenWallets).toHaveBeenCalledWith({
        userId: USER_ID,
        walletIds: [solanaPregenId],
      });

      expect(shareDistribution.distributeNewShare).toHaveBeenCalledWith({
        ctx: para.ctx,
        userId: USER_ID,
        walletId: solanaPregenId,
        userShare: pregenWallet.signer,
        emailProps: (para as unknown as any).getBackupKitEmailProps(),
        partnerId: pregenWallet.partnerId,
      });

      expect(para.wallets[solanaPregenId].userId).toBe(USER_ID);
      expect(para.wallets[solanaPregenId].pregenIdentifier).toBeUndefined();
      expect(para.wallets[solanaPregenId].pregenIdentifierType).toBeUndefined();
      expect(para.wallets[solanaPregenId].signer).toBe(pregenWallet.signer);

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ParaEvent.PREGEN_WALLET_CLAIMED,
          detail: expect.objectContaining({
            data: expect.objectContaining({
              wallet: expect.objectContaining({
                id: solanaPregenId,
                userId: USER_ID,
              }),
              recoverySecret: 'recovery-share-ed25519',
            }),
          }),
        }),
      );

      expect(result).toBe('recovery-share-ed25519');
    });

    it('successfully claims multiple pregen wallets', async () => {
      const { evmPregenId, solanaPregenId } = await prepareMock(para, { withoutAuth: true });
      const evmPregenWallet = para.wallets[evmPregenId];
      const solanaPregenWallet = para.wallets[solanaPregenId];

      // Set auth to match the pregen wallets
      await para.setEmail(USER_EMAIL);
      // Ensure userId is set
      await para.setUserId(USER_ID);

      mockGetPregenWallets.mockResolvedValue({
        wallets: [evmPregenWallet, solanaPregenWallet],
      });
      mockClaimPregenWallets.mockResolvedValue({
        walletIds: [evmPregenId, solanaPregenId],
      });

      const mockRefreshShare = vi.spyOn(para, 'refreshShare');
      mockRefreshShare.mockResolvedValue({
        signer: 'new-evm-signer',
        recoverySecret: 'evm-recovery-secret',
        protocolId: 'protocol-id',
      });

      vi.mocked(shareDistribution.distributeNewShare).mockResolvedValueOnce('solana-recovery-share');

      // Mock window.dispatchEvent
      const mockDispatchEvent = vi.fn();
      Object.defineProperty(globalThis.window, 'dispatchEvent', {
        value: mockDispatchEvent,
        configurable: true,
      });

      const result = await para.claimPregenWallets();

      expect(mockClaimPregenWallets).toHaveBeenCalledWith({
        userId: USER_ID,
        walletIds: [evmPregenId, solanaPregenId],
      });

      // Verify both wallets were processed
      expect(para.wallets[evmPregenId].userId).toBe(USER_ID);
      expect(para.wallets[solanaPregenId].userId).toBe(USER_ID);

      expect(para.wallets[evmPregenId].pregenIdentifier).toBeUndefined();
      expect(para.wallets[solanaPregenId].pregenIdentifier).toBeUndefined();

      expect(para.wallets[evmPregenId].pregenIdentifierType).toBeUndefined();
      expect(para.wallets[solanaPregenId].pregenIdentifierType).toBeUndefined();

      // Should dispatch events for both wallets
      expect(mockDispatchEvent).toHaveBeenCalledTimes(2);

      // Last recovery secret should be returned (from solana wallet processing)
      expect(result).toBe('solana-recovery-share');

      mockRefreshShare.mockRestore();
    });

    it('handles DKLS wallet without recovery secret', async () => {
      const { evmPregenId } = await prepareMock(para, { withoutAuth: true });
      const pregenWallet = para.wallets[evmPregenId];

      await para.setEmail(USER_EMAIL);
      // Ensure userId is set
      await para.setUserId(USER_ID);

      mockGetPregenWallets.mockResolvedValue({ wallets: [pregenWallet] });
      mockClaimPregenWallets.mockResolvedValue({ walletIds: [evmPregenId] });

      const mockRefreshShare = vi.spyOn(para, 'refreshShare');
      mockRefreshShare.mockResolvedValue({
        signer: 'new-signer',
        recoverySecret: undefined, // No recovery secret
        protocolId: 'protocol-id',
      });

      const result = await para.claimPregenWallets();

      expect(result).toBeUndefined();

      mockRefreshShare.mockRestore();
    });

    it('handles ED25519 wallet with empty recovery secret', async () => {
      const { solanaPregenId } = await prepareMock(para, { withoutAuth: true });
      const pregenWallet = para.wallets[solanaPregenId];

      await para.setEmail(USER_EMAIL);
      // Ensure userId is set
      await para.setUserId(USER_ID);

      mockGetPregenWallets.mockResolvedValue({ wallets: [pregenWallet] });
      mockClaimPregenWallets.mockResolvedValue({ walletIds: [solanaPregenId] });

      vi.mocked(shareDistribution.distributeNewShare).mockResolvedValueOnce(''); // Empty string

      const result = await para.claimPregenWallets({ pregenId: { email: USER_EMAIL } });

      expect(result).toBeUndefined();
    });

    it('requires API key', async () => {
      // Create a para instance with valid API key first, then remove it to test requireApiKey method
      const paraForApiKeyTest = new MockPara(Environment.DEV, API_KEY);
      // Remove the API key to test the requireApiKey validation
      paraForApiKeyTest.ctx.apiKey = '';

      await expect(paraForApiKeyTest.claimPregenWallets()).rejects.toThrow(
        `in order to create a wallet or user with Para, you
        must provide an API key to the Para instance`,
      );
    });

    it('calls setWallets to persist changes', async () => {
      const { evmPregenId } = await prepareMock(para, { withoutAuth: true });
      const pregenWallet = para.wallets[evmPregenId];

      await para.setEmail(USER_EMAIL);
      // Ensure userId is set
      await para.setUserId(USER_ID);

      mockGetPregenWallets.mockResolvedValue({ wallets: [pregenWallet] });
      mockClaimPregenWallets.mockResolvedValue({ walletIds: [evmPregenId] });

      const mockRefreshShare = vi.spyOn(para, 'refreshShare');
      mockRefreshShare.mockResolvedValue({
        signer: 'new-signer',
        recoverySecret: 'recovery-secret',
        protocolId: 'protocol-id',
      });

      const mockSetWallets = vi.spyOn(para, 'setWallets');

      await para.claimPregenWallets();

      expect(mockSetWallets).toHaveBeenCalledWith(para.wallets);

      mockRefreshShare.mockRestore();
      mockSetWallets.mockRestore();
    });
  });

  it('helpers', async () => {
    const { evmId, solanaId } = await prepareMock(para);

    expect(para.currentWalletIds).toEqual({
      EVM: [evmId],
      SOLANA: [solanaId],
      COSMOS: [evmId],
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
        type: 'COSMOS',
        address: para.getDisplayAddress(evmId, { addressType: 'COSMOS' }),
      },
      _.pick(para.wallets[solanaId], ['id', 'type', 'name', 'address', 'isExternal']),
    ]);

    expect(para.getWallets()).toBe(para.wallets);

    expect(para.getAddress(evmId)).toBe(para.wallets[evmId].address);
  });

  it('getWalletBalance', async () => {
    const { evmId } = await prepareMock(para);

    await para.getWalletBalance({
      walletId: evmId,
      rpcUrl: 'https://example.com/rpc',
    });

    expect(mockGetWalletBalance).toHaveBeenCalledWith({
      walletId: evmId,
      rpcUrl: 'https://example.com/rpc',
    });
  });
});
