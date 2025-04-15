import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dispatchEvent } from '../../src/utils/events';
import { ParaEvent } from '../../src/types';

describe('events utilities', () => {
  let dispatchEventSpy: any;

  // Mock CustomEvent
  class MockCustomEvent {
    type: string;
    detail: any;

    constructor(type: string, options: { detail: any }) {
      this.type = type;
      this.detail = options.detail;
    }
  }

  beforeEach(() => {
    // Save original global objects
    global.CustomEvent = MockCustomEvent as any;

    // Setup spies
    dispatchEventSpy = vi.fn();

    // Mock window.dispatchEvent
    Object.defineProperty(window, 'dispatchEvent', {
      value: dispatchEventSpy,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should dispatch event with data', () => {
    const eventType = ParaEvent.WALLET_CONNECTED;
    const data = { walletId: 'test-wallet-id' };

    dispatchEvent(eventType, data);

    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

    const event = dispatchEventSpy.mock.calls[0][0];
    expect(event).toBeInstanceOf(MockCustomEvent);
    expect(event.type).toBe(eventType);
    expect(event.detail).toEqual({ data });
  });

  it('should dispatch event with data and error', () => {
    const eventType = ParaEvent.WALLET_CONNECTION_FAILED;
    const data = { walletId: 'test-wallet-id' };
    const errorMessage = 'Connection failed';

    dispatchEvent(eventType, data, errorMessage);

    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

    const event = dispatchEventSpy.mock.calls[0][0];
    expect(event).toBeInstanceOf(MockCustomEvent);
    expect(event.type).toBe(eventType);
    expect(event.detail.data).toEqual(data);
    expect(event.detail.error).toBeInstanceOf(Error);
    expect(event.detail.error.message).toBe(errorMessage);
  });

  it('should not dispatch event if window.dispatchEvent is undefined', () => {
    // Mock window.dispatchEvent as undefined
    Object.defineProperty(window, 'dispatchEvent', {
      value: undefined,
      configurable: true,
    });

    const eventType = ParaEvent.WALLET_CONNECTED;
    const data = { walletId: 'test-wallet-id' };

    dispatchEvent(eventType, data);
    // No expect needed here as the test is just checking it doesn't throw
  });
});
