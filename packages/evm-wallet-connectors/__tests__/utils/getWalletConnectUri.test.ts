import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { emitWalletConnectUri } from '../../src/utils/getWalletConnectUri';

// Mock CustomEvent for the test environment
global.CustomEvent =
  global.CustomEvent ||
  class CustomEvent extends Event {
    detail: any;
    constructor(event: string, params: any) {
      super(event);
      this.detail = params.detail;
    }
  };

describe('emitWalletConnectUri', () => {
  let mockWindow: any;
  let originalWindow: any;
  let dispatchEventSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    // Mock window object
    originalWindow = global.window;
    dispatchEventSpy = vi.fn();
    mockWindow = {
      dispatchEvent: dispatchEventSpy,
    };
    global.window = mockWindow;

    // Mock console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  it('returns early when window is undefined', async () => {
    global.window = undefined as any;

    const connector: any = {
      type: 'coinbaseWallet',
      getProvider: vi.fn(),
    };

    await emitWalletConnectUri(connector);

    expect(connector.getProvider).not.toHaveBeenCalled();
  });

  it('emits event with qrUrl for coinbaseWallet', async () => {
    const mockProvider = {
      qrUrl: 'coinbase-qr-url',
      once: vi.fn(),
    };

    const connector: any = {
      type: 'coinbaseWallet',
      getProvider: vi.fn().mockResolvedValue(mockProvider),
    };

    await emitWalletConnectUri(connector);

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PARA_WALLETCONNECT_URI_READY',
        detail: 'coinbase-qr-url',
      }),
    );
  });

  it('emits qrUrl immediately but still sets up display_uri listener for coinbaseWallet', async () => {
    const mockProvider = {
      qrUrl: 'coinbase-qr-url',
      once: vi.fn((event: string, cb: (uri: string) => void) => {
        if (event === 'display_uri') {
          setTimeout(() => cb('display-uri'), 10);
        }
      }),
    };

    const connector: any = {
      type: 'coinbaseWallet',
      getProvider: vi.fn().mockResolvedValue(mockProvider),
    };

    await emitWalletConnectUri(connector);

    // Wait for potential display_uri callback
    await new Promise(resolve => setTimeout(resolve, 20));

    // Should have been called twice: once for qrUrl, once for display_uri
    expect(dispatchEventSpy).toHaveBeenCalledTimes(2);
    expect(dispatchEventSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        type: 'PARA_WALLETCONNECT_URI_READY',
        detail: 'coinbase-qr-url',
      }),
    );
    expect(dispatchEventSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: 'PARA_WALLETCONNECT_URI_READY',
        detail: 'display-uri',
      }),
    );
  });

  it('handles coinbaseWallet without qrUrl but with display_uri support', async () => {
    const mockProvider = {
      once: vi.fn((event: string, cb: (uri: string) => void) => {
        if (event === 'display_uri') {
          setTimeout(() => cb('fallback-uri'), 0);
        }
      }),
    };

    const connector: any = {
      type: 'coinbaseWallet',
      getProvider: vi.fn().mockResolvedValue(mockProvider),
    };

    await emitWalletConnectUri(connector);

    // Wait for async callback
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PARA_WALLETCONNECT_URI_READY',
        detail: 'fallback-uri',
      }),
    );
  });

  it('emits uri from display_uri event using once method', async () => {
    const mockProvider = {
      once: vi.fn((event: string, cb: (uri: string) => void) => {
        if (event === 'display_uri') {
          setTimeout(() => cb('wc-uri'), 0);
        }
      }),
    };

    const connector: any = {
      type: 'walletConnect',
      getProvider: vi.fn().mockResolvedValue(mockProvider),
    };

    await emitWalletConnectUri(connector);

    // Wait for async callback
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockProvider.once).toHaveBeenCalledWith('display_uri', expect.any(Function));
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PARA_WALLETCONNECT_URI_READY',
        detail: 'wc-uri',
      }),
    );
  });

  it('falls back to on method when once is not available', async () => {
    const mockProvider = {
      on: vi.fn((event: string, cb: (uri: string) => void) => {
        if (event === 'display_uri') {
          setTimeout(() => cb('wc-uri-on'), 0);
        }
      }),
    };

    const connector: any = {
      type: 'walletConnect',
      getProvider: vi.fn().mockResolvedValue(mockProvider),
    };

    await emitWalletConnectUri(connector);

    // Wait for async callback
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockProvider.on).toHaveBeenCalledWith('display_uri', expect.any(Function));
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PARA_WALLETCONNECT_URI_READY',
        detail: 'wc-uri-on',
      }),
    );
  });

  it('applies uriConverter if provided', async () => {
    const mockProvider = {
      once: vi.fn((event: string, cb: (uri: string) => void) => {
        if (event === 'display_uri') {
          setTimeout(() => cb('original-uri'), 0);
        }
      }),
    };

    const connector: any = {
      type: 'walletConnect',
      getProvider: vi.fn().mockResolvedValue(mockProvider),
    };

    const uriConverter = (uri: string) => `converted:${uri}`;

    await emitWalletConnectUri(connector, uriConverter);

    // Wait for async callback
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PARA_WALLETCONNECT_URI_READY',
        detail: 'converted:original-uri',
      }),
    );
  });

  it('throws error when provider is undefined', async () => {
    const connector: any = {
      type: 'walletConnect',
      getProvider: vi.fn().mockResolvedValue(undefined),
    };

    await expect(emitWalletConnectUri(connector)).rejects.toThrow('display_uri event not supported for this connector');
  });

  it('throws error when provider is null', async () => {
    const connector: any = {
      type: 'walletConnect',
      getProvider: vi.fn().mockResolvedValue(null),
    };

    await expect(emitWalletConnectUri(connector)).rejects.toThrow('display_uri event not supported for this connector');
  });

  it('throws error when provider has no once or on methods', async () => {
    const connector: any = {
      type: 'walletConnect',
      getProvider: vi.fn().mockResolvedValue({}),
    };

    await expect(emitWalletConnectUri(connector)).rejects.toThrow('display_uri event not supported for this connector');
  });

  it('handles connector without getProvider method', async () => {
    const connector: any = {
      type: 'walletConnect',
    };

    await expect(emitWalletConnectUri(connector)).rejects.toThrow('display_uri event not supported for this connector');
  });

  it('sets up timeout that would log error when display_uri event is not emitted', async () => {
    // Since we can't easily test the timeout behavior with vitest,
    // we'll test that setTimeout is called with the correct parameters
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

    const mockProvider = {
      once: vi.fn(), // Never calls the callback
    };

    const connector: any = {
      type: 'walletConnect',
      getProvider: vi.fn().mockResolvedValue(mockProvider),
    };

    await emitWalletConnectUri(connector);

    // Verify that setTimeout was called with the console.error function and 10_000ms delay
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 10_000);

    // Test that the timeout function would log the error by calling it directly
    const timeoutFunction = setTimeoutSpy.mock.calls[0][0] as () => void;
    timeoutFunction();

    expect(consoleErrorSpy).toHaveBeenCalledWith('display_uri event not emitted');

    setTimeoutSpy.mockRestore();
  });

  it('clears timeout when display_uri is emitted in time', async () => {
    // Spy on clearTimeout to verify it gets called when the event is emitted
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const mockProvider = {
      once: vi.fn((event: string, cb: (uri: string) => void) => {
        if (event === 'display_uri') {
          // Emit synchronously so it happens immediately
          cb('quick-uri');
        }
      }),
    };

    const connector: any = {
      type: 'walletConnect',
      getProvider: vi.fn().mockResolvedValue(mockProvider),
    };

    await emitWalletConnectUri(connector);

    // Timeout should have been cleared, so clearTimeout should be called
    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PARA_WALLETCONNECT_URI_READY',
        detail: 'quick-uri',
      }),
    );

    clearTimeoutSpy.mockRestore();
  });
});
