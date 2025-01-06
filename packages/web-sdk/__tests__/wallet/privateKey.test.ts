import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';

import { Environment } from '@usecapsule/core-sdk';
import { COSMOS_PREFIX, OFFLOAD_MPC_COMPUTATION_URL, PARTNER, USER, WALLET } from '../constants.js';
import { getWorkerContent } from '../utils.js';
import { getPrivateKey } from '../../src/wallet/privateKey.js';
import { workerMessagePostSpy, workerTerminateSpy } from '../mocks/mockWorker.js';
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
  });

  describe('getPrivateKey', () => {
    it('success', async () => {
      const resp = await getPrivateKey(TEST_CTX, USER.id, WALLET.id, WALLET.share, USER.sessionCookie);

      expect(resp).toBe(WALLET.privateKey);
      expect(workerTerminateSpy).toBeCalledTimes(1);
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
      });
    });
  });
});
