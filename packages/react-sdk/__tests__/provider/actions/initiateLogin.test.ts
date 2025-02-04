import { describe, vi, afterEach, it, expect } from 'vitest';
import { mockInitiateUserLoginV2, MockPara } from '../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../constants';
import { initiateLogin } from '../../../src/provider/actions/initiateLogin';

describe('initiateLogin', () => {
  const paraClient = new MockPara(Environment.DEV, API_KEY);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('success', async () => {
    await initiateLogin(paraClient, { email: 'test@test.com' });

    expect(mockInitiateUserLoginV2).toHaveBeenCalledTimes(1);
  });
  describe('fail', () => {
    it('no para', async () => {
      expect(initiateLogin(undefined, { email: 'test@test.com' })).rejects.toThrowError();
    });
    it('no args', async () => {
      expect(initiateLogin(paraClient, undefined)).rejects.toThrowError();
    });
  });
});
