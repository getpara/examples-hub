import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';

import * as worker from '../../src/workers/worker.js';
import { setupWorker } from '../../src/workers/workerWrapper.js';
import { TEST_CTX } from '../setup.js';
import { Worker } from '../mocks/mockWorker.js';
import { getWorkerContent } from '../utils.js';
import { Ctx } from '@getpara/core-sdk';

const handleMessageSpy = vi.spyOn(worker, 'handleMessage').mockImplementationOnce(async () => false);
const mockResFn = vi.fn();

describe('workerWrapper', () => {
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

  describe('setupWorker', () => {
    it('success', async () => {
      const worker = await setupWorker(TEST_CTX, mockResFn);

      expect(worker).toBeInstanceOf(Worker);
      worker.onmessage({ data: { functionType: 'CUSTOM' } });
      expect(handleMessageSpy).toBeCalledTimes(0);
    });
    it('success - disableWorkers', async () => {
      const _TEST_CTX: Ctx = { ...TEST_CTX, disableWorkers: true };
      const worker = await setupWorker(_TEST_CTX, mockResFn);

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
      await expect(setupWorker({ ...TEST_CTX, useLocalFiles: true }, mockResFn)).rejects.toThrowError(
        'useLocalFiles only supported locally',
      );
    });
  });
});
