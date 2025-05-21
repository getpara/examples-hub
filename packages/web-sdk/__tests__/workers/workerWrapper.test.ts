import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';

import * as worker from '../../src/workers/worker.js';
import { setupWorker } from '../../src/workers/workerWrapper.js';
import { TEST_CTX } from '../setup.js';
import { Worker } from '../mocks/mockWorker.js';
import { getWorkerContent } from '../utils.js';
import { Ctx } from '@getpara/core-sdk';

const handleMessageSpy = vi.spyOn(worker, 'handleMessage').mockImplementationOnce(async () => false);
const mockResFn = vi.fn();
const mockErrorFn = vi.fn();

describe('workerWrapper', () => {
  beforeEach(async () => {
    const workerFileContent = await getWorkerContent();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(workerFileContent),
      } as Response),
    );

    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('setupWorker', () => {
    it('success', async () => {
      const worker = await setupWorker(TEST_CTX, mockResFn, mockErrorFn);

      expect(worker).toBeInstanceOf(Worker);
      worker.onmessage({ data: { functionType: 'CUSTOM' } });
      expect(handleMessageSpy).toBeCalledTimes(0);
    });
    it('success - disableWorkers', async () => {
      const _TEST_CTX: Ctx = { ...TEST_CTX, disableWorkers: true };
      const worker = await setupWorker(_TEST_CTX, mockResFn, mockErrorFn);

      expect(worker.postMessage).toBeDefined();
      expect(worker.postMessage).toBeInstanceOf(Function);
      expect(worker.terminate).toBeDefined();
      expect(worker.terminate).toBeInstanceOf(Function);

      worker.postMessage({ functionType: 'TEST' });
      expect(handleMessageSpy).toBeCalledTimes(1);
      expect(handleMessageSpy).toBeCalledWith({ data: { functionType: 'TEST' } }, expect.any(Function), true);

      const terminateResp = worker.terminate();
      expect(terminateResp).toBeUndefined();
    });
    it('fail - useLocalFiles', async () => {
      await expect(setupWorker({ ...TEST_CTX, useLocalFiles: true }, mockResFn, mockErrorFn)).rejects.toThrowError(
        'useLocalFiles only supported locally',
      );
    });
    it('skips processing for CUSTOM function type', async () => {
      const worker = await setupWorker(TEST_CTX, mockResFn, mockErrorFn);

      worker.onmessage({ data: { functionType: 'CUSTOM', payload: 'test' } });

      expect(mockResFn).not.toHaveBeenCalled();
    });
    it('handles error events through onerror handler', async () => {
      const errorFn = vi.fn();

      const worker = await setupWorker(TEST_CTX, vi.fn(), errorFn);

      const mockError = {
        message: 'Test error message',
        toString: () => 'ErrorEvent',
      };

      expect(() => {
        worker.onerror(mockError);
      }).not.toThrow();

      expect(errorFn).toHaveBeenCalled();
    });

    it('handles errors in syncWorker postMessage', async () => {
      const errorFn = vi.fn();
      const testError = new Error('Test error in handleMessage');

      const handleMessageMock = vi.spyOn(worker, 'handleMessage').mockImplementation(() => {
        throw testError;
      });

      const _TEST_CTX: Ctx = { ...TEST_CTX, disableWorkers: true };
      const syncWorker = await setupWorker(_TEST_CTX, vi.fn(), errorFn);

      syncWorker.postMessage({ functionType: 'TEST' });

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(handleMessageMock).toHaveBeenCalled();
      expect(errorFn).toHaveBeenCalledWith(testError);

      handleMessageMock.mockRestore();
    });
  });
});
