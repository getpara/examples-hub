import { describe, expect, it, vi, afterEach } from 'vitest';
import { SessionStorage } from '../src/SessionStorage.js';
import { mockGetItem, mockRemoveItem, mockSetItem } from './mocks/mockStorage.js';

const TEST_KEY = 'testPrefix/key';
const TEST_VALUE = 'testVal';
const TEST_KEY_1 = 'anotherTestPrefix/key';
const TEST_VALUE_1 = 'testVal1';

describe('SessionStorage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('constructor', () => {
    const sessionStorage = new SessionStorage();

    expect(sessionStorage).toBeInstanceOf(SessionStorage);
  });
  it('set, get & remove', () => {
    const sessionStorage = new SessionStorage();

    sessionStorage.set(TEST_KEY, TEST_VALUE);

    let value = sessionStorage.get(TEST_KEY);

    expect(value).toBe(TEST_VALUE);

    sessionStorage.removeItem(TEST_KEY);

    value = sessionStorage.get(TEST_KEY);

    expect(value).toBeNull();

    expect(mockGetItem).toBeCalledTimes(2);
    expect(mockSetItem).toBeCalledTimes(1);
    expect(mockRemoveItem).toBeCalledTimes(1);
  });
  it('set & clear', () => {
    const sessionStorage = new SessionStorage();

    sessionStorage.set(TEST_KEY, TEST_VALUE);
    sessionStorage.set(TEST_KEY_1, TEST_VALUE_1);

    let value = sessionStorage.get(TEST_KEY);
    let value1 = sessionStorage.get(TEST_KEY_1);

    expect(value).toBe(TEST_VALUE);
    expect(value1).toBe(TEST_VALUE_1);

    sessionStorage.clear('testPrefix');

    value = sessionStorage.get(TEST_KEY);
    value1 = sessionStorage.get(TEST_KEY_1);

    expect(value).toBeNull();
    expect(value1).toBe(TEST_VALUE_1);

    expect(mockGetItem).toBeCalledTimes(4);
    expect(mockSetItem).toBeCalledTimes(2);
    expect(mockRemoveItem).toBeCalledTimes(1);
  });
  it('set, get - no window', () => {
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      configurable: true,
    });

    const sessionStorage = new SessionStorage();

    sessionStorage.set(TEST_KEY, TEST_VALUE);

    const value = sessionStorage.get(TEST_KEY);

    expect(value).toBeNull();

    expect(mockGetItem).toBeCalledTimes(0);
    expect(mockSetItem).toBeCalledTimes(0);
  });
});
