import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';

import { ed25519Keygen, ed25519PreKeygen, keygen, preKeygen, refresh } from '../../src/wallet/keygen.js';
import { Environment, WalletType } from '@usecapsule/core-sdk';
import {
  COSMOS_PREFIX,
  OFFLOAD_MPC_COMPUTATION_URL,
  PARTNER,
  PREGEN_WALLET,
  RECOVERY_SHARE,
  SECRET_KEY,
  USER,
  WALLET,
} from '../constants.js';
import { getWorkerContent } from '../utils.js';
import { mockDistributeNewShare } from '../mocks/mockCoreSdk.js';
import { workerMessagePostSpy, workerTerminateSpy } from '../mocks/mockWorker.js';
import { TEST_CTX } from '../setup.js';

describe('keygen', () => {
  beforeEach(async () => {
    const workerFileContent = await getWorkerContent();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(workerFileContent),
      } as Response),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('keygen', () => {
    it('success', async () => {
      const resp = await keygen(TEST_CTX, USER.id, WalletType.EVM, SECRET_KEY, false, USER.sessionCookie);

      expect(resp).toStrictEqual({
        signer: WALLET.signer,
        walletId: WALLET.id,
        recoveryShare: RECOVERY_SHARE,
      });
      expect(mockDistributeNewShare).toBeCalledTimes(1);
      expect(workerTerminateSpy).toBeCalledTimes(1);
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
        offloadMPCComputationURL: OFFLOAD_MPC_COMPUTATION_URL,
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        disableWebSockets: false,
        wasmOverride: undefined,
      });
    });
    it('success - skip distribute', async () => {
      const resp = await keygen(TEST_CTX, USER.id, WalletType.EVM, SECRET_KEY, true, USER.sessionCookie);

      expect(resp).toStrictEqual({
        signer: WALLET.signer,
        walletId: WALLET.id,
        recoveryShare: null,
      });
      expect(mockDistributeNewShare).toBeCalledTimes(0);
      expect(workerTerminateSpy).toBeCalledTimes(1);
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
        offloadMPCComputationURL: OFFLOAD_MPC_COMPUTATION_URL,
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        disableWebSockets: false,
        wasmOverride: undefined,
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
      expect(workerTerminateSpy).toBeCalledTimes(1);
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
        offloadMPCComputationURL: OFFLOAD_MPC_COMPUTATION_URL,
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        disableWebSockets: false,
        wasmOverride: undefined,
      });
    });
  });
  describe('refresh', () => {
    it('success', async () => {
      const resp = await refresh(TEST_CTX, USER.sessionCookie, USER.id, WALLET.id, WALLET.share, PARTNER.id, PARTNER.id);

      expect(resp).toStrictEqual({
        signer: WALLET.signer,
      });
      expect(workerTerminateSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        env: Environment.DEV,
        apiKey: PARTNER.apiKey,
        params: {
          userId: USER.id,
          walletId: WALLET.id,
          share: WALLET.share,
          oldPartnerId: PARTNER.id,
          newPartnerId: PARTNER.id,
        },
        functionType: 'REFRESH',
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        disableWebSockets: false,
        wasmOverride: undefined,
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
      expect(workerTerminateSpy).toBeCalledTimes(1);
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
      expect(workerTerminateSpy).toBeCalledTimes(1);
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
      });
    });
  });
});
