import { describe, vi, afterEach, expect, it, beforeEach } from 'vitest';
import { MockPara } from '../mocks/mockParaCore';
import { Environment } from '../../src/types';
import { API_KEY, PARTNER } from '../constants';
import { mockTouchSession } from '../mocks/mockUserManagementClient';

describe('TouchSession Error Handling', () => {
  let para: MockPara;
  let mockSetModalError: vi.Mock;

  beforeEach(() => {
    mockSetModalError = vi.fn();
    para = new MockPara(Environment.DEV, API_KEY);
    (para as any).setModalError = mockSetModalError;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('handleTouchSessionError method', () => {
    it('should handle AWS WAF/CORS errors', () => {
      const corsError = new Error('Request blocked by CORS policy: Access-Control-Allow-Origin header');

      (para as any).handleTouchSessionError(corsError);

      expect(mockSetModalError).toHaveBeenCalledWith(
        'Request rate limit reached. Please wait a couple of minutes and try again.',
      );
    });

    it('should handle origin validation errors', () => {
      const originError = new Error('origin not authorized for this application');
      (originError as any).status = 403;

      (para as any).handleTouchSessionError(originError);

      expect(mockSetModalError).toHaveBeenCalledWith(
        'The current origin is not allowed. Update your allowed origins in the Para developer portal to allow the current origin.',
      );
    });

    it('should not display modal error for other errors', () => {
      const otherError = new Error('Some other error');

      (para as any).handleTouchSessionError(otherError);

      expect(mockSetModalError).not.toHaveBeenCalled();
    });

    it('should handle errors without Error constructor', () => {
      const stringError = 'Request blocked by CORS policy: Access-Control-Allow-Origin header missing';

      (para as any).handleTouchSessionError(stringError);

      expect(mockSetModalError).toHaveBeenCalledWith(
        'Request rate limit reached. Please wait a couple of minutes and try again.',
      );
    });

    it('should not call setModalError in production environment', () => {
      const prodPara = new MockPara(Environment.PROD, API_KEY);
      (prodPara as any).setModalError = mockSetModalError;

      const corsError = new Error('Request blocked by CORS policy: Access-Control-Allow-Origin header');

      (prodPara as any).handleTouchSessionError(corsError);

      expect(mockSetModalError).not.toHaveBeenCalled();
    });
  });

  describe('touchSession integration with error handling', () => {
    it('should call handleTouchSessionError when touchSession fails', async () => {
      const corsError = new Error('Request blocked by CORS policy: Access-Control-Allow-Origin header');
      vi.spyOn(para.ctx.client, 'touchSession').mockRejectedValueOnce(corsError);
      vi.spyOn(para as any, 'handleTouchSessionError');

      await expect(para.touchSession()).rejects.toThrow(corsError);

      expect((para as any).handleTouchSessionError).toHaveBeenCalledWith(corsError);
      expect(mockSetModalError).toHaveBeenCalledWith(
        'Request rate limit reached. Please wait a couple of minutes and try again.',
      );
    });

    it('should handle origin validation errors in touchSession', async () => {
      const originError = new Error('origin not authorized for this application');
      (originError as any).status = 403;
      vi.spyOn(para.ctx.client, 'touchSession').mockRejectedValueOnce(originError);

      await expect(para.touchSession()).rejects.toThrow();

      expect(mockSetModalError).toHaveBeenCalledWith(
        'The current origin is not allowed. Update your allowed origins in the Para developer portal to allow the current origin.',
      );
    });

    it('should still throw the original error after handling', async () => {
      const corsError = new Error('Request blocked by CORS policy: Access-Control-Allow-Origin header');
      vi.spyOn(para.ctx.client, 'touchSession').mockRejectedValueOnce(corsError);

      await expect(para.touchSession()).rejects.toThrow(corsError);
    });
  });

  describe('displayModalError method', () => {
    it('should call setModalError when not in production', () => {
      const devPara = new MockPara(Environment.DEV, API_KEY);

      (devPara as any).setModalError = mockSetModalError;
      (devPara as any).displayModalError('Test error message');

      expect(mockSetModalError).toHaveBeenCalledWith('Test error message');
    });

    it('should call setModalError in sandbox environment', () => {
      const sandboxPara = new MockPara(Environment.SANDBOX, API_KEY);
      (sandboxPara as any).setModalError = mockSetModalError;

      (sandboxPara as any).displayModalError('Test error message');

      expect(mockSetModalError).toHaveBeenCalledWith('Test error message');
    });

    it('should not call setModalError in production environment', () => {
      const prodPara = new MockPara(Environment.PROD, API_KEY);
      (prodPara as any).setModalError = mockSetModalError;

      (prodPara as any).displayModalError('Test error message');

      expect(mockSetModalError).not.toHaveBeenCalled();
    });

    it('should handle undefined error message', () => {
      (para as any).displayModalError(undefined);

      expect(mockSetModalError).toHaveBeenCalledWith(undefined);
    });
  });

  describe('API key validation in touchSession', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should not display error when running on portal URL without partnerId', async () => {
      // Mock window.location to simulate portal URL
      const originalLocation = window.location;
      delete (window as any).location;
      (window as any).location = { host: 'localhost:3003' };

      // Mock touchSession to return session without partnerId (recovery portal scenario)
      mockTouchSession.mockResolvedValueOnce({
        sessionId: 'test-session-id',
        partnerId: null,
        sessionLookupId: 'test-lookup-id',
        userId: null,
        isAuthenticated: false,
        supportedWalletTypes: [],
        cosmosPrefix: 'cosmos',
        needsWallet: false,
      });

      const portalPara = new MockPara(Environment.DEV, 'fake-api-key');
      (portalPara as any).setModalError = mockSetModalError;

      await portalPara.touchSession();

      // Should not display error for portal without partnerId
      expect(mockSetModalError).not.toHaveBeenCalled();

      // Restore original location
      (window as any).location = originalLocation;
    });

    it('should display error and throw when not on portal URL without partnerId', async () => {
      // Mock window.location to simulate non-portal URL
      const originalLocation = window.location;
      delete (window as any).location;
      (window as any).location = { host: 'example.com' };

      // Mock touchSession to return session without partnerId
      mockTouchSession.mockResolvedValueOnce({
        sessionId: 'test-session-id',
        partnerId: null,
        sessionLookupId: 'test-lookup-id',
        userId: 'test-user-id',
        isAuthenticated: true,
        supportedWalletTypes: [],
        cosmosPrefix: 'cosmos',
        needsWallet: false,
      });

      const nonPortalPara = new MockPara(Environment.DEV, 'fake-api-key');
      (nonPortalPara as any).setModalError = mockSetModalError;
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Should throw error for non-portal without partnerId
      await expect(nonPortalPara.touchSession()).rejects.toThrow('Invalid API Key');

      // Should display error for non-portal without partnerId
      expect(mockSetModalError).toHaveBeenCalledWith(expect.stringContaining('Invalid API Key'));
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      // Restore original location
      (window as any).location = originalLocation;
    });

    it('should not display error when partnerId is present regardless of portal status', async () => {
      // Mock touchSession to return session with partnerId
      mockTouchSession.mockResolvedValueOnce({
        sessionId: 'test-session-id',
        partnerId: PARTNER.id,
        sessionLookupId: 'test-lookup-id',
        userId: 'test-user-id',
        isAuthenticated: true,
        supportedWalletTypes: PARTNER.supportedWalletTypes || [],
        cosmosPrefix: PARTNER.cosmosPrefix,
        needsWallet: false,
      });

      await para.touchSession();

      // Should not display error when partnerId is present
      expect(mockSetModalError).not.toHaveBeenCalled();
    });
  });
});
