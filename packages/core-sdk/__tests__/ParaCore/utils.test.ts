import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockPara } from '../mocks/mockParaCore';
import { expectSearchParams, getWorkerContent, prepareMock } from '../utils';
import { API_KEY, COMMON_SEARCH_PARAMS, SESSION_ID, USER_EMAIL, USER_ID } from '../constants';
import { AuthMethod, Environment, Wallet } from '../../src';
import { faker } from '@faker-js/faker';
import {
  mockGetSupportedAuthMethods,
  mockGetSupportedAuthMethodsV2,
  mockSendLoginVerificationCode,
} from '../mocks/mockUserManagementClient';
import { mockWindowLocation } from '../setup.js';
import * as cryptoUtils from '../../src/cryptography/utils';

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

      it('should return true for direct access (copied link) when both opener and parent are undefined', () => {
        vi.spyOn(window, 'location', 'get').mockReturnValue({ host: 'localhost:3003' } as Location);
        Object.defineProperty(window, 'opener', { value: undefined, writable: true });
        Object.defineProperty(window, 'parent', { value: undefined, writable: true });
        expect((para as unknown as any).isPortal()).toBe(true);
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

  describe('supportedUserAuthMethods', () => {
    beforeEach(() => {
      para = new MockPara(Environment.DEV, API_KEY);
    });

    it('legacy methods', async () => {
      mockGetSupportedAuthMethodsV2.mockResolvedValueOnce({
        supportedAuthMethods: [AuthMethod.PASSKEY, AuthMethod.PASSWORD, AuthMethod.PIN],
        hasPasswordWithoutPIN: true,
      });
      para.setAuth({ email: USER_EMAIL });

      const resp = await para.supportedUserAuthMethods();

      expect(mockGetSupportedAuthMethodsV2).toHaveBeenCalledWith(para.authInfo.auth);
      expect(resp.size).toBe(3);
      expect(resp instanceof Set).toBe(true);
    });

    it('basic login', async () => {
      mockGetSupportedAuthMethodsV2.mockResolvedValueOnce({
        supportedAuthMethods: [AuthMethod.BASIC_LOGIN],
        hasPasswordWithoutPIN: false,
      });
      para.setAuth({ email: USER_EMAIL });

      const resp = await para.supportedUserAuthMethods();

      expect(mockGetSupportedAuthMethodsV2).toHaveBeenCalledWith(para.authInfo.auth);
      expect(resp.size).toBe(1);
      expect(resp instanceof Set).toBe(true);
    });
  });

  describe('supportedAuthMethods', () => {
    beforeEach(() => {
      para = new MockPara(Environment.DEV, API_KEY);
    });

    it('all methods', async () => {
      para.setAuth({ email: USER_EMAIL });

      const resp = await para.supportedAuthMethods(para.authInfo.auth);

      expect(mockGetSupportedAuthMethods).toHaveBeenCalledWith(para.authInfo.auth);
      expect(resp.size).toBe(2);
      expect(resp instanceof Set).toBe(true);
    });
  });

  describe('exportPrivateKey', () => {
    beforeEach(async () => {
      para = new MockPara(Environment.DEV, API_KEY);
      await prepareMock(para, { excludePregen: true });
    });

    it('should export private key for a wallet', async () => {
      // Mock window.location to ensure origin is available
      vi.spyOn(window, 'location', 'get').mockReturnValue(mockWindowLocation as Location);

      const mockEncryptionKey = 'mock-encryption-key-hex';
      const getPublicKeyHexSpy = vi.spyOn(cryptoUtils, 'getPublicKeyHex').mockReturnValue(mockEncryptionKey);

      const result = await para.exportPrivateKey({ shouldOpenPopup: true });

      // Verify the return object structure
      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.popupWindow).toBeDefined();
      expect(result.popupWindow).toBe(para.popupWindow);

      // Verify the popup was opened with about:blank
      expect((para as any).platformUtils.openPopup).toHaveBeenCalledWith('about:blank', { type: 'EXPORT_PRIVATE_KEY' });

      // Verify the URL is constructed correctly and window is redirected
      const url = new URL(result.url);

      // Get the wallet ID that was selected (should be a DKLS wallet, not pregenerated)
      const selectedWalletId = para.findWalletId(undefined, { forbidPregen: true, scheme: ['DKLS'] });
      expect(url.pathname).toEqual(`/web/users/${para.userId}/private-key/${selectedWalletId}`);

      // Verify the popup window was redirected to the URL
      expect((result.popupWindow as any).location.href).toBe(result.url);

      // Verify search params
      expectSearchParams(url, {
        ...COMMON_SEARCH_PARAMS,
        userId: USER_ID,
        apiKey: API_KEY,
        origin: mockWindowLocation.origin,
        sessionId: SESSION_ID,
        authInfo: JSON.stringify(para.authInfo),
        email: para.email!,
      });

      getPublicKeyHexSpy.mockRestore();
    });
  });
});
