import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';

import { ed25519Keygen, ed25519PreKeygen, keygen, preKeygen, refresh } from '../../src/wallet/keygen.js';
import { Environment } from '@getpara/core-sdk';
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
import { workerMessagePostSpy } from '../mocks/mockWorker.js';
import { TEST_CTX } from '../setup.js';
import * as workerWrapper from '../../src/workers/workerWrapper.js';

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
      const resp = await keygen(TEST_CTX, USER.id, 'EVM', SECRET_KEY, false, USER.sessionCookie);

      expect(resp).toStrictEqual({
        signer: WALLET.signer,
        walletId: WALLET.id,
        recoveryShare: RECOVERY_SHARE,
      });
      expect(mockDistributeNewShare).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        env: Environment.DEV,
        apiKey: PARTNER.apiKey,
        cosmosPrefix: COSMOS_PREFIX,
        params: {
          userId: USER.id,
          secretKey: SECRET_KEY,
          type: 'EVM',
        },
        functionType: 'KEYGEN',
        offloadMPCComputationURL: OFFLOAD_MPC_COMPUTATION_URL,
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        disableWebSockets: false,
        wasmOverride: undefined,
        workId: expect.any(String),
      });
    });
    it('success - skip distribute', async () => {
      const resp = await keygen(TEST_CTX, USER.id, 'EVM', SECRET_KEY, true, USER.sessionCookie);

      expect(resp).toStrictEqual({
        signer: WALLET.signer,
        walletId: WALLET.id,
        recoveryShare: null,
      });
      expect(mockDistributeNewShare).toBeCalledTimes(0);
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        env: Environment.DEV,
        apiKey: PARTNER.apiKey,
        cosmosPrefix: COSMOS_PREFIX,
        params: {
          userId: USER.id,
          secretKey: SECRET_KEY,
          type: 'EVM',
        },
        functionType: 'KEYGEN',
        offloadMPCComputationURL: OFFLOAD_MPC_COMPUTATION_URL,
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        disableWebSockets: false,
        wasmOverride: undefined,
        workId: expect.any(String),
      });
    });
    it('handles worker errors', async () => {
      const mockWorkerError = new Error('Mock worker error');
      vi.spyOn(workerWrapper, 'setupWorker').mockImplementationOnce((_ctx, _onSuccess, onError) => {
        setTimeout(() => onError(mockWorkerError), 0);
        return Promise.resolve({ postMessage: vi.fn(), terminate: vi.fn() }) as any;
      });
      await expect(keygen(TEST_CTX, USER.id, 'EVM', SECRET_KEY, false, USER.sessionCookie)).rejects.toThrow(mockWorkerError);
    });
  });
  describe('preKeygen', () => {
    it('success', async () => {
      const resp = await preKeygen(TEST_CTX, USER.email, 'EMAIL', 'EVM', SECRET_KEY, false, PARTNER.id, USER.sessionCookie);

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
          type: 'EVM',
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
        workId: expect.any(String),
      });
    });

    it('handles worker errors', async () => {
      const mockWorkerError = new Error('Mock worker error');
      vi.spyOn(workerWrapper, 'setupWorker').mockImplementationOnce((_ctx, _onSuccess, onError) => {
        setTimeout(() => onError(mockWorkerError), 0);
        return Promise.resolve({ postMessage: vi.fn(), terminate: vi.fn() }) as any;
      });
      await expect(
        preKeygen(TEST_CTX, USER.email, 'EMAIL', 'EVM', SECRET_KEY, false, PARTNER.id, USER.sessionCookie),
      ).rejects.toThrow(mockWorkerError);
    });
  });
  describe('refresh', () => {
    it('success', async () => {
      const resp = await refresh(
        TEST_CTX,
        USER.sessionCookie,
        USER.id,
        WALLET.id,
        WALLET.share,
        PARTNER.id,
        PARTNER.id,
        WALLET.preExistingProtocolId,
      );

      expect(resp).toStrictEqual({
        signer: WALLET.signer,
        protocolId: WALLET.protocolId,
      });
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
          keyShareProtocolId: WALLET.preExistingProtocolId,
        },
        functionType: 'REFRESH',
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        disableWebSockets: false,
        wasmOverride: undefined,
        returnObject: true,
        workId: expect.any(String),
      });
    });

    it('handles worker errors', async () => {
      const mockWorkerError = new Error('Mock worker error');
      vi.spyOn(workerWrapper, 'setupWorker').mockImplementationOnce((_ctx, _onSuccess, onError) => {
        setTimeout(() => onError(mockWorkerError), 0);
        return Promise.resolve({ postMessage: vi.fn(), terminate: vi.fn() }) as any;
      });
      await expect(
        refresh(
          TEST_CTX,
          USER.sessionCookie,
          USER.id,
          WALLET.id,
          WALLET.share,
          PARTNER.id,
          PARTNER.id,
          WALLET.preExistingProtocolId,
        ),
      ).rejects.toThrow(mockWorkerError);
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

    it('handles worker errors', async () => {
      const mockWorkerError = new Error('Mock worker error');
      vi.spyOn(workerWrapper, 'setupWorker').mockImplementationOnce((_ctx, _onSuccess, onError) => {
        setTimeout(() => onError(mockWorkerError), 0);
        return Promise.resolve({ postMessage: vi.fn(), terminate: vi.fn() }) as any;
      });
      await expect(ed25519Keygen(TEST_CTX, USER.id, USER.sessionCookie, {})).rejects.toThrow(mockWorkerError);
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

    it('handles worker errors', async () => {
      const mockWorkerError = new Error('Mock worker error');
      vi.spyOn(workerWrapper, 'setupWorker').mockImplementationOnce((_ctx, _onSuccess, onError) => {
        setTimeout(() => onError(mockWorkerError), 0);
        return Promise.resolve({ postMessage: vi.fn(), terminate: vi.fn() }) as any;
      });
      await expect(ed25519PreKeygen(TEST_CTX, USER.email, 'EMAIL', USER.sessionCookie)).rejects.toThrow(mockWorkerError);
    });
  });
});
