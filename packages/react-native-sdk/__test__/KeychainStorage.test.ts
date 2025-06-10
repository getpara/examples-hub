import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import { mockKeychainStorage } from './mocks/mockKeychainStorage';

vi.mock('react-native-keychain', () => ({
  default: mockKeychainStorage,
}));

import { KeychainStorage } from '../src/KeychainStorage';

describe('KeychainStorage', () => {
  let storage: KeychainStorage;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    mockKeychainStorage.clear();
    storage = new KeychainStorage();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  /* ──────────────────────────────── Happy-path ──────────────────────────────── */

  it('set → stores item and calls setGenericPassword with correct args', async () => {
    await storage.set('key', 'value');
    expect(mockKeychainStorage.setGenericPassword).toHaveBeenCalledWith('@CAPSULE', 'value', {
      service: 'key',
      accessible: mockKeychainStorage.ACCESSIBLE.WHEN_UNLOCKED,
      securityLevel: mockKeychainStorage.SECURITY_LEVEL.ANY,
      storage: mockKeychainStorage.STORAGE_TYPE.AES_GCM_NO_AUTH,
    });
  });

  it('get → returns stored value', async () => {
    await storage.set('key', 'value');
    const result = await storage.get('key');
    expect(result).toBe('value');
    expect(mockKeychainStorage.getGenericPassword).toHaveBeenCalledWith({ service: 'key' });
  });

  it('get → returns null when item is missing', async () => {
    const result = await storage.get('missing');
    expect(result).toBeNull();
  });

  it('removeItem → calls resetGenericPassword', async () => {
    await storage.removeItem('key');
    expect(mockKeychainStorage.resetGenericPassword).toHaveBeenCalledWith({ service: 'key' });
  });

  it('clear → removes only items with the prefix', async () => {
    await storage.set('prefix_one', '1');
    await storage.set('other', '1');
    await storage.set('prefix_two', '1');
    mockKeychainStorage.getAllGenericPasswordServices.mockResolvedValue(['prefix_one', 'other', 'prefix_two']);

    await storage.clear('prefix_');

    expect(mockKeychainStorage.resetGenericPassword).toHaveBeenCalledWith({ service: 'prefix_one' });
    expect(mockKeychainStorage.resetGenericPassword).toHaveBeenCalledWith({ service: 'prefix_two' });
    expect(mockKeychainStorage.resetGenericPassword).not.toHaveBeenCalledWith({ service: 'other' });
  });

  /* ───────────────────────────── Branch / error paths ───────────────────────────── */

  it('set → warns when underlying storage returns false', async () => {
    mockKeychainStorage.setGenericPassword.mockResolvedValue(false);
    await storage.set('key', 'value');
    expect(warnSpy).toHaveBeenCalledWith('Failed to store key key');
  });

  it('set → warns on exception', async () => {
    mockKeychainStorage.setGenericPassword.mockRejectedValue(new Error('boom'));
    await storage.set('key', 'value');
    expect(warnSpy).toHaveBeenCalledWith('Error storing key key:', expect.any(Error));
  });

  it('get → warns and returns null on error', async () => {
    mockKeychainStorage.getGenericPassword.mockRejectedValue(new Error('Some error'));
    const result = await storage.get('key');
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith('Error retrieving stored item:', expect.any(Error));
  });

  it('removeItem → warns on error', async () => {
    mockKeychainStorage.resetGenericPassword.mockRejectedValue(new Error('boom'));
    await storage.removeItem('key');
    expect(warnSpy).toHaveBeenCalledWith('Error removing key key:', expect.any(Error));
  });

  it('clear → warns if getAllGenericPasswordServices fails', async () => {
    mockKeychainStorage.getAllGenericPasswordServices.mockRejectedValue(new Error('boom'));
    await storage.clear('prefix_');
    expect(warnSpy).toHaveBeenCalledWith('Error getting services for prefix prefix_:', expect.any(Error));
  });

  it('clear → continues if resetGenericPassword for one key fails', async () => {
    mockKeychainStorage.getAllGenericPasswordServices.mockResolvedValue(['prefix_a', 'prefix_b']);
    mockKeychainStorage.resetGenericPassword
      .mockRejectedValueOnce(new Error('first key failed'))
      .mockResolvedValueOnce(true);

    await storage.clear('prefix_');

    expect(mockKeychainStorage.resetGenericPassword).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledWith('Error clearing key prefix_a:', expect.any(Error));
  });
});
