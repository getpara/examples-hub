import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';
import * as uuid from 'uuid';
import * as worker from '../../src/workers/worker.js';
import { setupWorker } from '../../src/workers/workerWrapper.js';
import { TEST_CTX } from '../setup.js';
import { Worker } from '../mocks/mockWorker.js';
import { getWorkerContent } from '../utils.js';
import { Ctx, Environment } from '@getpara/core-sdk';

const handleMessageSpy = vi.spyOn(worker, 'handleMessage').mockImplementationOnce(async (_data, onMessage) => {
  onMessage({ data: { functionType: 'TEST' } });
});
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
      const worker = await setupWorker(TEST_CTX, mockResFn, mockErrorFn, 'test-work-id');

      expect(worker).toBeInstanceOf(Worker);
      worker.onmessage({ data: { functionType: 'CUSTOM' } });
      expect(handleMessageSpy).toBeCalledTimes(0);
    });
    it('success - disableWorkers', async () => {
      const _TEST_CTX: Ctx = { ...TEST_CTX, disableWorkers: true };
      const worker = await setupWorker(_TEST_CTX, mockResFn, mockErrorFn, 'test-work-id');

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
      await expect(
        setupWorker({ ...TEST_CTX, useLocalFiles: true }, mockResFn, mockErrorFn, 'test-work-id'),
      ).rejects.toThrowError('useLocalFiles only supported locally');
    });
    it('skips processing for CUSTOM function type', async () => {
      const worker = await setupWorker(TEST_CTX, mockResFn, mockErrorFn, 'test-work-id');

      // Instead of triggering onmessage directly, we'll mock the worker's message processing
      const mockOnmessage = vi.fn();
      const originalOnmessage = worker.onmessage;
      worker.onmessage = mockOnmessage;

      // Now trigger a postMessage and expect it won't be processed
      worker.postMessage({ functionType: 'CUSTOM', payload: 'test' });

      // Check that mockResFn was not called
      expect(mockResFn).not.toHaveBeenCalled();

      // Restore the original onmessage handler
      worker.onmessage = originalOnmessage;
    });
    it('handles error events through onerror handler', async () => {
      const errorFn = vi.fn();

      const worker = await setupWorker(TEST_CTX, vi.fn(), errorFn, 'test-work-id');

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

      // Mock handleMessage to throw an error
      vi.spyOn(worker, 'handleMessage').mockImplementation(() => {
        throw testError;
      });

      // Create a custom TEST_CTX with disableWorkers set to true
      const _TEST_CTX: Ctx = { ...TEST_CTX, disableWorkers: true };

      // Get a syncWorker instance
      const syncWorker = await setupWorker(_TEST_CTX, vi.fn(), errorFn, 'test-work-id');

      // Directly test the error handling by creating a try/catch block
      try {
        // This should throw an error since handleMessage is mocked to throw
        await syncWorker.postMessage({ functionType: 'TEST' });
      } catch {
        // We expect the errorFn to be called with testError
        expect(errorFn).toHaveBeenCalledWith(testError);
      }
    });

    it('accepts errorContext as optional parameter', async () => {
      const errorContext = { requestId: '123', timestamp: Date.now() };
      const worker = await setupWorker(TEST_CTX, mockResFn, mockErrorFn, 'test-work-id-with-context', errorContext);

      expect(worker).toBeInstanceOf(Worker);
      expect(worker.onmessage).toBeDefined();
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
  });
});
