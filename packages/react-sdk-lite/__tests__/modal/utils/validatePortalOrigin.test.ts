import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Ctx, Environment, getPortalBaseURL } from '@getpara/web-sdk';
import { validatePortalOrigin } from '../../../src/modal/utils/validatePortalOrigin';

// Mock the getPortalBaseURL function
vi.mock('@getpara/web-sdk', async () => {
  const actual = await vi.importActual('@getpara/web-sdk');
  return {
    ...actual,
    getPortalBaseURL: vi.fn(),
  };
});

const mockGetPortalBaseURL = vi.mocked(getPortalBaseURL);

describe('validatePortalOrigin', () => {
  const mockCtx: Ctx = {
    env: Environment.DEV,
    apiKey: 'test-api-key',
    client: {} as any,
    disableWebSockets: false,
  };

  const createMockMessageEvent = (origin: string): MessageEvent => {
    return {
      origin,
      data: {},
      source: null,
      ports: [],
      type: 'message',
      bubbles: false,
      cancelable: false,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: false,
      returnValue: true,
      srcElement: null,
      target: null,
      currentTarget: null,
      timeStamp: Date.now(),
      cancelBubble: false,
      composed: false,
      lastEventId: '',
      userActivation: null,
      initEvent: vi.fn(),
      initMessageEvent: vi.fn(),
      preventDefault: vi.fn(),
      stopImmediatePropagation: vi.fn(),
      stopPropagation: vi.fn(),
      composedPath: vi.fn(() => []),
      AT_TARGET: 2,
      BUBBLING_PHASE: 3,
      CAPTURING_PHASE: 1,
      NONE: 0,
    } as unknown as MessageEvent;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when origin matches portal base URL', () => {
    const portalBase = 'https://app.getpara.com';
    const portalLocalBase = 'http://localhost:3003';

    mockGetPortalBaseURL.mockReturnValueOnce(portalBase).mockReturnValueOnce(portalLocalBase);

    const event = createMockMessageEvent(portalBase);
    const result = validatePortalOrigin(event, mockCtx);

    expect(result).toBe(true);
    expect(mockGetPortalBaseURL).toHaveBeenCalledTimes(2);
    expect(mockGetPortalBaseURL).toHaveBeenNthCalledWith(1, mockCtx);
    expect(mockGetPortalBaseURL).toHaveBeenNthCalledWith(2, mockCtx, true);
  });

  it('should return true when origin matches portal local base URL', () => {
    const portalBase = 'https://app.getpara.com';
    const portalLocalBase = 'http://localhost:3003';

    mockGetPortalBaseURL.mockReturnValueOnce(portalBase).mockReturnValueOnce(portalLocalBase);

    const event = createMockMessageEvent(portalLocalBase);
    const result = validatePortalOrigin(event, mockCtx);

    expect(result).toBe(true);
    expect(mockGetPortalBaseURL).toHaveBeenCalledTimes(2);
    expect(mockGetPortalBaseURL).toHaveBeenNthCalledWith(1, mockCtx);
    expect(mockGetPortalBaseURL).toHaveBeenNthCalledWith(2, mockCtx, true);
  });

  it('should return false when origin does not match either portal URL', () => {
    const portalBase = 'https://app.getpara.com';
    const portalLocalBase = 'http://localhost:3003';
    const untrustedOrigin = 'https://malicious.com';

    mockGetPortalBaseURL.mockReturnValueOnce(portalBase).mockReturnValueOnce(portalLocalBase);

    const event = createMockMessageEvent(untrustedOrigin);
    const result = validatePortalOrigin(event, mockCtx);

    expect(result).toBe(false);
    expect(mockGetPortalBaseURL).toHaveBeenCalledTimes(2);
    expect(mockGetPortalBaseURL).toHaveBeenNthCalledWith(1, mockCtx);
    expect(mockGetPortalBaseURL).toHaveBeenNthCalledWith(2, mockCtx, true);
  });

  it('should handle different environment configurations', () => {
    const prodCtx: Ctx = {
      ...mockCtx,
      env: Environment.PROD,
    };

    const portalBase = 'https://app.getpara.com';
    const portalLocalBase = 'http://127.0.0.1:3003';

    mockGetPortalBaseURL.mockReturnValueOnce(portalBase).mockReturnValueOnce(portalLocalBase);

    const event = createMockMessageEvent(portalBase);
    const result = validatePortalOrigin(event, prodCtx);

    expect(result).toBe(true);
    expect(mockGetPortalBaseURL).toHaveBeenCalledWith(prodCtx);
    expect(mockGetPortalBaseURL).toHaveBeenCalledWith(prodCtx, true);
  });

  it('should handle sandbox environment', () => {
    const sandboxCtx: Ctx = {
      ...mockCtx,
      env: Environment.SANDBOX,
    };

    const portalBase = 'https://app.sandbox.getpara.com';
    const portalLocalBase = 'http://localhost:3003';

    mockGetPortalBaseURL.mockReturnValueOnce(portalBase).mockReturnValueOnce(portalLocalBase);

    const event = createMockMessageEvent(portalBase);
    const result = validatePortalOrigin(event, sandboxCtx);

    expect(result).toBe(true);
    expect(mockGetPortalBaseURL).toHaveBeenCalledWith(sandboxCtx);
    expect(mockGetPortalBaseURL).toHaveBeenCalledWith(sandboxCtx, true);
  });

  it('should handle empty or null origin', () => {
    const portalBase = 'https://app.getpara.com';
    const portalLocalBase = 'http://localhost:3003';

    mockGetPortalBaseURL.mockReturnValueOnce(portalBase).mockReturnValueOnce(portalLocalBase);

    const event = createMockMessageEvent('');
    const result = validatePortalOrigin(event, mockCtx);

    expect(result).toBe(false);
  });

  it('should be case sensitive for origin matching', () => {
    const portalBase = 'https://app.getpara.com';
    const portalLocalBase = 'http://localhost:3003';

    mockGetPortalBaseURL.mockReturnValueOnce(portalBase).mockReturnValueOnce(portalLocalBase);

    // Test with different case
    const event = createMockMessageEvent('HTTPS://APP.GETPARA.COM');
    const result = validatePortalOrigin(event, mockCtx);

    expect(result).toBe(false);
  });
});
