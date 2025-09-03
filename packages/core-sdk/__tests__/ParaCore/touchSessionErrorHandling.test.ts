import { describe, vi, afterEach, expect, it, beforeEach } from 'vitest';
import { MockPara } from '../mocks/mockParaCore';
import { Environment } from '../../src/types';
import { API_KEY } from '../constants';

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
});
