import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';

import { Environment } from '@usecapsule/core-sdk';
import {
  BASE64_BYTES,
  CHAIN,
  COSMOS_PREFIX,
  COSMOS_SIGN_DOC,
  MESSAGE,
  OFFLOAD_MPC_COMPUTATION_URL,
  PARTNER,
  SIGNATURE,
  TX,
  USER,
  WALLET,
} from '../constants.js';
import { getWorkerContent } from '../utils.js';
import { TEST_CTX } from '../setup.js';
import { workerMessagePostSpy, workerTerminateSpy } from '../mocks/mockWorker.js';
import { ed25519Sign, sendTransaction, signMessage, signTransaction } from '../../src/wallet/signing.js';

describe('signing', () => {
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

  describe('signTransaction', () => {
    it('success', async () => {
      const resp = await signTransaction(TEST_CTX, USER.id, WALLET.id, WALLET.share, TX, CHAIN, USER.sessionCookie, true);

      expect(resp).toStrictEqual({
        signature: SIGNATURE,
      });
      expect(workerTerminateSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        env: Environment.DEV,
        apiKey: PARTNER.apiKey,
        cosmosPrefix: COSMOS_PREFIX,
        params: {
          share: WALLET.share,
          walletId: WALLET.id,
          userId: USER.id,
          tx: TX,
          chainId: CHAIN,
        },
        functionType: 'SIGN_TRANSACTION',
        offloadMPCComputationURL: OFFLOAD_MPC_COMPUTATION_URL,
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        disableWebSockets: false,
        wasmOverride: undefined,
      });
    });
  });
  describe('sendTransaction', () => {
    it('success', async () => {
      const resp = await sendTransaction(TEST_CTX, USER.id, WALLET.id, WALLET.share, TX, CHAIN, USER.sessionCookie, true);

      expect(resp).toStrictEqual({
        signature: SIGNATURE,
      });
      expect(workerTerminateSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        env: Environment.DEV,
        apiKey: PARTNER.apiKey,
        cosmosPrefix: COSMOS_PREFIX,
        params: {
          share: WALLET.share,
          walletId: WALLET.id,
          userId: USER.id,
          tx: TX,
          chainId: CHAIN,
        },
        functionType: 'SEND_TRANSACTION',
        offloadMPCComputationURL: OFFLOAD_MPC_COMPUTATION_URL,
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        disableWebSockets: false,
        wasmOverride: undefined,
      });
    });
  });
  describe('signMessage', () => {
    it('success', async () => {
      const resp = await signMessage(
        TEST_CTX,
        USER.id,
        WALLET.id,
        WALLET.share,
        MESSAGE,
        USER.sessionCookie,
        true,
        COSMOS_SIGN_DOC,
      );

      expect(resp).toStrictEqual({
        signature: SIGNATURE,
      });
      expect(workerTerminateSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        env: Environment.DEV,
        apiKey: PARTNER.apiKey,
        cosmosPrefix: COSMOS_PREFIX,
        params: {
          share: WALLET.share,
          walletId: WALLET.id,
          userId: USER.id,
          message: MESSAGE,
          cosmosSignDoc: COSMOS_SIGN_DOC,
        },
        functionType: 'SIGN_MESSAGE',
        offloadMPCComputationURL: OFFLOAD_MPC_COMPUTATION_URL,
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        disableWebSockets: false,
        wasmOverride: undefined,
      });
    });
  });
  describe('ed25519Sign', () => {
    it('success', async () => {
      const resp = await ed25519Sign(TEST_CTX, USER.id, WALLET.id, WALLET.share, BASE64_BYTES, USER.sessionCookie);

      expect(resp).toStrictEqual({
        signature: SIGNATURE,
      });
      expect(workerTerminateSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        env: Environment.DEV,
        apiKey: PARTNER.apiKey,
        cosmosPrefix: COSMOS_PREFIX,
        params: {
          share: WALLET.share,
          walletId: WALLET.id,
          userId: USER.id,
          base64Bytes: BASE64_BYTES,
        },
        functionType: 'ED25519_SIGN',
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        disableWebSockets: false,
        wasmOverride: undefined,
      });
    });
  });
});
