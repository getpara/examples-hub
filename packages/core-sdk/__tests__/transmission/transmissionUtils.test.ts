import { describe, expect, it, vi, afterEach } from 'vitest';
import { upload, retrieve } from '../../src/transmission/transmissionUtils.js';
import { Environment } from '../../src/types/index.js';
import { initClient } from '../../src/external/userManagementClient.js';
import { mockTempTransmission, mockTempTransmissionInit } from '../mocks/mockUserManagementClient.js';
import { TEMP_TRANSMISSION_INIT_ID } from '../constants.js';
import { PrivateKey } from 'eciesjs';

vi.mock('crypto', async importOriginal => {
  const actual = await importOriginal<typeof import('crypto')>();
  return {
    ...actual,
    randomBytes: vi.fn(actual.randomBytes),
  };
});

import { randomBytes } from 'crypto';

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
      expect(mockTempTransmissionInit).toBeCalledWith(expect.stringMatching(/.{140}/));
      expect(resp).toStrictEqual(expect.stringContaining(TEMP_TRANSMISSION_INIT_ID));
    });
    it('fail in loop', async () => {
      vi.spyOn(PrivateKey, 'fromHex').mockImplementationOnce(() => {
        throw new Error('test error');
      });

      const resp = await upload('test', TEST_CLIENT);

      expect(mockTempTransmissionInit).toBeCalledTimes(1);
      expect(randomBytes).toBeCalledTimes(2);
      expect(mockTempTransmissionInit).toBeCalledWith(expect.stringMatching(/./));
      expect(mockTempTransmissionInit).toBeCalledWith(expect.stringMatching(/.{140}/));
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
