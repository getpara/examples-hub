import { describe, vi, afterEach, expect, it, beforeEach } from 'vitest';
import { MockPara } from '../mocks/mockParaCore';
import { Environment } from '../../src/types';
import { API_KEY } from '../constants';
import { mockTrackError } from '../mocks/mockUserManagementClient';

describe('Error Tracking', () => {
  let para: MockPara;

  beforeEach(() => {
    para = new MockPara(Environment.DEV, API_KEY);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('methods that should be wrapped with error tracking', () => {
    it('should track errors in signUpOrLogIn method', async () => {
      const error = new Error('Test error');
      vi.spyOn(para.ctx.client, 'signUpOrLogIn').mockRejectedValueOnce(error);

      await expect(para.signUpOrLogIn({ auth: { email: 'test@example.com' } })).rejects.toThrow(error);
      expect(mockTrackError).toHaveBeenCalledWith({
        methodName: 'signUpOrLogIn',
        sdkType: 'WEB',
        userId: undefined,
        error: {
          name: error.name,
          message: error.message,
        },
      });
    });
  });

  describe('methods that should NOT be wrapped with error tracking', () => {
    it('should not track errors in setEmail method', async () => {
      const error = new Error('Test error');
      vi.spyOn(para, 'setEmail').mockRejectedValueOnce(error);

      await expect(para.setEmail('test@example.com')).rejects.toThrow(error);
      expect(mockTrackError).not.toHaveBeenCalled();
    });

    it('should not track errors in getWalletBalance method', async () => {
      const error = new Error('Test error');
      vi.spyOn(para, 'getWalletBalance').mockRejectedValueOnce(error);

      await expect(para.getWalletBalance({ walletId: 'wallet-id' })).rejects.toThrow(error);
      expect(mockTrackError).not.toHaveBeenCalled();
    });
  });

  describe('trackError method', () => {
    it('should call client.trackError with correct parameters and rethrow the error', async () => {
      const methodName = 'testMethod';
      const error = new Error('Test error');
      const userId = 'test-user-id';

      await para.setUserId(userId);

      await expect((para as any).trackError(methodName, error)).rejects.toThrow(error);

      expect(mockTrackError).toHaveBeenCalledWith({
        methodName,
        sdkType: 'WEB',
        userId,
        error: {
          name: error.name,
          message: error.message,
        },
      });
    });

    it('should handle errors in client.trackError gracefully', async () => {
      const methodName = 'testMethod';
      const error = new Error('Original error');
      const trackingError = new Error('Tracking error');

      console.error = vi.fn();
      mockTrackError.mockRejectedValueOnce(trackingError);

      await expect((para as any).trackError(methodName, error)).rejects.toThrow(error);
      expect(console.error).toHaveBeenCalledWith('error tracking error:', trackingError);
    });
  });

  describe('wrapMethodsWithErrorTracking implementation', () => {
    it('should wrap all the methods specified in wrapMethodsWithErrorTracking call', () => {
      expect((para as any).wrapMethodsWithErrorTracking).toBeDefined();

      const originalTrackedMethod = Object.getPrototypeOf(MockPara.prototype).signUpOrLogIn;
      const wrappedTrackedMethod = para.signUpOrLogIn;

      expect(wrappedTrackedMethod).not.toBe(originalTrackedMethod);
    });
  });
});
