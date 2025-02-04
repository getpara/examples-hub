import { describe, vi, afterEach, it, expect } from 'vitest';
import { mockLogout, MockPara } from '../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../constants';
import { logout } from '../../../src/provider/actions/logout';

describe('logout', () => {
  const paraClient = new MockPara(Environment.DEV, API_KEY);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('success', async () => {
    await logout(paraClient);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
  describe('fail', () => {
    it('no para', async () => {
      expect(logout(undefined)).rejects.toThrowError();
    });
  });
});
