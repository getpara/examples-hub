import { expect, describe, it, vi, beforeEach } from 'vitest';
import * as uuid from 'uuid';

import { Environment } from '../../src';
import { setupWorker } from '../../src/workers/workerWrapper';

const MOCK_WORKER_CODE = `
  const { parentPort } = require('worker_threads');

  parentPort.on('message', (message) => {
    parentPort.postMessage(message);
  });
`;

describe('workerWrapper', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() => ({
      text: vi.fn(() => Promise.resolve(MOCK_WORKER_CODE)),
    })) as any;
    global.setTimeout = vi.fn().mockReturnValue(123) as any;
  });

  describe('setupWorker', () => {
    it('sets up worker if none exist and returns existing one if it does', async () => {
      const workId = uuid.v4();
      const createdWorker = await setupWorker({ env: Environment.DEV } as any, vi.fn(), workId);
      const createdWorkerThreadId = createdWorker.threadId;

      const existingWorker = await setupWorker({ env: Environment.DEV } as any, vi.fn(), workId);
      expect(existingWorker.threadId).toBe(createdWorkerThreadId);
    });

    it('sets up a worker that properly processes a message', async () => {
      const workId = uuid.v4();
      let resFunction: any;
      const resPromise = new Promise((resolve, _reject) => {
        resFunction = vi.fn().mockImplementation(() => {
          resolve(null);
        });
      });

      const createdWorker = await setupWorker({ env: Environment.DEV } as any, resFunction, workId);
      createdWorker.postMessage({ workId, message: 'worker-test' });

      await resPromise;
      expect(resFunction).toBeCalledWith({ message: 'worker-test' });
    });
  });
});
