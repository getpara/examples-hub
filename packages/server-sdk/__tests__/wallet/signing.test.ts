import { vi, describe, it, expect, afterEach, beforeAll } from 'vitest';
import { Environment, SuccessfulSignatureRes } from '@getpara/core-sdk';

// needs to be imported early to mock properly
import { workerMessagePostSpy } from '../mocks/mockWorker.js';
import { signTransaction, sendTransaction, signMessage, ed25519Sign } from '../../src/wallet/signing.js';
import { COSMOS_PREFIX, PARTNER, USER, WALLET, SHARE, TX, CHAIN, MESSAGE, BASE64_BYTES, SIGNATURE } from '../constants.js';
import { TEST_CTX } from '../setup.js';

describe('signing', () => {
  beforeAll(async () => {
    global.fetch = vi.fn(() => ({
      text: vi.fn(),
    })) as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('signTransaction', () => {
    it('success', async () => {
      const resp = await signTransaction(TEST_CTX, USER.id, WALLET.id, SHARE.id, TX, CHAIN, USER.sessionCookie, true);

      expect(resp).toBeDefined();
      expect((resp as SuccessfulSignatureRes).signature).toBe(SIGNATURE);
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        env: Environment.DEV,
        apiKey: PARTNER.apiKey,
        cosmosPrefix: COSMOS_PREFIX,
        params: {
          share: SHARE.id,
          walletId: WALLET.id,
          userId: USER.id,
          tx: TX,
          chainId: CHAIN,
        },
        functionType: 'SIGN_TRANSACTION',
        offloadMPCComputationURL: undefined,
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        disableWebSockets: false,
        wasmOverride: undefined,
        workId: expect.any(String),
      });
    });
  });

  describe('sendTransaction', () => {
    it('success', async () => {
      const resp = await sendTransaction(TEST_CTX, USER.id, WALLET.id, SHARE.id, TX, CHAIN, USER.sessionCookie, true);

      expect(resp).toBeDefined();
      expect((resp as SuccessfulSignatureRes).signature).toBe(SIGNATURE);
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        env: Environment.DEV,
        apiKey: PARTNER.apiKey,
        params: {
          share: SHARE.id,
          walletId: WALLET.id,
          userId: USER.id,
          tx: TX,
          chainId: CHAIN,
        },
        functionType: 'SEND_TRANSACTION',
        offloadMPCComputationURL: undefined,
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        disableWebSockets: false,
        wasmOverride: undefined,
        workId: expect.any(String),
      });
    });
  });

  describe('signMessage', () => {
    it('success', async () => {
      const resp = await signMessage(TEST_CTX, USER.id, WALLET.id, SHARE.id, MESSAGE, USER.sessionCookie, true);

      expect(resp).toBeDefined();
      expect((resp as SuccessfulSignatureRes).signature).toBe(SIGNATURE);
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        env: Environment.DEV,
        apiKey: PARTNER.apiKey,
        params: {
          share: SHARE.id,
          walletId: WALLET.id,
          userId: USER.id,
          message: MESSAGE,
        },
        functionType: 'SIGN_MESSAGE',
        offloadMPCComputationURL: undefined,
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        disableWebSockets: false,
        wasmOverride: undefined,
        workId: expect.any(String),
      });
    });
  });

  describe('ed25519Sign', () => {
    it('success', async () => {
      const resp = await ed25519Sign(TEST_CTX, USER.id, WALLET.id, SHARE.id, BASE64_BYTES, USER.sessionCookie);

      expect(resp).toBeDefined();
      expect((resp as SuccessfulSignatureRes).signature).toBe(SIGNATURE);
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        env: Environment.DEV,
        apiKey: PARTNER.apiKey,
        params: {
          share: SHARE.id,
          walletId: WALLET.id,
          userId: USER.id,
          base64Bytes: BASE64_BYTES,
        },
        functionType: 'ED25519_SIGN',
        offloadMPCComputationURL: undefined,
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        disableWebSockets: false,
        wasmOverride: undefined,
        workId: expect.any(String),
      });
    });
  });
});
