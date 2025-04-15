import { expect, describe, it, vi, beforeEach } from 'vitest';
import * as uuid from 'uuid';

import { Environment } from '../../src/index.js';
import { setupWorker } from '../../src/workers/workerWrapper.js';

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

    it('sets up a timeout that cleans up worker reference', async () => {
      let timeoutCallback: Function;

      vi.spyOn(global, 'setTimeout').mockImplementation((callback: any, _timeout: any): any => {
        timeoutCallback = callback;
        return 123;
      });

      const clearTimeoutMock = vi.fn();
      vi.spyOn(global, 'clearTimeout').mockImplementation(clearTimeoutMock);

      const workId = uuid.v4();
      await setupWorker({ env: Environment.DEV } as any, vi.fn(), workId);

      timeoutCallback();
      expect(clearTimeoutMock).not.toHaveBeenCalled();
      vi.restoreAllMocks();
    });

    it('throws error when worker emits an error event', async () => {
      const workId = uuid.v4();
      const worker = await setupWorker({ env: Environment.DEV } as any, vi.fn(), workId);

      const errorHandler = worker.listeners('error')[0];
      const testError = new Error('Test worker error');

      expect(() => {
        errorHandler(testError);
      }).toThrow('Test worker error');
    });

    it('logs error when worker emits an exit event', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const workId = uuid.v4();
      const worker = await setupWorker({ env: Environment.DEV } as any, vi.fn(), workId);

      const exitHandler = worker.listeners('exit')[0];
      const exitCode = 1;

      exitHandler(exitCode);
      expect(consoleSpy).toHaveBeenCalledWith(`worker stopped with exit code ${exitCode}`);
      consoleSpy.mockRestore();
    });
  });
});
