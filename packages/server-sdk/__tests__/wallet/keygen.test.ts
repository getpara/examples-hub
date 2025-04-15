import { vi, describe, it, expect, afterEach, beforeAll } from 'vitest';
import { Environment, WalletType } from '@getpara/core-sdk';

import { workerMessagePostSpy } from '../mocks/mockWorker.js';
import {
  ed25519Keygen,
  ed25519PreKeygen,
  isKeygenComplete,
  isPreKeygenComplete,
  keygen,
  preKeygen,
} from '../../src/wallet/keygen.js';
import { COSMOS_PREFIX, PARTNER, PREGEN_WALLET, SECRET_KEY, USER, WALLET } from '../constants.js';
import { TEST_CTX } from '../setup.js';
import { mockGetPregenWallets, mockGetWallets } from '../mocks/mockUserManagementClient.js';

describe('keygen', () => {
  beforeAll(async () => {
    global.fetch = vi.fn(() => ({
      text: vi.fn(),
    })) as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isKeygenComplete', () => {
    it('returns true when wallet address exists', async () => {
      const result = await isKeygenComplete(TEST_CTX, USER.id, WALLET.id);

      expect(result).toBe(true);
      expect(mockGetWallets).toHaveBeenCalledWith(USER.id);
    });

    it('returns false when wallet address is missing', async () => {
      const walletWithoutAddress = { ...WALLET, address: undefined };
      mockGetWallets.mockResolvedValueOnce({
        data: {
          wallets: [walletWithoutAddress],
        },
      });

      const result = await isKeygenComplete(TEST_CTX, USER.id, WALLET.id);

      expect(result).toBe(false);
      expect(mockGetWallets).toHaveBeenCalledWith(USER.id);
    });

    it('returns false when wallet is not found', async () => {
      mockGetWallets.mockResolvedValueOnce({
        data: {
          wallets: [],
        },
      });

      const result = await isKeygenComplete(TEST_CTX, USER.id, WALLET.id);

      expect(result).toBe(false);
      expect(mockGetWallets).toHaveBeenCalledWith(USER.id);
    });
  });

  describe('isPreKeygenComplete', () => {
    it('returns true when pregen wallet address exists', async () => {
      const result = await isPreKeygenComplete(TEST_CTX, USER.email, 'EMAIL', PREGEN_WALLET.id);

      expect(result).toBe(true);
      expect(mockGetPregenWallets).toHaveBeenCalledWith({ EMAIL: [USER.email] });
    });

    it('returns false when pregen wallet address is missing', async () => {
      const pregenWalletWithoutAddress = { ...PREGEN_WALLET, address: undefined };
      mockGetPregenWallets.mockResolvedValueOnce({
        wallets: [pregenWalletWithoutAddress],
      });

      const result = await isPreKeygenComplete(TEST_CTX, USER.email, 'EMAIL', PREGEN_WALLET.id);

      expect(result).toBe(false);
      expect(mockGetPregenWallets).toHaveBeenCalledWith({ EMAIL: [USER.email] });
    });

    it('returns false when pregen wallet is not found', async () => {
      mockGetPregenWallets.mockResolvedValueOnce({
        wallets: [],
      });

      const result = await isPreKeygenComplete(TEST_CTX, USER.email, 'EMAIL', PREGEN_WALLET.id);

      expect(result).toBe(false);
      expect(mockGetPregenWallets).toHaveBeenCalledWith({ EMAIL: [USER.email] });
    });
  });

  describe('keygen', () => {
    it('success', async () => {
      const resp = await keygen(TEST_CTX, USER.id, WalletType.EVM, SECRET_KEY, USER.sessionCookie);

      expect(resp).toStrictEqual({
        signer: WALLET.signer,
        walletId: WALLET.id,
        recoveryShare: null,
      });
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        env: Environment.DEV,
        apiKey: PARTNER.apiKey,
        cosmosPrefix: COSMOS_PREFIX,
        params: {
          userId: USER.id,
          secretKey: SECRET_KEY,
          type: WalletType.EVM,
        },
        functionType: 'KEYGEN',
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        disableWebSockets: false,
        wasmOverride: undefined,
        workId: expect.any(String),
      });
    });
  });
  describe('preKeygen', () => {
    it('success', async () => {
      const resp = await preKeygen(
        TEST_CTX,
        USER.email,
        'EMAIL',
        WalletType.EVM,
        SECRET_KEY,
        false,
        PARTNER.id,
        USER.sessionCookie,
      );

      expect(resp).toStrictEqual({
        signer: PREGEN_WALLET.signer,
        walletId: PREGEN_WALLET.id,
        recoveryShare: null,
      });
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        env: Environment.DEV,
        apiKey: PARTNER.apiKey,
        cosmosPrefix: COSMOS_PREFIX,
        params: {
          pregenIdentifier: USER.email,
          pregenIdentifierType: 'EMAIL',
          type: WalletType.EVM,
          secretKey: SECRET_KEY,
          partnerId: PARTNER.id,
          email: USER.email,
        },
        functionType: 'PREKEYGEN',
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        disableWebSockets: false,
        wasmOverride: undefined,
        workId: expect.any(String),
      });
    });
  });
  describe('ed25519Keygen', () => {
    it('success', async () => {
      const resp = await ed25519Keygen(TEST_CTX, USER.id, USER.sessionCookie, {});

      expect(resp).toStrictEqual({
        signer: WALLET.signer,
        walletId: WALLET.id,
        recoveryShare: null,
      });
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        env: Environment.DEV,
        apiKey: PARTNER.apiKey,
        cosmosPrefix: COSMOS_PREFIX,
        params: { userId: USER.id },
        functionType: 'ED25519_KEYGEN',
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        disableWebSockets: false,
        wasmOverride: undefined,
        workId: expect.any(String),
      });
    });
  });
  describe('ed25519PreKeygen', () => {
    it('success', async () => {
      const resp = await ed25519PreKeygen(TEST_CTX, USER.email, 'EMAIL', USER.sessionCookie);

      expect(resp).toStrictEqual({
        signer: PREGEN_WALLET.signer,
        walletId: PREGEN_WALLET.id,
        recoveryShare: null,
      });
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        env: Environment.DEV,
        apiKey: PARTNER.apiKey,
        cosmosPrefix: COSMOS_PREFIX,
        params: {
          pregenIdentifier: USER.email,
          pregenIdentifierType: 'EMAIL',
          email: USER.email,
        },
        functionType: 'ED25519_PREKEYGEN',
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        disableWebSockets: false,
        wasmOverride: undefined,
        workId: expect.any(String),
      });
    });
  });
});
