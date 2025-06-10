import { vi, beforeEach, describe, expect, it, afterEach } from 'vitest';
import { mockAsyncStorage } from './mocks/mockAsyncStorage';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: mockAsyncStorage,
}));

import { AsyncStorage } from '../src/AsyncStorage';

describe('AsyncStorage util', () => {
  let storage: AsyncStorage;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.resetAllMocks();
    await mockAsyncStorage.clear();
    storage = new AsyncStorage();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('set → persists value and setItem is called with the same key/value', async () => {
    await storage.set('key', 'value');
    const persisted = await storage.get('key');
    expect(persisted).toBe('value');
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('key', 'value');
  });

  it('get → returns the stored value', async () => {
    mockAsyncStorage.getItem.mockResolvedValue('value');
    const result = await storage.get('key');
    expect(result).toBe('value');
    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('key');
  });

  it('removeItem → removeItem is called with the key', async () => {
    await storage.removeItem('key');
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('key');
  });

  it('clear → removes only keys that start with the prefix and leaves others intact', async () => {
    await mockAsyncStorage.setItem('prefix_a', '1');
    await mockAsyncStorage.setItem('other', '1');
    await mockAsyncStorage.setItem('prefix_b', '1');
    mockAsyncStorage.getAllKeys.mockResolvedValue(['prefix_a', 'other', 'prefix_b']);

    await storage.clear('prefix_');

    expect(mockAsyncStorage.removeItem).toHaveBeenCalledTimes(2);
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('prefix_a');
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('prefix_b');
    expect(mockAsyncStorage.removeItem).not.toHaveBeenCalledWith('other');
    const untouched = await storage.get('other');
    expect(untouched).toBe('1');
  });

  it('get → on error returns null and warns', async () => {
    mockAsyncStorage.getItem.mockRejectedValue(new Error('boom'));
    const result = await storage.get('key');
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith('Error retrieving stored item:', expect.any(Error));
  });

  it('set → on error warns', async () => {
    mockAsyncStorage.setItem.mockRejectedValue(new Error('boom'));
    await storage.set('key', 'value');
    expect(warnSpy).toHaveBeenCalledWith('Error storing key key:', expect.any(Error));
  });

  it('removeItem → on error warns', async () => {
    mockAsyncStorage.removeItem.mockRejectedValue(new Error('boom'));
    await storage.removeItem('key');
    expect(warnSpy).toHaveBeenCalledWith('Error removing key key:', expect.any(Error));
  });

  it('clear → warns if getAllKeys fails', async () => {
    mockAsyncStorage.getAllKeys.mockRejectedValue(new Error('boom'));
    await storage.clear('prefix_');
    expect(warnSpy).toHaveBeenCalledWith('Error getting keys for prefix prefix_:', expect.any(Error));
  });

  it('clear → continues if removeItem for one key fails', async () => {
    mockAsyncStorage.getAllKeys.mockResolvedValue(['prefix_a', 'prefix_b']);
    mockAsyncStorage.removeItem.mockRejectedValueOnce(new Error('first key failed')).mockResolvedValueOnce(undefined);

    await storage.clear('prefix_');

    expect(mockAsyncStorage.removeItem).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledWith('Error clearing key prefix_a:', expect.any(Error));
  });
});
