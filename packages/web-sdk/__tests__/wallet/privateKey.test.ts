import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';

import { Environment } from '@getpara/core-sdk';
import { COSMOS_PREFIX, OFFLOAD_MPC_COMPUTATION_URL, PARTNER, USER, WALLET } from '../constants.js';
import { getWorkerContent } from '../utils.js';
import { getPrivateKey } from '../../src/wallet/privateKey.js';
import { workerMessagePostSpy } from '../mocks/mockWorker.js';
import * as workerWrapper from '../../src/workers/workerWrapper.js';
import { TEST_CTX } from '../setup.js';

describe('privateKey', () => {
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
    vi.restoreAllMocks();
  });

  describe('getPrivateKey', () => {
    it('should call worker with correct parameters and return private key', async () => {
      const resp = await getPrivateKey(TEST_CTX, USER.id, WALLET.id, WALLET.share, USER.sessionCookie);

      expect(resp).toBe(WALLET.privateKey);
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        apiKey: PARTNER.apiKey,
        cosmosPrefix: COSMOS_PREFIX,
        disableWebSockets: false,
        disableWorkers: false,
        env: Environment.DEV,
        functionType: 'GET_PRIVATE_KEY',
        offloadMPCComputationURL: OFFLOAD_MPC_COMPUTATION_URL,
        params: {
          share: WALLET.share,
          userId: USER.id,
          walletId: WALLET.id,
        },
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        wasmOverride: undefined,
        workId: expect.any(String),
      });
    });

    it('should handle worker onMessage callback directly', async () => {
      let capturedOnMessage: Function;
      const mockWorker = {
        postMessage: vi.fn(),
        terminate: vi.fn(),
      };

      const setupWorkerSpy = vi.spyOn(workerWrapper, 'setupWorker');
      setupWorkerSpy.mockImplementation((ctx, onMessage, _onError) => {
        capturedOnMessage = onMessage;
        return Promise.resolve(mockWorker as any);
      });

      const privateKeyPromise = getPrivateKey(TEST_CTX, USER.id, WALLET.id, WALLET.share);

      await vi.waitFor(() => expect(setupWorkerSpy).toHaveBeenCalled());

      const customResponse = 'custom-private-key';
      capturedOnMessage(customResponse);

      mockWorker.terminate();

      const result = await privateKeyPromise;
      expect(result).toBe(customResponse);
      expect(mockWorker.terminate).toHaveBeenCalledTimes(1);
    }, 8000);

    it('should handle worker onError callback directly', async () => {
      let capturedOnError: Function;
      const mockWorker = {
        postMessage: vi.fn(),
        terminate: vi.fn(),
      };

      const setupWorkerSpy = vi.spyOn(workerWrapper, 'setupWorker');
      setupWorkerSpy.mockImplementation((ctx, _onMessage, onError) => {
        capturedOnError = onError;
        return Promise.resolve(mockWorker as any);
      });

      const privateKeyPromise = getPrivateKey(TEST_CTX, USER.id, WALLET.id, WALLET.share);

      await vi.waitFor(() => expect(setupWorkerSpy).toHaveBeenCalled());

      const testError = new Error('Worker error callback test');
      capturedOnError(testError);

      mockWorker.terminate();

      await expect(privateKeyPromise).rejects.toThrow('Worker error callback test');
      expect(mockWorker.terminate).toHaveBeenCalledTimes(1);
    });
  });
});
