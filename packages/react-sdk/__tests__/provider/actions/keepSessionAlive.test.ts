import { describe, vi, afterEach, it, expect } from 'vitest';
import { mockKeepSessionAlive, MockPara } from '../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../constants';
import { keepSessionAlive } from '../../../src/provider/actions/keepSessionAlive';

describe('keepSessionAlive', () => {
  const paraClient = new MockPara(Environment.DEV, API_KEY);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('success', async () => {
    await keepSessionAlive(paraClient);

    expect(mockKeepSessionAlive).toHaveBeenCalledTimes(1);
  });
  describe('fail', () => {
    it('no para', async () => {
      await expect(keepSessionAlive(undefined)).rejects.toThrowError();
    });
  });
});
