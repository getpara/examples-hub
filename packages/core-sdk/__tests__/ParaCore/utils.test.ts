import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockPara } from '../mocks/mockParaCore';
import { getWorkerContent, prepareMock } from '../utils';
import { API_KEY, USER_EMAIL, USER_ID } from '../constants';
import { Environment, Wallet } from '../../src';
import { faker } from '@faker-js/faker';
import { mockSendLoginVerificationCode } from '../mocks/mockUserManagementClient';

describe('ParaCore - utils', () => {
  let para: MockPara;

  beforeAll(async () => {
    const workerFileContent = await getWorkerContent();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(workerFileContent),
      } as Response),
    );
  });

  describe('findWalletId', () => {
    beforeEach(async () => {
      para = new MockPara(Environment.DEV, API_KEY);
    });

    describe('no identifier', () => {
      it('no wallets', async () => {
        await prepareMock(para, { withoutAuth: true, excludeAll: true });

        expect(() => para.findWalletId()).toThrow();
      });

      it('embedded wallets present', async () => {
        const { evmId, solanaId } = await prepareMock(para, {
          excludePregen: true,
          excludeUnclaimed: true,
          excludeUnclaimable: true,
        });

        expect(para.findWalletId()).toStrictEqual(evmId);

        expect(para.findWalletId(undefined, { type: ['EVM'] })).toStrictEqual(evmId);

        expect(para.findWalletId(undefined, { type: ['SOLANA'] })).toStrictEqual(solanaId);
      });

      describe('pregen wallets present', () => {
        it('claimable', async () => {
          const { evmPregenId } = await prepareMock(para, { withoutAuth: true });

          expect(para.findWalletId()).toStrictEqual(evmPregenId);
        });

        it('unclaimed', async () => {
          const { evmPregenUnclaimedId, solanaPregenUnclaimedId } = await prepareMock(para, {
            withoutAuth: true,
            excludePregen: true,
          });

          expect(para.findWalletId()).toStrictEqual(evmPregenUnclaimedId);

          expect(para.findWalletId(undefined, { type: ['EVM'] })).toStrictEqual(evmPregenUnclaimedId);

          expect(para.findWalletId(undefined, { type: ['SOLANA'] })).toStrictEqual(solanaPregenUnclaimedId);

          expect(() => para.findWalletId(undefined, { forbidPregen: true })).toThrow();
        });
      });
    });

    it('with walletId', async () => {
      const { evmId, solanaId, evmPregenId, solanaPregenId, evmPregenUnclaimedId, solanaPregenUnclaimedId } =
        await prepareMock(para);

      expect(para.findWalletId(evmId)).toStrictEqual(evmId);

      expect(() => para.findWalletId(evmId, { type: ['SOLANA'] })).toThrow();

      expect(para.findWalletId(solanaId)).toStrictEqual(solanaId);

      expect(() => para.findWalletId(solanaId, { type: ['EVM'] })).toThrow();

      expect(para.findWalletId(evmPregenId)).toStrictEqual(evmPregenId);

      expect(() => para.findWalletId(evmPregenId, { type: ['SOLANA'] })).toThrow();

      expect(() => para.findWalletId(evmPregenId, { forbidPregen: true })).toThrow();

      expect(para.findWalletId(solanaPregenId)).toStrictEqual(solanaPregenId);

      expect(() => para.findWalletId(solanaPregenId, { type: ['EVM'] })).toThrow();

      expect(() => para.findWalletId(solanaPregenId, { forbidPregen: true })).toThrow();

      expect(para.findWalletId(evmPregenUnclaimedId)).toStrictEqual(evmPregenUnclaimedId);

      expect(() => para.findWalletId(evmPregenUnclaimedId, { type: ['SOLANA'] })).toThrow();

      expect(() => para.findWalletId(evmPregenUnclaimedId, { forbidPregen: true })).toThrow();

      expect(para.findWalletId(solanaPregenUnclaimedId)).toStrictEqual(solanaPregenUnclaimedId);

      expect(() => para.findWalletId(solanaPregenUnclaimedId, { type: ['EVM'] })).toThrow();

      expect(() => para.findWalletId(solanaPregenUnclaimedId, { forbidPregen: true })).toThrow();

      expect(() => para.findWalletId(faker.string.uuid())).toThrow();
    });
  });

  it('findWalletByAddress', async () => {
    para = new MockPara(Environment.DEV, API_KEY);
    const { solanaId, solanaAddress } = await prepareMock(para);

    const wallet = para.findWalletByAddress(solanaAddress);
    expect(wallet).toBeDefined();
    expect(wallet.id).toEqual(solanaId);

    expect(() => para.findWalletByAddress('notAnAddress')).toThrowError();
    expect(() => para.findWalletByAddress(solanaAddress, { type: ['EVM'] })).toThrowError(
      `wallet with id ${solanaId} and type SOLANA cannot be selected`,
    );
  });

  it('getWalletsByType', async () => {
    const { evmId, solanaId, evmPregenId, solanaPregenId, evmPregenUnclaimedId, solanaPregenUnclaimedId } =
      await prepareMock(para, { excludeUnclaimable: true });

    expect(para.getWalletsByType('EVM')).toMatchObject([
      para.wallets[evmId],
      para.wallets[evmPregenId],
      para.wallets[evmPregenUnclaimedId],
    ]);
    expect(para.getWalletsByType('SOLANA')).toMatchObject([
      para.wallets[solanaId],
      para.wallets[solanaPregenId],
      para.wallets[solanaPregenUnclaimedId],
    ]);
  });

  it('findWalletByAddress', async () => {
    para = new MockPara(Environment.DEV, API_KEY);
    const { solanaId, solanaAddress } = await prepareMock(para);

    const wallet = para.findWalletByAddress(solanaAddress);
    expect(wallet).toBeDefined();
    expect(wallet.id).toEqual(solanaId);

    expect(() => para.findWalletByAddress('notAnAddress')).toThrowError();
    expect(() => para.findWalletByAddress(solanaAddress, { type: ['EVM'] })).toThrowError(
      `wallet with id ${solanaId} and type SOLANA cannot be selected`,
    );
  });

  describe('getDisplayAddress', () => {
    beforeEach(async () => {
      para = new MockPara(Environment.DEV, API_KEY);
    });

    it('no wallet found', async () => {
      await prepareMock(para);

      expect(para.getDisplayAddress(faker.string.uuid())).toBeUndefined();
    });

    it('EVM & Cosmos', async () => {
      const { evmId, evmAddress } = await prepareMock(para);

      expect(para.getDisplayAddress(evmId)).toBe(evmAddress);

      expect(para.getDisplayAddress(evmId, { truncate: true })).toBe(`${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`);

      expect(para.getDisplayAddress(evmId, { addressType: 'COSMOS' })).toBe('cosmos1csm8arcsdt0grajz4dcs8r2fc04ujt02xlpxwp');

      expect(para.getDisplayAddress(evmId, { addressType: 'COSMOS', truncate: true })).toBe('cosmos1csm...pxwp');
    });

    it('Solana', async () => {
      const { solanaId, solanaAddress } = await prepareMock(para);

      expect(para.getDisplayAddress(solanaId)).toBe(solanaAddress);

      expect(para.getDisplayAddress(solanaId, { truncate: true })).toBe(
        `${solanaAddress.slice(0, 4)}...${solanaAddress.slice(-4)}`,
      );
    });
  });

  describe('getIdenticonHash', () => {
    beforeEach(async () => {
      para = new MockPara(Environment.DEV, API_KEY);
    });

    it('no wallet found', async () => {
      await prepareMock(para);

      expect(para.getIdenticonHash(faker.string.uuid())).toBeUndefined();
    });

    it('EVM & Cosmos', async () => {
      const { evmId, evmAddress } = await prepareMock(para);

      expect(para.getIdenticonHash(evmId)).toBe(`${evmId}-${evmAddress}-EVM`);

      expect(para.getIdenticonHash(evmId, 'COSMOS')).toBe(`${evmId}-${evmAddress}-COSMOS`);
    });

    it('Solana', async () => {
      const { solanaId, solanaAddress } = await prepareMock(para);

      expect(para.getIdenticonHash(solanaId)).toBe(`${solanaId}-${solanaAddress}-SOLANA`);
    });
  });

  describe('url validation', () => {
    let para: MockPara;

    beforeAll(() => {
      para = new MockPara(Environment.DEV, API_KEY);
    });

    describe('isPortal', () => {
      it('should return true when host matches portal URL', () => {
        vi.spyOn(window, 'location', 'get').mockReturnValue({ host: 'localhost:3003' } as Location);
        expect((para as unknown as any).isPortal()).toBe(true);
        expect(para).toBeDefined();
      });

      it('should return false when host does not match portal URL', () => {
        vi.spyOn(window, 'location', 'get').mockReturnValue({ host: 'different-host.com' } as Location);
        expect((para as unknown as any).isPortal()).toBe(false);
        expect(para).toBeDefined();
      });

      it('should return true when host matches portal URL with environment override', () => {
        vi.spyOn(window, 'location', 'get').mockReturnValue({ host: 'app.sandbox.usecapsule.com' } as Location);
        expect((para as unknown as any).isPortal(Environment.SANDBOX)).toBe(true);
      });
    });

    describe('isParaConnect', () => {
      it('should return true when host matches para connect URL', () => {
        vi.spyOn(window, 'location', 'get').mockReturnValue({ host: 'localhost:3008' } as Location);
        expect((para as unknown as any).isParaConnect()).toBe(true);
        expect(para).toBeDefined();
      });

      it('should return false when host does not match para connect URL', () => {
        vi.spyOn(window, 'location', 'get').mockReturnValue({ host: 'different-host.com' } as Location);
        expect((para as unknown as any).isParaConnect()).toBe(false);
        expect(para).toBeDefined();
      });
    });
  });
  it('toString', async () => {
    await prepareMock(para);

    const externalWallet = {
      id: 'external-wallet-id',
      signer: 'external-signer-secret',
      type: 'EVM',
      address: '0xexternal',
    };

    await para.setExternalWallets({
      'external-wallet-id': externalWallet,
    } as unknown as Record<string, Wallet>);

    const paraStr = para.toString();

    expect(paraStr.startsWith('Para ')).toBe(true);

    expect(JSON.parse(paraStr.slice(5))).toStrictEqual({
      userId: USER_ID,
      authInfo: {
        authType: 'email',
        identifier: USER_EMAIL,
        auth: { email: USER_EMAIL },
      },
      ctx: {
        apiKey: API_KEY,
        disableWebSockets: false,
        env: Environment.DEV,
        useDKLS: true,
      },
      currentWalletIds: para.currentWalletIds,
      guestWalletIds: {},
      isGuestMode: false,
      isReady: false,
      externalWallets: Object.fromEntries(
        Object.entries(para.externalWallets).map(([id, wallet]) => [
          id,
          {
            ...wallet,
            signer: '[REDACTED]',
          },
        ]),
      ),
      pregenIds: para.pregenIds,
      wallets: Object.fromEntries(
        Object.entries(para.wallets).map(([id, wallet]) => [
          id,
          {
            ...wallet,
            signer: '[REDACTED]',
          },
        ]),
      ),
    });
  });

  describe('sendLoginCode', () => {
    beforeEach(() => {
      para = new MockPara(Environment.DEV, API_KEY);
    });

    it('sendLoginCode', async () => {
      para.setAuth({ email: USER_EMAIL });

      await para.sendLoginCode();

      expect(mockSendLoginVerificationCode).toHaveBeenCalledWith(para.authInfo);
    });
  });
});
