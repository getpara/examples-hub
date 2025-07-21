import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PortalEmitter } from '../../src/classes/PortalEmitter.js';
import { PortalResponse, PortalResponsePayload } from '@getpara/web-sdk';
// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-123'),
}));

// Mock window and MessageChannel
const mockPostMessage = vi.fn();
const mockPort1 = {
  onmessage: null as any,
  close: vi.fn(),
};
const mockPort2 = {};

const mockMessageChannel = {
  port1: mockPort1,
  port2: mockPort2,
};

const mockCounterpart = {
  postMessage: mockPostMessage,
};

// Global mocks
global.MessageChannel = vi.fn(() => mockMessageChannel) as any;

// Mock window object
Object.defineProperty(global, 'window', {
  value: {
    opener: mockCounterpart,
    parent: mockCounterpart,
  },
  writable: true,
  configurable: true,
});

describe('PortalEmitter', () => {
  let portalEmitter: PortalEmitter;
  const testOrigin = 'https://example.com';

  beforeEach(() => {
    vi.clearAllMocks();
    mockPort1.close.mockClear();
    mockPostMessage.mockClear();
    portalEmitter = new PortalEmitter(testOrigin);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('constructor', () => {
    it('should use window.opener as counterpart when available', () => {
      Object.defineProperty(global, 'window', {
        value: {
          opener: mockCounterpart,
          parent: null,
        },
        writable: true,
        configurable: true,
      });

      const emitter = new PortalEmitter(testOrigin);
      expect(emitter['counterpart']).toBe(mockCounterpart);
    });

    it('should use window.parent as counterpart when opener is not available', () => {
      Object.defineProperty(global, 'window', {
        value: {
          opener: null,
          parent: mockCounterpart,
        },
        writable: true,
        configurable: true,
      });

      const emitter = new PortalEmitter(testOrigin);
      expect(emitter['counterpart']).toBe(mockCounterpart);
    });

    it('should store the origin', () => {
      expect(portalEmitter['origin']).toBe(testOrigin);
    });
  });

  describe('sendMessage', () => {
    it('should create a MessageChannel and send a message', async () => {
      const request = { type: 'ONRAMPS__INIT' as const };
      const expectedResponse: PortalResponse = {
        id: 'test-uuid-123',
        status: 'SUCCESS',
        type: 'ONRAMPS__INIT',
        payload: {
          onRampPurchase: {} as any,
          onRampConfig: {} as any,
        },
      };

      const promise = portalEmitter['sendMessage'](request);

      // Simulate receiving a response
      setTimeout(() => {
        mockPort1.onmessage({ data: expectedResponse });
      }, 10);

      await expect(promise).resolves.toEqual(expectedResponse.payload);
      expect(mockPostMessage).toHaveBeenCalledWith(
        {
          id: 'test-uuid-123',
          isPara: true,
          type: 'ONRAMPS__INIT',
        },
        testOrigin,
        [mockPort2],
      );
      expect(mockPort1.close).toHaveBeenCalled();
    });

    it('should reject with error message when response status is ERROR', async () => {
      const request = { type: 'ONRAMPS__INIT' as const };
      const errorResponse: PortalResponse = {
        id: 'test-uuid-123',
        status: 'ERROR',
        type: 'ONRAMPS__INIT',
        payload: { error: 'Test error message' },
      };

      const promise = portalEmitter['sendMessage'](request);

      setTimeout(() => {
        mockPort1.onmessage({ data: errorResponse });
      }, 10);

      await expect(promise).rejects.toBe('Test error message');
      expect(mockPort1.close).toHaveBeenCalled();
    });

    it('should reject with generic error when error payload is malformed', async () => {
      const request = { type: 'ONRAMPS__INIT' as const };
      const errorResponse: PortalResponse = {
        id: 'test-uuid-123',
        status: 'ERROR',
        type: 'ONRAMPS__INIT',
        payload: {} as any, // Missing error property
      };

      const promise = portalEmitter['sendMessage'](request);

      setTimeout(() => {
        mockPort1.onmessage({ data: errorResponse });
      }, 10);

      await expect(promise).rejects.toBe('An error occurred');
    });

    it('should ignore messages with different IDs', async () => {
      const request = { type: 'ONRAMPS__INIT' as const };
      const wrongIdResponse: PortalResponse = {
        id: 'wrong-id',
        status: 'SUCCESS',
        type: 'ONRAMPS__INIT',
        payload: {
          onRampPurchase: {} as any,
          onRampConfig: {} as any,
        },
      };
      const correctResponse: PortalResponse = {
        id: 'test-uuid-123',
        status: 'SUCCESS',
        type: 'ONRAMPS__INIT',
        payload: {
          onRampPurchase: {} as any,
          onRampConfig: {} as any,
        },
      };

      const promise = portalEmitter['sendMessage'](request);

      setTimeout(() => {
        mockPort1.onmessage({ data: wrongIdResponse });
        mockPort1.onmessage({ data: correctResponse });
      }, 10);

      await expect(promise).resolves.toEqual(correctResponse.payload);
      expect(mockPort1.close).toHaveBeenCalledOnce();
    });

    it('should timeout after 30 seconds', async () => {
      vi.useFakeTimers();

      const request = { type: 'ONRAMPS__INIT' as const };
      const promise = portalEmitter['sendMessage'](request);

      // Fast-forward time by 30 seconds
      vi.advanceTimersByTime(30000);

      await expect(promise).rejects.toThrow('Timeout: No response received.');
      expect(mockPort1.close).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('init', () => {
    it('should call sendMessage with correct parameters', async () => {
      const mockSendMessage = vi.spyOn(portalEmitter as any, 'sendMessage');
      const mockResponse: PortalResponsePayload<'ONRAMPS__INIT'> = {
        onRampPurchase: {} as any,
        onRampConfig: {} as any,
      };
      mockSendMessage.mockResolvedValue(mockResponse);

      const result = await portalEmitter.init();

      expect(mockSendMessage).toHaveBeenCalledWith({ type: 'ONRAMPS__INIT' });
      expect(result).toBe(mockResponse);
    });
  });

  describe('updateOnRampPurchase', () => {
    it('should call sendMessage with correct parameters', async () => {
      const mockSendMessage = vi.spyOn(portalEmitter as any, 'sendMessage');
      const mockResponse: PortalResponsePayload<'ONRAMPS__UPDATE_PURCHASE'> = {
        onRampPurchase: {} as any,
      };
      mockSendMessage.mockResolvedValue(mockResponse);

      const payload = { updates: { status: 'completed' } as any };
      const result = await portalEmitter.updateOnRampPurchase(payload);

      expect(mockSendMessage).toHaveBeenCalledWith({
        type: 'ONRAMPS__UPDATE_PURCHASE',
        payload,
      });
      expect(result).toBe(mockResponse);
    });
  });

  describe('signMoonPayUrl', () => {
    it('should call sendMessage with correct parameters', async () => {
      const mockSendMessage = vi.spyOn(portalEmitter as any, 'sendMessage');
      const mockResponse: PortalResponsePayload<'ONRAMPS__SIGN_MOONPAY_URL'> = {
        signature: 'test-signature',
      };
      mockSendMessage.mockResolvedValue(mockResponse);

      const payload = { url: 'https://moonpay.com/test' };
      const result = await portalEmitter.signMoonPayUrl(payload);

      expect(mockSendMessage).toHaveBeenCalledWith({
        type: 'ONRAMPS__SIGN_MOONPAY_URL',
        payload,
      });
      expect(result).toBe(mockResponse);
    });
  });

  describe('signWithdrawTx', () => {
    it('should call sendMessage with correct parameters', async () => {
      const mockSendMessage = vi.spyOn(portalEmitter as any, 'sendMessage');
      const mockResponse: PortalResponsePayload<'ONRAMPS__SIGN_DEPOSIT_TX'> = {
        txHash: '0x123',
        onRampPurchase: {} as any,
      };
      mockSendMessage.mockResolvedValue(mockResponse);

      const payload = {
        depositRequest: {
          destinationAddress: '0xabc',
          chainId: '1',
          contractAddress: '0xdef',
        } as any,
      };
      const result = await portalEmitter.signWithdrawTx(payload);

      expect(mockSendMessage).toHaveBeenCalledWith({
        type: 'ONRAMPS__SIGN_DEPOSIT_TX',
        payload,
      });
      expect(result).toBe(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle postMessage errors gracefully', async () => {
      mockPostMessage.mockImplementation(() => {
        throw new Error('postMessage failed');
      });

      const request = { type: 'ONRAMPS__INIT' as const };

      await expect(portalEmitter['sendMessage'](request)).rejects.toThrow('postMessage failed');
    });

    it('should handle MessageChannel creation errors', async () => {
      global.MessageChannel = vi.fn(() => {
        throw new Error('MessageChannel creation failed');
      }) as any;

      const request = { type: 'ONRAMPS__INIT' as const };

      await expect(portalEmitter['sendMessage'](request)).rejects.toThrow('MessageChannel creation failed');
    });
  });
});
