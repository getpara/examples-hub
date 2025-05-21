import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';
import { Environment } from '@getpara/core-sdk';

import { workerMessagePostSpy } from '../mocks/mockWorker.js';
import * as workerWrapper from '../../src/workers/workerWrapper.js';
import { getPrivateKey } from '../../src/wallet/privateKey.js';
import { COSMOS_PREFIX, PARTNER, USER, WALLET } from '../constants.js';
import { TEST_CTX } from '../setup.js';

describe('privateKey', () => {
  beforeEach(async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(''),
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

      expect(resp).toEqual(WALLET.privateKey);
      expect(workerMessagePostSpy).toBeCalledTimes(1);
      expect(workerMessagePostSpy).toBeCalledWith({
        env: Environment.DEV,
        apiKey: PARTNER.apiKey,
        cosmosPrefix: COSMOS_PREFIX,
        params: {
          share: WALLET.share,
          walletId: WALLET.id,
          userId: USER.id,
        },
        functionType: 'GET_PRIVATE_KEY',
        offloadMPCComputationURL: undefined,
        disableWorkers: false,
        sessionCookie: USER.sessionCookie,
        useDKLS: true,
        disableWebSockets: false,
        wasmOverride: undefined,
        workId: expect.any(String),
      });
    });

    it('should handle errors during worker setup', async () => {
      const setupWorkerSpy = vi.spyOn(workerWrapper, 'setupWorker');
      setupWorkerSpy.mockRejectedValueOnce(new Error('Worker setup error'));

      await expect(getPrivateKey(TEST_CTX, USER.id, WALLET.id, WALLET.share)).rejects.toThrow('Worker setup error');
    });

    it('should handle worker onError callback directly', async () => {
      let capturedOnError: Function;
      const mockWorker = { postMessage: vi.fn() };
      const setupWorkerSpy = vi.spyOn(workerWrapper, 'setupWorker');
      setupWorkerSpy.mockImplementation((ctx, _onMessage, onError) => {
        capturedOnError = onError;
        return Promise.resolve(mockWorker as any);
      });

      const privateKeyPromise = getPrivateKey(TEST_CTX, USER.id, WALLET.id, WALLET.share);
      await vi.waitFor(() => expect(setupWorkerSpy).toHaveBeenCalled());

      const testError = new Error('Worker error callback test');
      capturedOnError(testError);
      await expect(privateKeyPromise).rejects.toThrow('Worker error callback test');
    });
  });
});
