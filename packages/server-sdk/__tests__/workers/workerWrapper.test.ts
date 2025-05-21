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
      const createdWorker = await setupWorker({ env: Environment.DEV } as any, vi.fn(), vi.fn(), workId, {});
      const createdWorkerThreadId = createdWorker.threadId;

      const existingWorker = await setupWorker({ env: Environment.DEV } as any, vi.fn(), vi.fn(), workId, {});
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

      const createdWorker = await setupWorker({ env: Environment.DEV } as any, resFunction, vi.fn(), workId, {});
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
      await setupWorker({ env: Environment.DEV } as any, vi.fn(), vi.fn(), workId, {});

      timeoutCallback();
      expect(clearTimeoutMock).not.toHaveBeenCalled();
      vi.restoreAllMocks();
    });

    it('logs error and calls errorFn when worker emits an error event', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorFnMock = vi.fn();

      const workId = uuid.v4();
      const worker = await setupWorker({ env: Environment.DEV } as any, vi.fn(), errorFnMock, workId, {});

      const errorHandler = worker.listeners('error')[0];
      const testError = new Error('Test worker error');

      errorHandler(testError);

      expect(consoleSpy).toHaveBeenCalledWith('worker error:', testError);
      expect(errorFnMock).toHaveBeenCalledWith(
        new Error(`worker error with workId ${workId} and opts {}: Test worker error`),
      );

      consoleSpy.mockRestore();
    });

    it('handles worker errors for all registered workIds', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorFnMock1 = vi.fn();
      const errorFnMock2 = vi.fn();

      const workId1 = uuid.v4();
      const workId2 = uuid.v4();

      const worker1 = await setupWorker({ env: Environment.DEV } as any, vi.fn(), errorFnMock1, workId1, {});
      await setupWorker({ env: Environment.DEV } as any, vi.fn(), errorFnMock2, workId2, {});

      const errorHandler = worker1.listeners('error')[0];
      const testError = new Error('Test worker error');

      errorHandler(testError);

      expect(errorFnMock1).toHaveBeenCalledWith(
        new Error(`worker error with workId ${workId1} and opts {}: Test worker error`),
      );
      expect(errorFnMock2).toHaveBeenCalledWith(
        new Error(`worker error with workId ${workId2} and opts {}: Test worker error`),
      );
      expect(consoleSpy).toHaveBeenCalledWith('worker error:', testError);

      consoleSpy.mockRestore();
    });

    it('logs error when worker emits an exit event', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const workId = uuid.v4();
      const worker = await setupWorker({ env: Environment.DEV } as any, vi.fn(), vi.fn(), workId, {});

      const exitHandler = worker.listeners('exit')[0];
      const exitCode = 1;

      exitHandler(exitCode);
      expect(consoleSpy).toHaveBeenCalledWith(`worker stopped with exit code ${exitCode}`);
      consoleSpy.mockRestore();
    });

    it('logs warning and returns when receiving a message with unknown workId', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const resFnMock = vi.fn();

      const validWorkId = uuid.v4();
      const unknownWorkId = uuid.v4();

      const worker = await setupWorker({ env: Environment.DEV } as any, resFnMock, vi.fn(), validWorkId, {});

      const onMessageHandler = worker.listeners('message')[0];

      await onMessageHandler({ functionType: 'test', params: {}, workId: unknownWorkId });

      expect(consoleWarnSpy).toHaveBeenCalledWith(`received message for unknown workId: ${unknownWorkId}`);

      expect(resFnMock).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('handles errors in message processing and calls errorFn', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const resFnMock = vi.fn().mockImplementation(() => {
        throw new Error('Test message handler error');
      });
      const errorFnMock = vi.fn();

      const workId = uuid.v4();
      const worker = await setupWorker({ env: Environment.DEV } as any, resFnMock, errorFnMock, workId, {});

      const onMessageHandler = worker.listeners('message')[0];

      await onMessageHandler({ functionType: 'test', params: {}, workId });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `error in worker message handler for workId ${workId}:`,
        expect.any(Error),
      );

      expect(errorFnMock).toHaveBeenCalledWith(expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });
});
