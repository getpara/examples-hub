import { describe, expect, it, vi, afterEach } from 'vitest';
import { upload, retrieve } from '../../src/transmission/transmissionUtils.js';
import { Environment } from '../../src/types/index.js';
import { initClient } from '../../src/external/userManagementClient.js';
import { mockTempTransmission, mockTempTransmissionInit } from '../mocks/mockUserManagementClient.js';
import { TEMP_TRANSMISSION_INIT_ID } from '../constants.js';
import * as eutils from 'ethereumjs-util';

// Workaround for vi.spyOn issue: https://github.com/aelbore/esbuild-jest/issues/26#issuecomment-968853688
vi.mock('ethereumjs-util', async importOriginal => {
  const actual = await importOriginal();
  return {
    __esModule: true,
    // @ts-ignore
    ...actual,
  };
});

const TEST_CLIENT = initClient({ env: Environment.DEV });

describe('transmissionUtils', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  describe('upload', () => {
    it('base', async () => {
      const resp = await upload('test', TEST_CLIENT);

      expect(mockTempTransmissionInit).toBeCalledTimes(1);
      expect(mockTempTransmissionInit).toBeCalledWith(expect.stringMatching(/./));
      expect(mockTempTransmissionInit).toBeCalledWith(expect.stringMatching(/.{164}/));
      expect(resp).toStrictEqual(expect.stringContaining(TEMP_TRANSMISSION_INIT_ID));
    });
    it('fail in loop', async () => {
      vi.spyOn(eutils, 'privateToPublic').mockImplementationOnce(() => {
        throw new Error('test error');
      });

      const resp = await upload('test', TEST_CLIENT);

      expect(mockTempTransmissionInit).toBeCalledTimes(1);
      expect(mockTempTransmissionInit).toBeCalledWith(expect.stringMatching(/./));
      expect(mockTempTransmissionInit).toBeCalledWith(expect.stringMatching(/.{164}/));
      expect(resp).toStrictEqual(expect.stringContaining(TEMP_TRANSMISSION_INIT_ID));
    });
  });
  describe('retrieve', () => {
    it('base', async () => {
      const uploadResp = await upload('test', TEST_CLIENT);
      const encodedMessage = mockTempTransmissionInit.mock.calls[0][0];
      mockTempTransmission.mockResolvedValueOnce({ data: { message: encodedMessage } });
      const resp = await retrieve(uploadResp, TEST_CLIENT);

      expect(mockTempTransmission).toBeCalledTimes(1);
      expect(mockTempTransmission).toBeCalledWith(TEMP_TRANSMISSION_INIT_ID);
      expect(resp).toBe('test');
    });
  });
});
