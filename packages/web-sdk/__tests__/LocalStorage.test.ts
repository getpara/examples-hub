import { describe, expect, it, vi, afterEach } from 'vitest';
import { LocalStorage } from '../src/LocalStorage.js';
import { mockGetItem, mockRemoveItem, mockSetItem } from './mocks/mockStorage.js';

const TEST_KEY = 'testPrefix/key';
const TEST_VALUE = 'testVal';
const TEST_KEY_1 = 'anotherTestPrefix/key';
const TEST_VALUE_1 = 'testVal1';

describe('LocalStorage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('constructor', () => {
    const localStorage = new LocalStorage();

    expect(localStorage).toBeInstanceOf(LocalStorage);
  });
  it('set, get & remove', () => {
    const localStorage = new LocalStorage();

    localStorage.set(TEST_KEY, TEST_VALUE);

    let value = localStorage.get(TEST_KEY);

    expect(value).toBe(TEST_VALUE);

    localStorage.removeItem(TEST_KEY);

    value = localStorage.get(TEST_KEY);

    expect(value).toBeNull();

    expect(mockGetItem).toBeCalledTimes(2);
    expect(mockSetItem).toBeCalledTimes(1);
    expect(mockRemoveItem).toBeCalledTimes(1);
  });
  it('set & clear', () => {
    const localStorage = new LocalStorage();

    localStorage.set(TEST_KEY, TEST_VALUE);
    localStorage.set(TEST_KEY_1, TEST_VALUE_1);

    let value = localStorage.get(TEST_KEY);
    let value1 = localStorage.get(TEST_KEY_1);

    expect(value).toBe(TEST_VALUE);
    expect(value1).toBe(TEST_VALUE_1);

    localStorage.clear('testPrefix');

    value = localStorage.get(TEST_KEY);
    value1 = localStorage.get(TEST_KEY_1);

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

    const localStorage = new LocalStorage();

    localStorage.set(TEST_KEY, TEST_VALUE);

    const value = localStorage.get(TEST_KEY);

    expect(value).toBeNull();

    expect(mockGetItem).toBeCalledTimes(0);
    expect(mockSetItem).toBeCalledTimes(0);
  });
});
